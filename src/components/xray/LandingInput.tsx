import { useState } from "react";
import { Search, Zap, GitBranch, Shield } from "lucide-react";

interface LandingInputProps {
  onAnalyze: (url: string) => void;
}

const LandingInput = ({ onAnalyze }: LandingInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a GitHub URL");
      return;
    }
    if (!url.includes("github.com/")) {
      setError("Please enter a valid GitHub URL");
      return;
    }
    setError("");
    onAnalyze(url.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gradient-bg-radial">
      {/* Hero */}
      <div className="max-w-2xl w-full text-center animate-fade-in">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 mb-8">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Developer Intelligence Tool</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
          Codebase{" "}
          <span className="gradient-primary bg-clip-text text-transparent">X-Ray</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed">
          Understand any repository in under 2 minutes. Paste a GitHub URL and get instant architecture insights.
        </p>

        {/* Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 gradient-primary rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur" />
            <div className="relative flex items-center bg-card border border-border rounded-xl overflow-hidden">
              <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                placeholder="https://github.com/username/repo"
                className="flex-1 bg-transparent px-4 py-4 text-foreground placeholder:text-muted-foreground outline-none font-mono text-sm"
              />
              <button
                type="submit"
                className="gradient-primary text-primary-foreground px-6 py-4 font-semibold text-sm hover:opacity-90 transition-opacity shrink-0"
              >
                Analyze
              </button>
            </div>
          </div>
          {error && (
            <p className="text-destructive text-sm mt-3 animate-fade-in">{error}</p>
          )}
        </form>

        <p className="text-xs text-muted-foreground mb-16">
          Works with any public GitHub repository
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {[
            { icon: GitBranch, title: "Architecture Detection", desc: "Identifies MVC, route-controller, and other patterns" },
            { icon: Search, title: "File Importance Scoring", desc: "Ranks every file by structural importance" },
            { icon: Shield, title: "Risk Analysis", desc: "Spots missing tests, large files, and bloat" },
          ].map((f, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border bg-card/50 card-hover"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <f.icon className="w-5 h-5 text-primary mb-3" />
              <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingInput;
