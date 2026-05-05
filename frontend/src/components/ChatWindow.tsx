import { useRef, useState, useEffect } from "react";
import { Send } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { sendMessage, type Source } from "../lib/api";

interface Msg {
  role: "user" | "bot";
  content: string;
  sources?: Source[];
}

// 1. Tell TypeScript that ChatWindow is allowed to accept incomingQuestion
interface ChatWindowProps {
  incomingQuestion?: string;
}

// 2. Add the prop to the function here
export default function ChatWindow({ incomingQuestion }: ChatWindowProps) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      content:
        "Hello! I'm GeoBot. Ask me anything about geopolitics or current affairs — wars, elections, diplomacy, global economy. I pull from live news every few hours.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // 3. We modify handleSend so it can take a specific string (from the sidebar) OR the input box
  const handleSend = async (overrideText?: string) => {
    // If the sidebar sent text, use that. Otherwise, use what the user typed.
    const text = (typeof overrideText === "string" ? overrideText : input).trim();
    
    if (!text || loading) return;
    
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const history = [];
    for (let i = 0; i < messages.length - 1; i += 2) {
      if (messages[i]?.role === "user" && messages[i + 1]?.role === "bot") {
        history.push({
          user: messages[i].content,
          bot: messages[i + 1].content,
        });
      }
    }

    try {
      const res = await sendMessage(text, history);
      setMessages((m) => [
        ...m,
        { role: "bot", content: res.answer, sources: res.sources },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          content: `❌ Connection error: ${
            e.message || "Could not reach backend. Is it running?"
          }`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 4. This listens for a click from the Sidebar and instantly sends it
  useEffect(() => {
    if (incomingQuestion) {
      handleSend(incomingQuestion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingQuestion]);

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto pointer-events-auto">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-5"
      >
        <AnimatePresence>
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              role={m.role}
              content={m.content}
              sources={m.sources}
            />
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/15 px-4 py-2 shadow-2xl">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about geopolitics..."
            disabled={loading}
            className="flex-1 bg-transparent text-white placeholder-white/40 outline-none text-sm py-2"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 hover:scale-105 active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="text-center text-white/30 text-xs mt-2">
          Powered by Gemini · Live news from Reuters, BBC, Al Jazeera & more
        </div>
      </div>
    </div>
  );
}