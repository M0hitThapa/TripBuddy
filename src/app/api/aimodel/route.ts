import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  maxRetries: 3,
  timeout: 90000,
});

const QUESTION_PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by asking one relevant trip-related question at a time.

IMPORTANT: First, analyze the user's initial message to see what information they've already provided. Only ask about missing information.

Required information to collect (in this order):
1. Starting location (source)
2. Destination city or country  
3. Group size (Solo, Couple, Family, Friends)
4. Budget (Low, Medium, High)
5. Travel dates (from and to). When asking for this, set ui to "dateRange"
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation). When asking for this, set ui to "travelInterest"
7. Special requirements or preferences (if any)

Smart Analysis Rules:
- If user says "trip to [destination]" or "plan [destination]" - destination is provided
- If user mentions "from [location] to [destination]" - both source and destination provided
- If user says "solo trip", "couple trip", "family trip", "with friends" - group size provided
- If user mentions "$X budget", "cheap", "luxury", "budget-friendly" - budget info provided
- If user mentions specific dates, months, or duration - travel dates provided
- If user mentions activities like "adventure", "beach", "cultural", "food tour" - interests provided

Response Rules:
- Never ask the same question twice
- Ask exactly ONE question at a time for missing information only
- Keep questions short and specific
- Use appropriate UI components: budget/groupSize/dateRange/travelInterest
- Always respond with JSON: {"resp": "your question here", "ui": "component_name_or_empty"}

Once all information is collected, respond with: {"resp": "Perfect! Let me create your detailed itinerary.", "ui": "Final"}`;

const FINAL_PROMPT = `You are creating a detailed trip itinerary based on all the information provided by the user. Create a comprehensive, realistic, and engaging travel plan.

Generate a STRICT JSON object with this exact schema:
{
  "resp": "Brief friendly summary of the planned trip (2-3 sentences)",
  "ui": "Final",
  "budget": {
    "currency": "USD",
    "total": 1234,
    "breakdown": [
      {
        "day": 1,
        "total": 456,
        "hotels": [{"name": "Hotel Name", "price": 200}],
        "activities": [{"name": "Activity Name", "price": 50}]
      }
    ]
  },
  "itinerary": [
    {
      "day": 1,
      "title": "Descriptive Day Title",
      "morning": "Detailed morning activities with specific places and times",
      "afternoon": "Detailed afternoon activities with specific places and times", 
      "evening": "Detailed evening activities with specific places and times",
      "notes": "Helpful tips, recommendations, or important information",
      "weather": {
        "summary": "Expected weather conditions",
        "tips": "What to wear or bring based on weather"
      },
      "cafes": ["Local cafe recommendations"],
      "hotels": ["Hotel recommendations for the area"],
      "adventures": ["Adventure/activity options"],
      "cafeDetails": [{"name": "Cafe Name", "description": "What makes this cafe special"}],
      "hotelDetails": [{"name": "Hotel Name", "description": "Hotel features and why it's recommended"}],
      "adventureDetails": [{"name": "Activity Name", "description": "Activity details and why it's worth doing"}]
    }
  ]
}

Budget Guidelines:
- Low Budget: Focus on hostels, street food, free attractions, local transport
- Medium Budget: Mid-range hotels, mix of restaurants, paid attractions, some tours
- High Budget: Luxury hotels, fine dining, premium experiences, private transport

Make the itinerary realistic, well-paced, and tailored to the user's interests and group type.`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages required" },
        { status: 400 }
      );
    }

    // Updated model list with more reliable options
    const modelFallbacks = [
      "openai/gpt-4o-mini",
      "openai/gpt-4o",
      "openai/gpt-3.5-turbo",
      "anthropic/claude-3-haiku",
      "meta-llama/llama-3.1-8b-instruct:free",
    ];

    // Enhanced logic to detect when to generate final itinerary
    const lastUserMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";
    const conversationContent = messages
      .map((m) => m.content?.toLowerCase() || "")
      .join(" ");

    const shouldGenerateFinal =
      lastUserMessage.includes("requirements") ||
      lastUserMessage.includes("preferences") ||
      lastUserMessage.includes("adventure") ||
      lastUserMessage.includes("sightseeing") ||
      lastUserMessage.includes("cultural") ||
      lastUserMessage.includes("food") ||
      lastUserMessage.includes("nightlife") ||
      lastUserMessage.includes("relaxation") ||
      lastUserMessage.includes("beach") ||
      lastUserMessage.includes("nature") ||
      lastUserMessage.includes("history") ||
      // Check if conversation has covered most required info
      (conversationContent.includes("budget") &&
        conversationContent.includes("group") &&
        conversationContent.includes("destination") &&
        messages.length > 8) ||
      messages.length > 14; // Fallback for long conversations

    const errors: any[] = [];

    for (const model of modelFallbacks) {
      try {
        const recent = messages.slice(-20); // Keep more context for better understanding

        const completion = await openai.chat.completions.create({
          model,
          response_format: { type: "json_object" },
          temperature: shouldGenerateFinal ? 0.1 : 0.3,
          top_p: 0.9,
          max_tokens: shouldGenerateFinal ? 3000 : 1000, // Increased for richer content
          presence_penalty: 0,
          frequency_penalty: 0.1,
          messages: [
            {
              role: "system",
              content: shouldGenerateFinal ? FINAL_PROMPT : QUESTION_PROMPT,
            },
            ...recent,
          ],
        });

        const choice = completion?.choices?.[0]?.message;
        const raw = choice?.content ?? "";

        if (!raw.trim()) {
          errors.push({ model, error: "empty_response" });
          continue;
        }

        let parsed: any;
        try {
          parsed = JSON.parse(raw);
        } catch (err) {
          // Enhanced JSON extraction with multiple strategies
          try {
            // Strategy 1: Extract from code blocks
            const codeBlockMatch = raw.match(
              /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
            );
            if (codeBlockMatch) {
              parsed = JSON.parse(codeBlockMatch[1]);
            } else {
              // Strategy 2: Find complete JSON object
              const start = raw.indexOf("{");
              if (start === -1) throw new Error("no_json_start");

              let braceCount = 0;
              let end = -1;
              let inString = false;
              let escapeNext = false;

              for (let i = start; i < raw.length; i++) {
                const char = raw[i];

                if (escapeNext) {
                  escapeNext = false;
                  continue;
                }

                if (char === "\\") {
                  escapeNext = true;
                  continue;
                }

                if (char === '"') {
                  inString = !inString;
                  continue;
                }

                if (!inString) {
                  if (char === "{") braceCount++;
                  else if (char === "}") {
                    braceCount--;
                    if (braceCount === 0) {
                      end = i;
                      break;
                    }
                  }
                }
              }

              if (end === -1) throw new Error("no_json_end");

              const jsonStr = raw.slice(start, end + 1);
              parsed = JSON.parse(jsonStr);
            }
          } catch (e2) {
            errors.push({
              model,
              error: "invalid_json",
              raw: raw?.slice?.(0, 800),
              parseError: e2 instanceof Error ? e2.message : "unknown",
              shouldGenerateFinal,
            });
            continue;
          }
        }

        if (!parsed || typeof parsed !== "object") {
          errors.push({ model, error: "invalid_object", raw: parsed });
          continue;
        }

        // Normalize empty ui
        if (parsed.ui === "") parsed.ui = undefined;

        // Enhanced validation
        const hasResp =
          typeof parsed.resp === "string" && parsed.resp.length > 0;
        const isFinal = parsed.ui === "Final";
        const hasItinerary =
          Array.isArray(parsed.itinerary) && parsed.itinerary.length > 0;
        const hasBudget = parsed.budget && typeof parsed.budget === "object";

        if (isFinal) {
          if (hasResp && hasItinerary && hasBudget) {
            // Additional validation for final response quality
            const firstDay = parsed.itinerary[0];
            const hasRequiredFields =
              firstDay &&
              firstDay.title &&
              firstDay.morning &&
              firstDay.afternoon &&
              firstDay.evening;

            if (hasRequiredFields) {
              return NextResponse.json(parsed);
            } else {
              errors.push({
                model,
                error: "incomplete_itinerary_structure",
                missingFields: {
                  title: !firstDay?.title,
                  morning: !firstDay?.morning,
                  afternoon: !firstDay?.afternoon,
                  evening: !firstDay?.evening,
                },
              });
              continue;
            }
          } else {
            errors.push({
              model,
              error: "missing_final_fields",
              hasResp,
              hasItinerary,
              hasBudget,
              raw: JSON.stringify(parsed).slice(0, 500),
            });
            continue;
          }
        } else {
          if (hasResp) {
            return NextResponse.json(parsed);
          } else {
            errors.push({
              model,
              error: "missing_resp_field",
              raw: JSON.stringify(parsed).slice(0, 500),
            });
            continue;
          }
        }
      } catch (err: any) {
        const message =
          err?.error?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "unknown_error";
        const status = err?.status || err?.response?.status;

        errors.push({
          model,
          error: message,
          status,
          type: err?.name || "unknown",
        });

        // Break on certain error types
        if (
          message.includes("timeout") ||
          message.includes("abort") ||
          message.includes("rate limit")
        ) {
          break;
        }

        continue;
      }
    }

    // Enhanced error reporting
    console.error("All models failed:", errors);

    return NextResponse.json(
      {
        error: "All model fallbacks failed",
        details: errors.slice(0, 3), // Limit error details
        shouldGenerateFinal,
        debugInfo: {
          messageCount: messages.length,
          lastMessage: messages[messages.length - 1]?.content?.slice(0, 100),
          conversationLength: messages.length,
        },
      },
      { status: 502 }
    );
  } catch (e: any) {
    const message =
      typeof e?.message === "string" ? e.message : "Unknown server error";
    const status = /timeout/i.test(message) ? 504 : 500;
    console.error("API route error:", e);
    return NextResponse.json(
      {
        error: message,
        stack: process.env.NODE_ENV === "development" ? e?.stack : undefined,
      },
      { status }
    );
  }
}
