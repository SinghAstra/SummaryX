import { Import, LayoutDashboardIcon, WandSparklesIcon } from "lucide-react";

export const processSteps = [
  {
    title: "Import Repository",
    description:
      "Paste any public GitHub repository URL. Our engine instantly maps the directory structure and identifies the core tech stack.",
    icon: Import,
  },
  {
    title: "Contextual Analysis",
    description:
      "We perform a deep-dive analysis of every file, generating high-level summaries and tracing cross-file dependencies automatically.",
    icon: WandSparklesIcon,
  },
  {
    title: "Interactive Explorer",
    description:
      "Navigate the codebase through an intuitive dashboard. Search, filter, and comprehend complex logic without leaving your browser.",
    icon: LayoutDashboardIcon,
  },
];

export const reviews = [
  {
    name: "Michael Chen",
    rating: 5,
    review:
      "A total lifesaver for onboarding. I had to dive into a legacy 50k LOC repo, and UnderstandX mapped the entire architecture in seconds. I actually understood the data flow before my first standup.",
  },
  {
    name: "Emily Watson",
    rating: 5,
    review:
      "The context-aware file analysis is spooky good. It doesn't just describe the code; it explains why certain patterns were used. It's like having the original maintainer sitting next to me.",
  },
  {
    name: "David Kumar",
    rating: 5,
    review:
      "I use this daily for open-source contributions. Instead of spending hours clicking through folders on GitHub, I get a clear dependency map. It's significantly improved my PR turnaround time.",
  },
  {
    name: "Sophia Rossi",
    rating: 4,
    review:
      "Fantastic tool for exploring new frameworks. The repo visualizer helped me understand how the core modules interact without me having to clone and grep everything locally.",
  },
  {
    name: "James Thompson",
    rating: 5,
    review:
      "Absolutely game-changing for technical leads. I use it to audit external libraries before we add them to our stack. The insights it provides on code quality and complexity are invaluable.",
  },
  {
    name: "Olivia Zhang",
    rating: 4,
    review:
      "Simple, effective, and fast. It takes the 'black box' out of complex GitHub repos. I'm looking forward to seeing how the analysis engine evolves with even more languages!",
  },
  {
    name: "William Smith",
    rating: 5,
    review:
      "UnderstandX is now a permanent part of my workflow. If you deal with complex codebases, this isn't just a luxury—it's a necessity for maintaining sanity and speed.",
  },
  {
    name: "Mia Lindholm",
    rating: 5,
    review:
      "I've tried other repo visualizers, but they usually just show a messy graph. UnderstandX actually gives me readable, logical summaries of what the code is doing.",
  },
  {
    name: "Henry Fletcher",
    rating: 5,
    review:
      "This has completely transformed how our team handles code reviews. We run the repo through UnderstandX first to get a high-level view of the changes and their impact.",
  },
];

export const FAQ = [
  {
    id: "item-1",
    question: "How does UnderstandX analyze my code?",
    answer:
      "UnderstandX uses advanced Large Language Models (LLMs) to parse your repository's structure and logic. It identifies core modules, traces dependencies, and generates context-aware summaries that help you understand how different parts of the codebase interact.",
  },
  {
    id: "item-2",
    question: "Do I need to clone the repository locally?",
    answer:
      "No. UnderstandX works entirely in your browser. Just paste a public GitHub URL, and our engine handles the indexing and analysis on our secure servers, providing you with an instant interactive dashboard.",
  },
  {
    id: "item-3",
    question: "Is my code used to train your AI models?",
    answer:
      "Absolutely not. We prioritize your privacy. The code we analyze is processed in a transient state and is never used to train or fine-tune our underlying AI models. Your intellectual property remains yours.",
  },
  {
    id: "item-4",
    question: "Which programming languages are supported?",
    answer:
      "We currently offer deep, context-aware support for TypeScript, JavaScript, Python, Rust, Go, and Java. We are constantly expanding our language models to support more ecosystems every month.",
  },
  {
    id: "item-5",
    question: "Can it handle large, complex repositories?",
    answer:
      "Yes! UnderstandX is built specifically for scale. Whether it's a small utility library or a massive monolithic architecture, our system breaks down the code into digestible chunks to provide a clear overview without overwhelming you.",
  },
  {
    id: "item-6",
    question: "Does it support private repositories?",
    answer:
      "Currently, we focus on public GitHub repositories. However, support for private repos via GitHub App integration is our top-priority feature and is coming very soon in our Pro tier.",
  },
  {
    id: "item-7",
    question: "How accurate are the code summaries?",
    answer:
      "Our summaries are highly accurate because they aren't just looking at individual files. Our engine analyzes the 'context'—seeing how a function is called in another file—to explain the actual intent behind the code.",
  },
  {
    id: "item-8",
    question: "Can I use UnderstandX for technical audits?",
    answer:
      "Definitely. Teams use UnderstandX to perform quick security audits, dependency checks, and complexity analysis before deciding whether to adopt an open-source library into their stack.",
  },
];
