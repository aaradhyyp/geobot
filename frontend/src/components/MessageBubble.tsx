import { motion } from "framer-motion";
import { ExternalLink, Bot, User } from "lucide-react";
import type { Source } from "../lib/api";
import { cn } from "../lib/utils";

interface Props {
  role: "user" | "bot";
  content: string;
  sources?: Source[];
}

export default function MessageBubble({ role, content, sources }: Props) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 backdrop-blur-md border shadow-xl",
          isUser
            ? "bg-white/15 border-white/25 text-white"
            : "bg-black/40 border-white/10 text-white/95"
        )}
      >
        <div className="whitespace-pre-wrap leading-relaxed text-sm">
          {content}
        </div>
        {sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-xs text-white/60 mb-2 uppercase tracking-wider">
              Sources
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.slice(0, 5).map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
                >
                  <span className="text-white/90">{s.source}</span>
                  <ExternalLink className="w-3 h-3 text-white/60" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
}
