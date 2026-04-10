import { Clock, Layers, FileCode, FolderOpen } from "lucide-react";
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

const ProjectOverview = ({ data }: Props) => {
  const { overview, metrics } = data;

  return (
    <div className="p-5 rounded-xl border border-border bg-card card-hover">
      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Overview</h3>

      <h2 className="text-xl font-bold mb-3">{overview.repoName}</h2>

      <div className="flex gap-2 mb-4">
        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary/15 text-primary">
          {overview.language}
        </span>
        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary/15 text-primary">
          {overview.framework}
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileCode className="w-4 h-4 shrink-0" />
          <span>Entry:</span>
          <code className="font-mono text-foreground text-xs bg-secondary px-2 py-0.5 rounded">
            {overview.entryPoint}
          </code>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderOpen className="w-4 h-4 shrink-0" />
          <span>{overview.totalFiles} files · {overview.totalFolders} folders</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Onboarding: {metrics.onboardingTimeEstimate}</span>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${pillColor(metrics.couplingLevel)}`}>
            {metrics.couplingLevel} coupling
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${pillColor(metrics.complexityLevel)}`}>
            {metrics.complexityLevel}
          </span>
        </div>
      </div>

      {/* Top deps */}
      {overview.dependencies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Top Dependencies</p>
          <div className="flex flex-wrap gap-1.5">
            {overview.dependencies.slice(0, 8).map((d) => (
              <span key={d} className="px-2 py-0.5 text-xs rounded bg-secondary text-secondary-foreground">
                {d}
              </span>
            ))}
            {overview.dependencies.length > 8 && (
              <span className="px-2 py-0.5 text-xs rounded bg-secondary text-muted-foreground">
                +{overview.dependencies.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOverview;
