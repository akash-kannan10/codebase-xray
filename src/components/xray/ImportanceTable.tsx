import { useState } from "react";
import { BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyzer";

interface Props {
  data: AnalysisResult;
  mode: "beginner" | "expert";
}

const categoryPill = (cat: string) => {
  switch (cat) {
    case "Critical": return "bg-destructive/15 text-destructive";
    case "Core": return "bg-warning/15 text-warning";
    case "Supporting": return "bg-primary/15 text-primary";
    default: return "bg-muted text-muted-foreground";
  }
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-destructive";
};

const ImportanceTable = ({ data, mode }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const scores = showAll ? data.importanceScores : data.importanceScores.slice(0, 15);

  return (
    <div className="p-6 rounded-xl border border-border bg-card card-hover animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">File Importance Index</h3>
      </div>

      {mode === "beginner" && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground leading-relaxed">
          Files are ranked by how central they are to the application. Start with Critical files first.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
              <th className="pb-3 pr-4">File</th>
              <th className="pb-3 pr-4 w-16">Score</th>
              <th className="pb-3 pr-4 w-24">Category</th>
              <th className="pb-3 hidden md:table-cell">Reasons</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={s.file} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="py-2.5 pr-4">
                  <code className="font-mono text-xs">{s.file}</code>
                </td>
                <td className="py-2.5 pr-4">
                  <span className={`font-bold font-mono ${scoreColor(s.score)}`}>{s.score}</span>
                </td>
                <td className="py-2.5 pr-4">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${categoryPill(s.category)}`}>
                    {s.category}
                  </span>
                </td>
                <td className="py-2.5 hidden md:table-cell text-xs text-muted-foreground">
                  {s.reasons.join(" · ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.importanceScores.length > 15 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {showAll ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {showAll ? "Show less" : `View all ${data.importanceScores.length} files`}
        </button>
      )}
    </div>
  );
};

export default ImportanceTable;
