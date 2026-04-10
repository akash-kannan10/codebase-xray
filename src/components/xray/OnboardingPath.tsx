import { Compass } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzer";

interface Props {
  data: AnalysisResult;
  mode: "beginner" | "expert";
}

const OnboardingPath = ({ data, mode }: Props) => {
  return (
    <div className="p-6 rounded-xl border border-border bg-card card-hover animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center gap-2 mb-5">
        <Compass className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Suggested Exploration Order</h3>
      </div>

      <div className="relative">
        {data.onboardingPath.map((step, i) => (
          <div key={step.step} className="flex gap-4 mb-1 last:mb-0">
            {/* Timeline */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                {step.step}
              </div>
              {i < data.onboardingPath.length - 1 && (
                <div className="w-0.5 h-full min-h-[40px] bg-border my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{step.label}</span>
              </div>
              <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                {step.file}
              </code>
              {mode === "beginner" && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{step.why}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingPath;
