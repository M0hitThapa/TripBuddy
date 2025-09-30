import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  maxRetries: 2,
  timeout: 60000, // 60s instead of 90s for faster response
});

const QUESTION_PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by asking one relevant trip-related question at a time.

Tone & Style:
- Be friendly, light, and conversational. Keep it human and fun without being silly.
- Use short, clear sentences. Sound like a helpful travel buddy.
- Avoid sharing assumptions; just ask for missing info.
- Feel free to use light emojis sparingly (e.g., ✈️, 🌅, 🧭) for warmth.
- Use contractions (you're, let's) and vary phrasing. One sentence or two max.

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
- IMPORTANT: You MUST ask about travel interests (step 6) before generating the final itinerary. Do not skip this step.

Once all information is collected (including travel interests), respond with: {"resp": "Perfect! Let me create your detailed itinerary.", "ui": "Final"}`;

const FINAL_PROMPT = `You are creating a detailed trip itinerary based on all the information provided by the user. Create a comprehensive, realistic, and engaging travel plan.

Tone & Style for the response:
- Be friendly, enthusiastic, and human. Keep it fun and encouraging, like a travel buddy.
- Use approachable language and short paragraphs. Avoid robotic tone.
- In "resp", write 2–3 lively sentences that summarize the trip vibe and what to expect.
- Keep everything factual and helpful; do not invent extreme claims.
- It's okay to sprinkle a couple of light emojis (max 2) in "resp" to make it feel welcoming.
- Use contractions and varied sentence openings to avoid stiffness.

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
      "title": "Descriptive Day Title (REQUIRED)",
      "morning": "Detailed morning activities with specific places and times (REQUIRED - 2-3 sentences)",
      "afternoon": "Detailed afternoon activities with specific places and times (REQUIRED - 2-3 sentences)", 
      "evening": "Detailed evening activities with specific places and times (REQUIRED - 2-3 sentences)",
      "notes": "Helpful tips, recommendations, or important information (OPTIONAL)",
      "weather": {
        "summary": "Expected weather conditions",
        "tips": "What to wear or bring based on weather"
      },
      "cafeDetails": [{"name": "Specific Cafe Name", "description": "What makes this cafe special"}],
      "hotelDetails": [{"name": "Specific Hotel Name", "description": "Hotel features and why it's recommended"}],
      "adventureDetails": [{"name": "Specific Activity/Place Name", "description": "Activity details and why it's worth doing"}]
    },
    {
      "day": 2,
      "title": "Another Unique Day Title",
      "morning": "Different morning activities...",
      "afternoon": "Different afternoon activities...",
      "evening": "Different evening activities...",
      "cafeDetails": [{"name": "Another Cafe", "description": "Why visit"}],
      "hotelDetails": [{"name": "Another Hotel", "description": "Features"}]
    }
  ]
}

CRITICAL REQUIREMENTS - READ CAREFULLY:
1. Every single day in the itinerary array MUST have these 4 fields:
   - title (unique, descriptive, 5-10 words)
   - morning (2-3 sentences with specific places and activities)
   - afternoon (2-3 sentences with specific places and activities)
   - evening (2-3 sentences with specific places and activities)

2. MANDATORY: Generate EXACTLY the number of days requested by the user. If they want 5 days, you MUST provide 5 complete days.

3. Do NOT leave ANY day incomplete. Generate complete information for ALL days from day 1 to the last day.

4. If you're approaching token limits, keep descriptions concise but ALWAYS complete all required fields for ALL days. 
   - RECOMMENDED: Include cafeDetails, hotelDetails, and adventureDetails with real place names when possible (helps with maps/photos).
   - If space is tight, skip weather and notes first, but try to include at least 1-2 places per category.

5. Never stop mid-generation. It's better to have shorter descriptions for all days than detailed descriptions for only some days.

6. VALIDATION: Before finishing, count your itinerary days and ensure it matches the trip duration. If the user wants a 5-day trip, your itinerary array MUST have exactly 5 complete day objects.

Budget Guidelines:
- Low Budget: Focus on hostels, street food, free attractions, local transport
- Medium Budget: Mid-range hotels, mix of restaurants, paid attractions, some tours
- High Budget: Luxury hotels, fine dining, premium experiences, private transport

Make the itinerary realistic, well-paced, and tailored to the user's interests and group type.

Hard Constraints for quality and uniqueness:
- Each day MUST be unique. Do not repeat titles or the same activities across different days.
- Vary neighborhoods/areas and points of interest across days.
- Use real-seeming places for the destination; avoid generic placeholders like "Local Cafe".
- Ensure the budget.breakdown array length equals the itinerary length; totals should be reasonable and consistent per day.
- Avoid duplication across days; provide diverse morning/afternoon/evening plans.
- EVERY day must have complete title, morning, afternoon, and evening fields. No empty or missing fields allowed.
- If you run out of token space, prioritize completing all required fields (title, morning, afternoon, evening) for every day before adding optional fields.`;

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

    // Optimized model list: fastest models first
    const modelFallbacks = [
      "openai/gpt-4o-mini", // Fastest, most cost-effective
      "openai/gpt-3.5-turbo",
      "anthropic/claude-3-haiku", // Fast fallback
    ];

    // Enhanced logic to detect when to generate final itinerary

    const conversationContent = messages
      .map((m) => m.content?.toLowerCase() || "")
      .join(" ");

    // Heuristic checks for structured info the UI sends or user provides
    const hasDates = /travel dates:\s*from\s*\d{4}-\d{2}-\d{2}\s*to\s*\d{4}-\d{2}-\d{2}/i.test(conversationContent)
    const hasGroup = /(group size|solo|couple|family|friends)/i.test(conversationContent)
    const hasBudget = /(budget|low budget|medium budget|high budget|low\b|medium\b|high\b)/i.test(conversationContent)
    const hasDestination = /(destination\s*:|trip to\s+\w|to\s+[A-Z][a-zA-Z]+)/i.test(conversationContent)
    const hasSource = /(from\s+[A-Z][a-zA-Z]+|source\s*:)/i.test(conversationContent)
    // Check if interests were explicitly provided (UI sends "Travel interests:" or user mentions multiple activities)
    const hasInterests = /(travel interests:|adventure.*sightseeing|cultural.*food|nightlife.*relaxation)/i.test(conversationContent) ||
      (/(adventure|sightseeing|cultural|food|nightlife|relaxation|beach|nature|history)/i.test(conversationContent) && messages.length > 10)

    const infoScore = [hasDates, hasGroup, hasBudget, hasDestination, hasSource, hasInterests].filter(Boolean).length

    const shouldGenerateFinal =
      // Only trigger Final if we have interests OR it's a very long conversation
      (hasInterests && infoScore >= 5) || // All core info including interests
      (infoScore >= 4 && messages.length > 12) || // Most info + long conversation
      messages.length > 16; // Fallback for very long conversations

    type ErrorEntry = Record<string, unknown>;
    const errors: ErrorEntry[] = [];

    for (const model of modelFallbacks) {
      try {
        const recent = messages.slice(-12); // Reduced context for speed

        const completion = await openai.chat.completions.create({
          model,
          response_format: { type: "json_object" },
          temperature: shouldGenerateFinal ? 0.35 : 0.3,
          top_p: 0.9,
          max_tokens: shouldGenerateFinal ? 10000 : 2000, // Increased for complete multi-day trips
          presence_penalty: 0,
          frequency_penalty: shouldGenerateFinal ? 0.3 : 0.1,
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

        let parsed: unknown;
        try {
          parsed = JSON.parse(raw);
        } catch {
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

        // Normalize and validate parsed object
        type MutableParsed = {
          [key: string]: unknown;
          ui?: string;
          resp?: unknown;
          itinerary?: unknown;
          budget?: unknown;
        };
        const p = parsed as MutableParsed;
        if (p.ui === "") p.ui = undefined;

        // Enhanced validation
        const hasResp = typeof p.resp === "string" && p.resp.length > 0;
        const isFinal = p.ui === "Final";
        const hasItinerary =
          Array.isArray(p.itinerary) && p.itinerary.length > 0;
        const hasBudget = !!p.budget && typeof p.budget === "object";

        if (isFinal) {
          if (hasResp && hasItinerary) {
            // Validate ALL days have required fields, not just the first
            const itineraryArray = p.itinerary as Array<Record<string, unknown>>;
            const incompleteDays: number[] = [];
            
            for (let i = 0; i < itineraryArray.length; i++) {
              const day = itineraryArray[i];
              const hasAllFields = 
                day &&
                typeof day.title === 'string' && day.title.length > 0 &&
                typeof day.morning === 'string' && day.morning.length > 0 &&
                typeof day.afternoon === 'string' && day.afternoon.length > 0 &&
                typeof day.evening === 'string' && day.evening.length > 0;
              
              if (!hasAllFields) {
                incompleteDays.push(i + 1);
              }
            }

            if (incompleteDays.length === 0) {
              // All days are complete - if budget missing, synthesize a minimal placeholder so UI can render gracefully
              console.log(`[aimodel] ✅ Generated complete ${itineraryArray.length}-day itinerary`);
              if (!hasBudget) {
                try {
                  const itArr = p.itinerary as Array<{ day?: number }>;
                  const budgetBreakdown: Array<{ day: number; total: number }> = itArr.map((it, idx) => ({
                    day: typeof it?.day === 'number' ? (it.day as number) : idx + 1,
                    total: 0,
                  }));
                  (p as { budget?: unknown }).budget = { currency: 'USD', total: 0, breakdown: budgetBreakdown };
                } catch {}
              }
              return NextResponse.json(p);
            } else if (incompleteDays.length <= 3 && itineraryArray.length >= 3) {
              // If only 1-3 days incomplete (likely token cutoff), fill them with generic content
              console.warn(`[aimodel] Filling ${incompleteDays.length} incomplete days:`, incompleteDays);
              for (const dayNum of incompleteDays) {
                const idx = dayNum - 1;
                const day = itineraryArray[idx] as Record<string, unknown>;
                if (!day.title || typeof day.title !== 'string' || day.title.length === 0) {
                  day.title = `Day ${dayNum} - Explore & Discover`;
                }
                if (!day.morning || typeof day.morning !== 'string' || day.morning.length === 0) {
                  day.morning = 'Start your day with a leisurely breakfast. Explore local neighborhoods and discover hidden gems at your own pace.';
                }
                if (!day.afternoon || typeof day.afternoon !== 'string' || day.afternoon.length === 0) {
                  day.afternoon = 'Visit a popular attraction or museum. Enjoy lunch at a recommended local spot and continue sightseeing.';
                }
                if (!day.evening || typeof day.evening !== 'string' || day.evening.length === 0) {
                  day.evening = 'Relax with dinner at a nice restaurant. Take an evening stroll and soak in the local atmosphere.';
                }
              }
              // After filling, synthesize budget if missing
              if (!hasBudget) {
                try {
                  const itArr = p.itinerary as Array<{ day?: number }>;
                  const budgetBreakdown: Array<{ day: number; total: number }> = itArr.map((it, idx) => ({
                    day: typeof it?.day === 'number' ? (it.day as number) : idx + 1,
                    total: 0,
                  }));
                  (p as { budget?: unknown }).budget = { currency: 'USD', total: 0, breakdown: budgetBreakdown };
                } catch {}
              }
              return NextResponse.json(p);
            } else {
              errors.push({
                model,
                error: "incomplete_itinerary_structure",
                incompleteDays,
                totalDays: itineraryArray.length,
                message: `Days ${incompleteDays.join(', ')} are missing required fields (title, morning, afternoon, or evening)`,
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
              raw: JSON.stringify(p).slice(0, 500),
            });
            continue;
          }
        } else {
          if (hasResp) {
            return NextResponse.json(p);
          } else {
            errors.push({
              model,
              error: "missing_resp_field",
              raw: JSON.stringify(p).slice(0, 500),
            });
            continue;
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown_error";
        const status = undefined as number | undefined;

        errors.push({
          model,
          error: message,
          status,
          type: err instanceof Error ? err.name : "unknown",
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown server error";
    const status = /timeout/i.test(message) ? 504 : 500;
    console.error("API route error:", e);
    return NextResponse.json(
      {
        error: message,
        stack:
          process.env.NODE_ENV === "development" && e instanceof Error
            ? e.stack
            : undefined,
      },
      { status }
    );
  }
}
