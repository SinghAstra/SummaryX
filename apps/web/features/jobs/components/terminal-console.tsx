interface TerminalConsoleProps {
  messages: string[];
}

export function TerminalConsole({ messages }: TerminalConsoleProps) {
  return (
    <div className="rounded border bg-card/20 p-5 font-mono text-xs shadow-inner space-y-2 h-full overflow-y-auto w-full">
      {messages.map((messageText, index) => (
        <p
          key={index}
          className="leading-relaxed whitespace-pre-wrap text-secondary-foreground"
        >
          <span className="text-muted-foreground select-none">&gt;</span>{" "}
          {messageText}
        </p>
      ))}
    </div>
  );
}
