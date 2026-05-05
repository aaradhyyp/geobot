import React, { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

const SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";

const randomColors = (count: number) =>
  Array.from({ length: count }, () =>
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  );

interface Props {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
}

export default function TubesBackground({
  children,
  className,
  enableClickInteraction = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // Dynamically import the module directly (Fixes the export/window error)
        const module = await import(/* @vite-ignore */ SCRIPT_URL);
        
        if (cancelled || !canvasRef.current) return;

        // Pull the cursor function straight out of the module
        const TubesCursor = module.default || module.tubesCursor || module.TubesCursor;

        if (!TubesCursor) {
          console.error("TubesCursor not found in module");
          return;
        }

        // Initialize the 3D background
        appRef.current = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#f967fb", "#53bc28", "#6958d5"],
            lights: {
              intensity: 200,
              colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"],
            },
          },
        });
      } catch (e) {
        console.error("Tubes init failed:", e);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction || !appRef.current) return;
    try {
      appRef.current.tubes.setColors(randomColors(3));
      appRef.current.tubes.setLightsColors(randomColors(4));
    } catch (e) {
      console.warn("Color randomize failed:", e);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-screen overflow-hidden bg-black", // Fixed height to fill the screen!
        className
      )}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: "none" }}
      />
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}