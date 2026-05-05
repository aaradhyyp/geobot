import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Database, Globe2, Sparkles } from "lucide-react";
import { getNewsStatus, refreshNews } from "../lib/api";

// 1. We define a prop so App.tsx can pass down a click function
interface SidebarProps {
  onSuggestionClick: (text: string) => void;
}

// 2. We accept that prop here
export default function Sidebar({ onSuggestionClick }: SidebarProps) {
  const [total, setTotal] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("—");

  const load = async () => {
    try {
      const data = await getNewsStatus();
      setTotal(data.total_articles);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await refreshNews();
      setTotal(data.total);
      setLastUpdate(new Date(data.updated_at).toLocaleString());
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  const examples = [
    "Latest on Russia–Ukraine war?",
    "What happened at the recent G20 summit?",
    "Current India–China border situation?",
    "What are the new EU sanctions on Iran?",
    "Update on Middle East ceasefire talks?",
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="hidden lg:flex flex-col w-80 h-full p-5 backdrop-blur-xl bg-black/30 border-r border-white/10 pointer-events-auto"
    >
      <div className="flex items-center gap-2 mb-6">
        <Globe2 className="w-7 h-7 text-pink-400" />
        <h1 className="text-xl font-bold text-white tracking-tight">
          GeoBot
        </h1>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
        <div className="flex items-center gap-2 mb-2 text-white/70 text-xs uppercase tracking-wider">
          <Database className="w-4 h-4" />
          News Index
        </div>
        <div className="text-3xl font-bold text-white">{total}</div>
        <div className="text-xs text-white/50 mt-1">
          articles indexed · last refresh: {lastUpdate}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh News"}
        </button>
      </div>

      <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex-1">
        <div className="flex items-center gap-2 mb-3 text-white/70 text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Try asking
        </div>
        <ul className="space-y-2">
          {examples.map((e, i) => (
            <li
              key={i}
              onClick={() => onSuggestionClick(e)} // 3. Added the click handler!
              className="text-sm text-white/80 hover:text-white px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer transition-colors" // 4. Changed cursor-default to cursor-pointer
            >
              {e}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 text-xs text-white/40 text-center">
        Click background to randomize neon colors
      </div>
    </motion.aside>
  );
}
