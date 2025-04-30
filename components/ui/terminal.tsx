"use client";

import { RepositoryStatus, type Log, type Repository } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import MaxWidthWrapper from "../global/max-width-wrapper";

interface TerminalProps {
  logs: Log[];
  repository: Repository;
}

function Terminal({ repository, logs }: TerminalProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const formatDate = (createdAt: Date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const date = new Date(createdAt);

    const month = months[date.getMonth()]; // 0-indexed months
    const day = date.getDate();

    const formattedTime = `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    return `${month} ${day} ${formattedTime}`;
  };

  const scrollToBottom = () => {
    setAutoScroll(true);
  };

  const handleScroll = () => {
    if (!terminalRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
    const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 60;

    setAutoScroll(isScrolledToBottom);
    setShowScrollButton(!isScrolledToBottom);
  };

  useEffect(() => {
    const terminalElement = terminalRef.current;
    if (terminalElement) {
      terminalElement.addEventListener("scroll", handleScroll);
      return () => {
        terminalElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  return (
    <MaxWidthWrapper>
      <div className="relative rounded border border-border overflow-hidden h-[calc(100vh-8rem)] flex flex-col">
        <div className="absolute z-[60] top-0 inset-x-0 flex items-center space-x-4 mb-4 p-2 bg-background/40 backdrop-blur-md">
          <Image
            src={repository.avatarUrl || "/placeholder.svg"}
            alt={`${repository.owner}'s avatar`}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="text-lg font-semibold">{repository.name}</h2>
            <p className="text-sm text-muted-foreground">{repository.owner}</p>
          </div>
        </div>
        <div
          ref={terminalRef}
          className="rounded-md p-4 overflow-y-auto text-sm space-y-2 relative pt-20 flex-1"
        >
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-1 tracking-wider"
            >
              <span className="text-muted-foreground flex-shrink-0">
                {formatDate(repository.createdAt)}
              </span>
              <span
                className={`whitespace-pre-wrap  ${
                  log.status === RepositoryStatus.FAILED
                    ? "text-red-500"
                    : log.status === RepositoryStatus.SUCCESS
                    ? "text-green-500"
                    : "text-foreground"
                }`}
              >
                {log.message}
              </span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.3 }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 bg-muted text-muted-foreground rounded-full p-2 shadow-lg z-50"
              aria-label="Scroll to bottom"
            >
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              >
                <ChevronDown size={20} />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </MaxWidthWrapper>
  );
}

export default Terminal;
