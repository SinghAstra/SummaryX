import { Log, Repository } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import MaxWidthWrapper from "../global/max-width-wrapper";

interface TerminalProps {
  logs: Log[];
  repository: Repository;
}

function Terminal({ repository, logs }: TerminalProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && autoScroll) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const current = scrollRef.current;
      const isAtBottom =
        current.scrollHeight - current.scrollTop <= current.clientHeight + 100;
      setAutoScroll(isAtBottom);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setAutoScroll(true);
    }
  };

  return (
    <MaxWidthWrapper>
      <div className="relative rounded border border-border overflow-hidden flex-1">
        <div className="absolute z-[60] top-0 inset-x-0 flex items-center space-x-4 mb-4 p-2 bg-background/40  backdrop-blur-md">
          <Image
            src={repository.avatarUrl}
            alt={`${repository.owner}'s avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{repository.name}</h2>
            <p className="text-sm text-muted-foreground ">{repository.owner}</p>
          </div>
        </div>
        <div
          className="rounded-md p-4 overflow-y-auto font-mono text-sm space-y-2 relative pt-20"
          ref={scrollRef}
          onScroll={handleScroll}
          style={{ height: "500px" }}
        >
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-1"
            >
              <span className="text-muted-foreground">
                {new Date(log.createdAt).toString()}
              </span>
              <span className="text-foreground whitespace-pre-wrap">
                {log.message}
              </span>
            </div>
          ))}
        </div>
        <AnimatePresence>
          {!autoScroll && (
            <motion.button
              onClick={scrollToBottom}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-4 right-4 bg-muted text-muted-foreground p-3 rounded-full cursor-pointer"
            >
              <ArrowDown size={24} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </MaxWidthWrapper>
  );
}

export default Terminal;
