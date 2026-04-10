import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import type { AnalysisStep } from "@/lib/analyzer";

interface LoadingScreenProps {
  currentStep: AnalysisStep;
  repoName: string;
}

const STEPS: { key: AnalysisStep; label: string }[] = [
  { key: "cloning", label: "Fetching repository..." },
  { key: "reading", label: "Reading file structure..." },
  { key: "scoring", label: "Scoring file importance..." },
  { key: "detecting", label: "Detecting architecture..." },
  { key: "building", label: "Building execution flow..." },
  { key: "generating", label: "Generating insights..." },
];

const LoadingScreen = ({ currentStep, repoName }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  useEffect(() => {
    const target = Math.min(95, ((currentIdx + 1) / STEPS.length) * 100);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= target) return p;
        return p + 0.5;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [currentIdx]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 gradient-bg-radial">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 mb-8">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground font-mono">{repoName}</span>
        </div>

        <h2 className="text-2xl font-bold mb-8">Analyzing Repository</h2>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full mb-10 overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3 text-left">
          {STEPS.map((step, i) => {
            const isDone = i < currentIdx;
            const isActive = i === currentIdx;
            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 py-2 px-4 rounded-lg transition-all duration-300 ${
                  isActive ? "bg-card border border-border" : ""
                } ${isDone ? "opacity-60" : i > currentIdx ? "opacity-30" : ""}`}
              >
                {isDone ? (
                  <Check className="w-4 h-4 text-success shrink-0" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                )}
                <span className={`text-sm ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
