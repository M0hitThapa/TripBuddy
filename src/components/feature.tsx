import { cn } from "@/lib/utils";
import {
  IconAdjustmentsBolt,
  IconCloud,
  IconCurrencyDollar,
  IconEaseInOut,
  IconHeart,
  IconHelp,
  IconRouteAltLeft,
  IconTerminal2,
} from "@tabler/icons-react";

export default function FeaturesSectionDemo() {
  const features = [
    {
      title: "AI-powered trip planning",
      description:
        "Tell us your dates, budget and interests — get a smart plan in seconds.",
      icon: <IconTerminal2 />,
    },
    {
      title: "Personalized & easy",
      description:
        "Edit days, swap activities and fine-tune with one tap — no hassle.",
      icon: <IconEaseInOut />,
    },
    {
      title: "Budget estimates",
      description:
        "Clear daily cost breakdowns so you always stay on top of expenses.",
      icon: <IconCurrencyDollar />,
    },
    {
      title: "Cloud sync across devices",
      description: "Pick up planning anywhere — your trips stay in sync.",
      icon: <IconCloud />,
    },
    {
      title: "Smart routes & day flow",
      description: "Optimized plans to reduce backtracking and save your time.",
      icon: <IconRouteAltLeft />,
    },
    {
      title: "Help when you need it",
      description:
        "Simple guidance and tips inside the chat to keep you moving.",
      icon: <IconHelp />,
    },
    {
      title: "Powerful customization",
      description:
        "Tweak pace, add must‑visit spots and tailor for couples, family or friends.",
      icon: <IconAdjustmentsBolt />,
    },
    {
      title: "Save favorites",
      description: "Heart the places you love and keep them handy for later.",
      icon: <IconHeart />,
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-5xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r  py-10 relative group/feature dark:border-neutral-800",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
