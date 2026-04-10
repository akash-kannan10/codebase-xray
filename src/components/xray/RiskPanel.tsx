import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzer";

interface Props {
  data: AnalysisResult;
}

const pillColor = (level: string) => {
  switch (level) {
    case "Low":
    case "Simple":
      return "bg-success/15 text-success";
    case "Medium":
    case "Moderate":
      return "bg-warning/15 text-warning";
    case "High":
    case "Complex":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const RiskPanel = ({ data }: Props) => {
  const { risks, metrics } = data;

  return (
    <div className="p-5 rounded-xl border border-border bg-card card-hover">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4" />
        Risk & Health
      </h3>

      {risks.length === 0 ? (
        <div className="flex items-center gap-2 text-success text-sm mb-4">
          <ShieldCheck className="w-4 h-4" />
          <span>No major issues detected</span>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {risks.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              {r.level === "warning" ? (
                <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              ) : (
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              )}
              <span className="text-muted-foreground leading-relaxed">{r.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Coupling</span>
          <span className={`px-2 py-0.5 rounded font-medium ${pillColor(metrics.couplingLevel)}`}>
            {metrics.couplingLevel}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Complexity</span>
          <span className={`px-2 py-0.5 rounded font-medium ${pillColor(metrics.complexityLevel)}`}>
            {metrics.complexityLevel}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Avg file size</span>
          <span className="text-foreground font-medium">{metrics.avgFileSize} lines</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Max depth</span>
          <span className="text-foreground font-medium">{metrics.maxDepth}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;
