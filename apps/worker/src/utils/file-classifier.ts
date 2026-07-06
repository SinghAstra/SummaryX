export type FileCategory =
  | "CODE"
  | "CONFIG"
  | "TRANSLATION"
  | "DATASET"
  | "STATIC"
  | "IGNORED";

interface ClassificationResult {
  category: FileCategory;
  shouldSummarizeWithAI: boolean;
  staticSummary: string;
}

const IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  "dist",
  ".next",
  "coverage",
  ".turbo",
  "build",
  ".cache",
  "vendor",
  "docs/generated",
];

const FILENAME_CONFIGS = [
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "next.config.js",
  "tailwind.config.js",
  "postcss.config.js",
  "dockerfile",
  "docker-compose.yml",
];

const FILENAME_IGNORED = [
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "license",
  "license.md",
  "changelog.md",
  "favicon.ico",
  "robots.txt",
  "manifest.json",
];

const PATH_TRANSLATIONS = [
  "/intl/",
  "/locales/",
  "/translations/",
  "/i18n/",
  "/locale/",
];
const PATH_STATIC_ASSETS = [
  "assets/icons/",
  "public/images/",
  "assets/images/",
  "/sprites/",
];

export function classifyFile(
  relativePath: string,
  fileName: string,
  content: string
): ClassificationResult {
  const normalizedPath = relativePath.toLowerCase().replace(/\\/g, "/");
  const normalizedName = fileName.toLowerCase();

  // --- LAYER 1: Directory Filters ---
  if (
    IGNORED_DIRECTORIES.some(
      (dir) =>
        normalizedPath.includes(`/${dir}/`) ||
        normalizedPath.startsWith(`${dir}/`)
    )
  ) {
    return {
      category: "IGNORED",
      shouldSummarizeWithAI: false,
      staticSummary:
        "This file is located in a system build, dependency, or cache directory and is excluded from automated mapping.",
    };
  }

  // --- LAYER 2: Filename Filters ---
  if (FILENAME_IGNORED.includes(normalizedName)) {
    return {
      category: "IGNORED",
      shouldSummarizeWithAI: false,
      // 🟢 Fix 1: Friendly static summaries instead of tech jargon
      staticSummary: `Automated project manifest or metadata log (${fileName}) skipped to keep the workspace summary clear and concise.`,
    };
  }

  if (FILENAME_CONFIGS.includes(normalizedName)) {
    return {
      category: "CONFIG",
      shouldSummarizeWithAI: false,
      staticSummary: `Configuration settings profile managing dependencies, environments, or build compilation options for ${fileName}.`,
    };
  }

  // --- LAYER 3: Path Pattern Filters ---
  if (PATH_TRANSLATIONS.some((pattern) => normalizedPath.includes(pattern))) {
    const localeMatch = fileName.match(/^([a-zA-Z]{2,3}([-_][a-zA-Z]{2,4})?)/);
    const localeName = localeMatch ? ` for the [${localeMatch[1]}] locale` : "";
    return {
      category: "TRANSLATION",
      shouldSummarizeWithAI: false,
      staticSummary: `Internationalization dictionary mapping localized text elements and semantic translation strings${localeName}.`,
    };
  }

  if (PATH_STATIC_ASSETS.some((pattern) => normalizedPath.includes(pattern))) {
    return {
      category: "STATIC",
      shouldSummarizeWithAI: false,
      staticSummary:
        "Static graphic vector, icon asset group, or visual layout media resource used inside the user interface presentation layer.",
    };
  }

  // --- LAYER 4: Content Heuristics ---
  if (normalizedName.endsWith(".json")) {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const isSimpleDictionary =
        trimmed.length > 200 &&
        !trimmed.includes('"type":') &&
        !trimmed.includes('"id":');
      if (isSimpleDictionary) {
        return {
          category: "DATASET",
          shouldSummarizeWithAI: false,
          staticSummary:
            "Structured data lookup entity housing static records, structural system variables, or mapping schemas.",
        };
      }
    }
  }

  // --- LAYER 5: Fall through to standard source code context parsing ---
  return {
    category: "CODE",
    shouldSummarizeWithAI: true,
    staticSummary: "",
  };
}
