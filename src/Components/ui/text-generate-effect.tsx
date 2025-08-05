"use client";
import React from "react";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "../../lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none"
      },
      {
        duration: duration ?? 1,
        delay: stagger(0.2)
      }
    );
  }, [scope, animate, filter, duration]);

  return (
    <div className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="text-white text-2xl leading-snug tracking-wide">
        <motion.div
  ref={scope}
  className="flex flex-wrap justify-center gap-1 text-center"
>
  {wordsArray.map((word, idx) => (
    <motion.span
      key={word + idx}
      className=" text-white opacity-0 whitespace-pre-wrap"
      style={{
        filter: filter ? "blur(10px)" : "none",
      }}
    >
      {word}{" "}
    </motion.span>
  ))}
</motion.div>

        </div>
      </div>
    </div>
  );
};
