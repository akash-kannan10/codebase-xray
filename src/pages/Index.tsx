import { useState, useCallback } from "react";
import { analyzeRepository, type AnalysisResult, type AnalysisStep } from "@/lib/analyzer";
import { parseGitHubUrl } from "@/lib/github";
import LandingInput from "@/components/xray/LandingInput";
import LoadingScreen from "@/components/xray/LoadingScreen";
import Dashboard from "@/components/xray/Dashboard";

type AppStatus = "idle" | "loading" | "done" | "error";

const Index = () => {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<AnalysisStep>("cloning");
  const [repoName, setRepoName] = useState("");

  const handleAnalyze = useCallback(async (url: string) => {
    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      setError("Invalid GitHub URL");
      return;
    }

    setRepoName(parsed.repo);
    setStatus("loading");
    setStep("cloning");
    setError("");

    try {
      const result = await analyzeRepository(url, setStep);
      setData(result);
      setStatus("done");
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      setStatus("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError("");
  }, []);

  if (status === "loading") {
    return <LoadingScreen currentStep={step} repoName={repoName} />;
  }

  if (status === "done" && data) {
    return <Dashboard data={data} onReset={handleReset} />;
  }

  return (
    <div>
      <LandingInput onAnalyze={handleAnalyze} />
      {status === "error" && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
          <button onClick={handleReset} className="ml-3 underline">
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
