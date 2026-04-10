import { useEffect, useRef, useState } from "react";
import { GitBranch } from "lucide-react";
import mermaid from "mermaid";

interface Props {
  mermaidCode: string;
  mode: "beginner" | "expert";
}

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#6c63ff",
    primaryTextColor: "#f1f5f9",
    primaryBorderColor: "#6c63ff",
    lineColor: "#64748b",
    secondaryColor: "#1a1d27",
    tertiaryColor: "#2a2d3e",
    fontFamily: "Inter, system-ui, sans-serif",
  },
});

const ExecutionFlowDiagram = ({ mermaidCode, mode }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !mermaidCode) return;

    const render = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        setError(true);
      }
    };

    render();
  }, [mermaidCode]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card card-hover animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center gap-2 mb-5">
        <GitBranch className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Request Execution Flow</h3>
      </div>

      <div
        ref={containerRef}
        className="w-full overflow-x-auto py-4 flex justify-center"
      >
        {error && (
          <p className="text-sm text-muted-foreground">Unable to render flow diagram</p>
        )}
      </div>

      {mode === "beginner" && (
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          This shows the path a request travels through your application, from the client all the way to the database and back.
        </p>
      )}
    </div>
  );
};

export default ExecutionFlowDiagram;
