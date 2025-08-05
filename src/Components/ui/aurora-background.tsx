"use client";
import React, { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative flex h-screen flex-col items-center justify-center overflow-hidden bg-black text-white",
          className
        )}
        {...props}
      >
        {/* Aurora sloj - boje */}
        <div
          className="absolute inset-0 z-0 animate-[auroraMove_15s_ease-in-out_infinite] blur-2xl opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg, #3b82f6 10%, #a5b4fc 15%, #93c5fd 20%, #ddd6fe 25%, #60a5fa 30%)",
            backgroundSize: "300% 300%",
            backgroundPosition: "50% 50%",
            maskImage: showRadialGradient
              ? "radial-gradient(ellipse at 100% 0%, black 10%, transparent 70%)"
              : "none",
          }}
        />

        {/* Tamni sloj preko */}
        <div className="absolute inset-0 bg-black opacity-40 z-10 pointer-events-none" />

        {/* Glavni sadržaj */}
        <div className="relative z-20">{children}</div>
      </div>
    </main>
  );
};
