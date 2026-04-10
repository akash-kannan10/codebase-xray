import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzer";
import ModeToggle from "./ModeToggle";
import ProjectOverview from "./ProjectOverview";
import RiskPanel from "./RiskPanel";
import ArchitectureSummary from "./ArchitectureSummary";
import ExecutionFlowDiagram from "./ExecutionFlowDiagram";
import OnboardingPath from "./OnboardingPath";
import ImportanceTable from "./ImportanceTable";

interface Props {
  data: AnalysisResult;
  onReset: () => void;
}

const Dashboard = ({ data, onReset }: Props) => {
  const [mode, setMode] = useState<"beginner" | "expert">("beginner");

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze another</span>
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm">{data.overview.repoName}</h1>
              <a
                href={data.overview.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-[300px] shrink-0 space-y-4">
            <ProjectOverview data={data} />
            <RiskPanel data={data} />
          </aside>

          {/* Main */}
          <main className="flex-1 space-y-6 min-w-0">
            <ArchitectureSummary data={data} mode={mode} />
            <ExecutionFlowDiagram mermaidCode={data.executionFlow.mermaidCode} mode={mode} />
            <OnboardingPath data={data} mode={mode} />
            <ImportanceTable data={data} mode={mode} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
