import { GitHubFile, getMultipleFileContents, getRepoTree, getRepoInfo, parseGitHubUrl } from "./github";

// ── Types ──

export interface AnalysisResult {
  overview: {
    repoName: string;
    repoUrl: string;
    language: string;
    framework: string;
    entryPoint: string;
    totalFiles: number;
    totalFolders: number;
    dependencies: string[];
    devDependencies: string[];
  };
  architecture: {
    pattern: string;
    confidence: number;
    detectedLayers: { name: string; folderName: string; fileCount: number }[];
    missingLayers: string[];
  };
  executionFlow: {
    mermaidCode: string;
  };
  importanceScores: {
    file: string;
    score: number;
    category: string;
    reasons: string[];
  }[];
  onboardingPath: {
    step: number;
    label: string;
    file: string;
    why: string;
  }[];
  risks: {
    level: "warning" | "info";
    message: string;
  }[];
  metrics: {
    couplingLevel: string;
    complexityLevel: string;
    onboardingTimeEstimate: string;
    avgFileSize: number;
    maxDepth: number;
    changeImpactMap: Record<string, number>;
    totalFiles: number;
    totalFolders: number;
  };
}

export type AnalysisStep =
  | "cloning"
  | "reading"
  | "scoring"
  | "detecting"
  | "building"
  | "generating";

// ── Helpers ──

const SKIP_DIRS = new Set(["node_modules", ".git", ".DS_Store", "dist", "build", "coverage", ".github", ".vscode"]);
const SKIP_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".mp3", ".mp4", ".zip", ".tar", ".gz"]);

interface FileInfo {
  relativePath: string;
  fileName: string;
  extension: string;
  parentFolder: string;
  depth: number;
  size: number;
  content?: string;
}

function shouldSkip(path: string): boolean {
  const parts = path.split("/");
  if (parts.some((p) => SKIP_DIRS.has(p))) return true;
  const ext = "." + path.split(".").pop()?.toLowerCase();
  if (SKIP_EXTS.has(ext)) return true;
  return false;
}

function getParentFolder(path: string): string {
  const parts = path.split("/");
  return parts.length > 1 ? parts[parts.length - 2] : "";
}

function getExtension(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? "." + parts.pop()! : "";
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

// ── Main Analyzer ──

export async function analyzeRepository(
  repoUrl: string,
  onStep: (step: AnalysisStep) => void
): Promise<AnalysisResult> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) throw new Error("Invalid GitHub URL");

  const { owner, repo } = parsed;

  // Step 1: Get repo info
  onStep("cloning");
  const repoInfo = await getRepoInfo(owner, repo);

  // Step 2: Get file tree
  onStep("reading");
  const tree = await getRepoTree(owner, repo, repoInfo.defaultBranch);

  const files: GitHubFile[] = tree.filter(
    (f) => f.type === "blob" && !shouldSkip(f.path)
  );
  const folders: GitHubFile[] = tree.filter(
    (f) => f.type === "tree" && !shouldSkip(f.path)
  );

  // Build file info
  const fileInfos: FileInfo[] = files.slice(0, 300).map((f) => ({
    relativePath: f.path,
    fileName: getFileName(f.path),
    extension: getExtension(f.path),
    parentFolder: getParentFolder(f.path),
    depth: f.path.split("/").length - 1,
    size: f.size || 0,
  }));

  // Get important file contents
  const importantPaths = [
    "package.json",
    ...fileInfos
      .filter((f) =>
        ["app.js", "server.js", "index.js", "app.ts", "server.ts", "index.ts", "main.js", "main.ts"]
          .includes(f.fileName.toLowerCase())
      )
      .map((f) => f.relativePath)
      .slice(0, 5),
    ...fileInfos
      .filter((f) =>
        ["routes", "controllers", "services", "models", "middleware"].includes(f.parentFolder)
      )
      .map((f) => f.relativePath)
      .slice(0, 20),
  ];

  const uniquePaths = [...new Set(importantPaths)].filter((p) => {
    const ext = getExtension(p).toLowerCase();
    return [".js", ".ts", ".jsx", ".tsx", ".json", ".mjs", ".cjs"].includes(ext) || p === "package.json";
  });

  const fileContents = await getMultipleFileContents(owner, repo, uniquePaths.slice(0, 30));

  // Parse package.json
  let packageJson: any = {};
  try {
    packageJson = JSON.parse(fileContents["package.json"] || "{}");
  } catch { /* ignore */ }

  // Step 3: Score importance
  onStep("scoring");
  const importanceScores = scoreFiles(fileInfos, fileContents);

  // Step 4: Detect architecture
  onStep("detecting");
  const folderNames = new Set(folders.map((f) => f.path.split("/").pop()?.toLowerCase() || ""));
  const allFolderPaths = new Set(folders.map((f) => f.path.toLowerCase()));
  const architecture = detectArchitecture(folderNames, fileInfos);

  // Step 5: Build execution flow
  onStep("building");
  const executionFlow = buildExecutionFlow(architecture.detectedLayers);

  // Step 6: Generate insights
  onStep("generating");

  const entryPoint = findEntryPoint(fileInfos, packageJson);
  const risks = analyzeRisks(fileInfos, packageJson, folderNames, allFolderPaths);
  const metrics = buildMetrics(fileInfos, fileContents);
  const onboardingPath = buildOnboardingPath(fileInfos, entryPoint);

  const deps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});

  // Detect framework
  const framework = deps.includes("express")
    ? "Express"
    : deps.includes("fastify")
    ? "Fastify"
    : deps.includes("koa")
    ? "Koa"
    : deps.includes("hapi") || deps.includes("@hapi/hapi")
    ? "Hapi"
    : deps.includes("next")
    ? "Next.js"
    : deps.includes("react")
    ? "React"
    : deps.includes("vue")
    ? "Vue"
    : "Unknown";

  const language = fileInfos.some((f) => [".ts", ".tsx"].includes(f.extension))
    ? "TypeScript"
    : "JavaScript";

  return {
    overview: {
      repoName: repo,
      repoUrl,
      language,
      framework,
      entryPoint,
      totalFiles: files.length,
      totalFolders: folders.length,
      dependencies: deps,
      devDependencies: devDeps,
    },
    architecture,
    executionFlow,
    importanceScores: importanceScores.slice(0, 30),
    onboardingPath,
    risks,
    metrics: {
      ...metrics,
      totalFiles: files.length,
      totalFolders: folders.length,
    },
  };
}

// ── Importance Scorer ──

function scoreFiles(
  files: FileInfo[],
  contents: Record<string, string>
): AnalysisResult["importanceScores"] {
  // Build import map
  const importCounts: Record<string, number> = {};
  Object.values(contents).forEach((content) => {
    const requireMatches = content.match(/require\(['"]\.\/([^'"]+)['"]\)/g) || [];
    const importMatches = content.match(/from\s+['"]\.\/([^'"]+)['"]/g) || [];
    [...requireMatches, ...importMatches].forEach((m) => {
      const match = m.match(/['"]\.\/([^'"]+)['"]/);
      if (match) {
        const name = match[1].replace(/\.\w+$/, "");
        importCounts[name] = (importCounts[name] || 0) + 1;
      }
    });
  });

  return files
    .filter((f) => [".js", ".ts", ".jsx", ".tsx", ".mjs", ".cjs"].includes(f.extension))
    .map((f) => {
      let score = 0;
      const reasons: string[] = [];

      // Entry point files (expanded)
      if ([
        "app.js", "server.js", "index.js", "app.ts", "server.ts", "index.ts", "main.js", "main.ts",
        "main.tsx", "index.tsx", "App.tsx", "main.jsx", "index.jsx", "App.jsx"
      ].includes(f.fileName)) {
        score += 50;
        reasons.push("Entry point file");
      }

      // React component detection
      const content = contents[f.relativePath] || "";
      if (/function\s+[A-Z][A-Za-z0-9_]*\s*\(/.test(content) || /export\s+default\s+function\s+[A-Z]/.test(content)) {
        score += 15;
        reasons.push("Exports React component");
      }
      if (/ReactDOM\.render|createRoot|hydrateRoot/.test(content)) {
        score += 15;
        reasons.push("Contains React root render");
      }
      // Backend core patterns
      if (content.includes("express()") || content.includes("app.listen(") || content.includes("mongoose.connect(")) {
        score += 20;
        reasons.push("Contains backend core initialization");
      }

      // Structural folder
      if (["controllers", "services", "models", "routes", "middleware", "xray", "ui", "hooks", "lib"].includes(f.parentFolder)) {
        score += 10;
        reasons.push(`In ${f.parentFolder} layer`);
      }

      // Import count
      const baseName = f.fileName.replace(/\.\w+$/, "");
      const importCount = importCounts[baseName] || 0;
      if (importCount >= 3) {
        score += 10;
        reasons.push(`Imported by ${importCount} files`);
      } else if (importCount > 0) {
        score += 5;
        reasons.push(`Imported by ${importCount} file(s)`);
      }

      // File size
      const estimatedLines = Math.max(1, Math.floor(f.size / 40));
      if (estimatedLines > 200) {
        score += 10;
        reasons.push("Very large file");
      } else if (estimatedLines > 100) {
        score += 5;
        reasons.push("Large file");
      }

      // Penalize test files and config files
      if (/\.test\.(js|ts|jsx|tsx)$/.test(f.fileName) || f.fileName.endsWith(".config.js") || f.fileName.endsWith(".config.ts")) {
        score -= 10;
        reasons.push("Test or config file");
      }

      // Never negative
      score = Math.max(0, score);

      const category =
        score >= 90 ? "Critical" : score >= 70 ? "Core" : score >= 40 ? "Supporting" : score >= 10 ? "Utility" : "Low";

      return { file: f.relativePath, score, category, reasons };
    })
    .sort((a, b) => b.score - a.score);
}

// ── Architecture Detector ──

function detectArchitecture(folderNames: Set<string>, files: FileInfo[]) {
  const layerMap: Record<string, string> = {
    controllers: "Controller Layer",
    services: "Business Logic Layer",
    models: "Data Layer",
    routes: "Routing Layer",
    config: "Configuration Layer",
    middleware: "Middleware Layer",
    utils: "Utility Layer",
    helpers: "Utility Layer",
    lib: "Library Layer",
  };

  const detected: { name: string; folderName: string; fileCount: number }[] = [];
  const allLayers = ["Controller Layer", "Business Logic Layer", "Data Layer", "Routing Layer", "Middleware Layer", "Configuration Layer"];

  Object.entries(layerMap).forEach(([folder, name]) => {
    if (folderNames.has(folder)) {
      const count = files.filter((f) => f.parentFolder === folder).length;
      if (!detected.find((d) => d.name === name)) {
        detected.push({ name, folderName: folder, fileCount: count });
      }
    }
  });

  const hasControllers = folderNames.has("controllers");
  const hasServices = folderNames.has("services");
  const hasModels = folderNames.has("models");
  const hasRoutes = folderNames.has("routes");

  let pattern: string;
  if (hasControllers && hasServices && hasModels) {
    pattern = "Layered MVC Style";
  } else if (hasRoutes && hasControllers) {
    pattern = "Route-Controller Style";
  } else if (hasRoutes) {
    pattern = "Flat Route Style";
  } else {
    pattern = "Unstructured / Script Style";
  }

  const confidence = Math.min(100, Math.round((detected.length / 4) * 100));
  const detectedNames = new Set(detected.map((d) => d.name));
  const missing = allLayers.filter((l) => !detectedNames.has(l));

  return { pattern, confidence, detectedLayers: detected, missingLayers: missing };
}

// ── Execution Flow Builder ──

function buildExecutionFlow(detectedLayers: { name: string }[]) {
  const layerOrder = [
    { name: "Routing Layer", node: "Routes" },
    { name: "Middleware Layer", node: "Middleware" },
    { name: "Controller Layer", node: "Controllers" },
    { name: "Business Logic Layer", node: "Services" },
    { name: "Data Layer", node: "Models" },
  ];

  const present = layerOrder.filter((l) =>
    detectedLayers.some((d) => d.name === l.name)
  );

  let mermaid = "graph LR\n";
  mermaid += "  Client([Client])-->App[Express App]\n";

  let prev = "App";
  present.forEach((l) => {
    mermaid += `  ${prev}-->${l.node}[${l.node}]\n`;
    prev = l.node;
  });

  if (detectedLayers.some((d) => d.name === "Data Layer")) {
    mermaid += `  ${prev}-->DB[(Database)]\n`;
  }

  return { mermaidCode: mermaid };
}

// ── Risk Analyzer ──

function analyzeRisks(
  files: FileInfo[],
  packageJson: any,
  folderNames: Set<string>,
  allFolderPaths: Set<string>
) {
  const risks: { level: "warning" | "info"; message: string }[] = [];

  const hasTests = folderNames.has("test") || folderNames.has("tests") || folderNames.has("__tests__") ||
    [...allFolderPaths].some(p => p.includes("test") || p.includes("spec"));
  if (!hasTests) {
    risks.push({ level: "warning", message: "No test suite detected" });
  }

  if (!files.some((f) => f.fileName.toLowerCase() === "readme.md" && f.depth === 0)) {
    risks.push({ level: "warning", message: "Missing README — onboarding will be harder" });
  }

  files.forEach((f) => {
    const estimatedLines = Math.floor(f.size / 40);
    if (estimatedLines > 500) {
      risks.push({
        level: "warning",
        message: `Large file detected: ${f.fileName} (~${estimatedLines} lines) — consider splitting`,
      });
    }
  });

  const depCount = Object.keys(packageJson.dependencies || {}).length;
  if (depCount > 30) {
    risks.push({ level: "info", message: `High dependency count (${depCount}) — potential bloat risk` });
  }

  if (!folderNames.has("config")) {
    risks.push({ level: "info", message: "No config layer — environment management may be scattered" });
  }

  if (!packageJson.scripts?.start) {
    risks.push({ level: "info", message: 'No "start" script in package.json' });
  }

  return risks;
}

// ── Metrics Builder ──

function buildMetrics(files: FileInfo[], contents: Record<string, string>) {
  const totalFiles = files.length;
  const avgFileSize = Math.round(
    files.reduce((sum, f) => sum + Math.floor(f.size / 40), 0) / Math.max(1, totalFiles)
  );
  const maxDepth = Math.max(...files.map((f) => f.depth), 0);

  // Count cross-file imports
  let totalImports = 0;
  const importCounts: Record<string, number> = {};

  Object.values(contents).forEach((content) => {
    const matches = [
      ...(content.match(/require\(['"]\.\/([^'"]+)['"]\)/g) || []),
      ...(content.match(/from\s+['"]\.\/([^'"]+)['"]/g) || []),
    ];
    totalImports += matches.length;
    matches.forEach((m) => {
      const match = m.match(/['"]\.\/([^'"]+)['"]/);
      if (match) {
        const name = match[1];
        importCounts[name] = (importCounts[name] || 0) + 1;
      }
    });
  });

  const couplingLevel = totalImports < 10 ? "Low" : totalImports <= 30 ? "Medium" : "High";
  const complexityLevel =
    totalFiles < 10 && maxDepth < 3
      ? "Simple"
      : totalFiles < 30 || maxDepth < 5
      ? "Moderate"
      : "Complex";
  const onboardingTimeEstimate =
    complexityLevel === "Simple"
      ? "~30 minutes"
      : complexityLevel === "Moderate"
      ? "~2–4 hours"
      : "~1–2 days";

  // Top 10 by import count
  const changeImpactMap: Record<string, number> = {};
  Object.entries(importCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([k, v]) => {
      changeImpactMap[k] = v;
    });

  return { couplingLevel, complexityLevel, onboardingTimeEstimate, avgFileSize, maxDepth, changeImpactMap };
}

// ── Helpers ──

function findEntryPoint(files: FileInfo[], packageJson: any): string {
  if (packageJson.main && !packageJson.main.endsWith('.gitignore')) return packageJson.main;
  // Extended candidates for frontend (React/Vite) and backend
  const candidates = [
    "src/main.tsx", "src/index.tsx", "src/App.tsx", "src/main.jsx", "src/index.jsx",
    "main.tsx", "index.tsx", "App.tsx", "main.jsx", "index.jsx", "App.jsx",
    "app.js", "server.js", "index.js", "app.ts", "server.ts", "index.ts", "main.js", "main.ts",
    "src/index.js", "src/app.js", "src/server.js"
  ];
  for (const c of candidates) {
    const found = files.find((f) => f.relativePath === c || f.relativePath.endsWith("/" + c));
    if (found && !found.relativePath.endsWith('.gitignore')) return found.relativePath;
  }
  // Fallback: pick first .js/.ts/.jsx/.tsx file in src/
  const srcFile = files.find(f => f.relativePath.startsWith("src/") && [".js", ".ts", ".jsx", ".tsx"].includes(f.extension));
  if (srcFile) return srcFile.relativePath;
  // Fallback: pick first .js/.ts/.jsx/.tsx file
  const codeFile = files.find(f => [".js", ".ts", ".jsx", ".tsx"].includes(f.extension));
  if (codeFile) return codeFile.relativePath;
  // Never pick .gitignore or config files
  const nonJunk = files.find(f => !f.fileName.startsWith(".") && !f.fileName.endsWith("gitignore") && !f.fileName.endsWith(".md"));
  if (nonJunk) return nonJunk.relativePath;
  return files[0]?.relativePath || "unknown";
}

function buildOnboardingPath(files: FileInfo[], entryPoint: string) {
  const path: AnalysisResult["onboardingPath"] = [
    {
      step: 1,
      label: "Entry Point",
      file: entryPoint,
      why: "Start here. This is where the application begins execution.",
    },
  ];

  const routeFile = files.find((f) => f.parentFolder === "routes");
  if (routeFile) {
    path.push({
      step: path.length + 1,
      label: "Routes",
      file: routeFile.relativePath,
      why: "See what endpoints the app exposes and how URLs map to handlers.",
    });
  }

  const controllerFile = files.find((f) => f.parentFolder === "controllers");
  if (controllerFile) {
    path.push({
      step: path.length + 1,
      label: "Controllers",
      file: controllerFile.relativePath,
      why: "Understand how incoming requests are processed and responses are sent.",
    });
  }

  const serviceFile = files.find((f) => f.parentFolder === "services");
  if (serviceFile) {
    path.push({
      step: path.length + 1,
      label: "Services",
      file: serviceFile.relativePath,
      why: "Explore the core business logic that powers the application.",
    });
  }

  const modelFile = files.find((f) => f.parentFolder === "models");
  if (modelFile) {
    path.push({
      step: path.length + 1,
      label: "Models",
      file: modelFile.relativePath,
      why: "Understand the data structures and database interactions.",
    });
  }

  const configFile = files.find((f) => f.parentFolder === "config");
  if (configFile) {
    path.push({
      step: path.length + 1,
      label: "Config",
      file: configFile.relativePath,
      why: "Review environment and application configuration.",
    });
  }

  return path;
}
