import { CheckCircle2, MinusCircle, Layers } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzer";
import CodeTooltip from "./CodeTooltip";

interface Props {
  data: AnalysisResult;
  mode: "beginner" | "expert";
}

const ArchitectureSummary = ({ data, mode }: Props) => {
  const { architecture } = data;

  return (
    <div className="p-6 rounded-xl border border-border bg-card card-hover animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Architecture Pattern</h3>
      </div>

      <div className="mb-4">
        <span className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          {architecture.pattern}
        </span>
      </div>

      {/* Confidence */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Confidence</span>
          <span>{architecture.confidence}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full gradient-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${architecture.confidence}%` }}
          />
        </div>
      </div>

      {/* Layers */}
      <div className="space-y-2 mb-4">
        {architecture.detectedLayers.map((l) => (
          <div key={l.name} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span className="text-sm font-medium">{l.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">{l.fileCount} files</span>
          </div>
        ))}
        {architecture.missingLayers.map((l) => (
          <div key={l} className="flex items-center gap-2 py-2 px-3 rounded-lg opacity-40">
            <MinusCircle className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">{l}</span>
          </div>
        ))}
      </div>

      {/* Beginner explanation */}
      {mode === "beginner" && (
        <div className="mt-5 p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm leading-relaxed text-muted-foreground">
          This project follows a{" "}
          <strong className="text-foreground">{architecture.pattern}</strong> architecture.
          The <CodeTooltip term="Entry Point">{data.overview.entryPoint}</CodeTooltip> starts
          the application
          {architecture.detectedLayers.some((l) => l.name === "Routing Layer") && (
            <>, which routes requests through the <CodeTooltip term="Route">routing layer</CodeTooltip></>
          )}
          {architecture.detectedLayers.some((l) => l.name === "Controller Layer") && (
            <> into <CodeTooltip term="Controller">controllers</CodeTooltip> for handling</>
          )}
          {architecture.detectedLayers.some((l) => l.name === "Business Logic Layer") && (
            <>, <CodeTooltip term="Service Layer">services</CodeTooltip> for business logic</>
          )}
          {architecture.detectedLayers.some((l) => l.name === "Data Layer") && (
            <>, and <CodeTooltip term="Model">models</CodeTooltip> for data</>
          )}
          .
        </div>
      )}
    </div>
  );
};

export default ArchitectureSummary;
