"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface SwipeCardProps {
  onSwipe: (direction: "right" | "left" | "up") => void;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 100;
const SWIPE_UP_THRESHOLD = 80;

export function SwipeCard({ onSwipe, children }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const opacity = useTransform(
    x,
    [-300, -100, 0, 100, 300],
    [0.5, 1, 1, 1, 0.5],
  );

  const rightIndicatorOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const leftIndicatorOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const upIndicatorOpacity = useTransform(
    y,
    [-SWIPE_UP_THRESHOLD, 0],
    [1, 0],
  );

  const [dragging, setDragging] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    const { offset } = info;

    if (offset.y < -SWIPE_UP_THRESHOLD && Math.abs(offset.x) < SWIPE_THRESHOLD) {
      onSwipe("up");
    } else if (offset.x > SWIPE_THRESHOLD) {
      onSwipe("right");
    } else if (offset.x < -SWIPE_THRESHOLD) {
      onSwipe("left");
    }
  }

  return (
    <motion.div
      className="absolute inset-x-4 top-0 cursor-grab touch-none active:cursor-grabbing"
      style={{ x, y, rotate, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.8}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
    >
      {/* Swipe indicators */}
      <motion.div
        className="pointer-events-none absolute -right-2 top-4 z-10 rounded-lg border-3 border-[var(--color-success)] px-3 py-1 text-sm font-bold text-[var(--color-success)]"
        style={{ opacity: rightIndicatorOpacity, rotate: 12 }}
      >
        保存 ✓
      </motion.div>
      <motion.div
        className="pointer-events-none absolute -left-2 top-4 z-10 rounded-lg border-3 border-[var(--color-danger)] px-3 py-1 text-sm font-bold text-[var(--color-danger)]"
        style={{ opacity: leftIndicatorOpacity, rotate: -12 }}
      >
        スキップ ✕
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-1/2 -top-2 z-10 -translate-x-1/2 rounded-lg border-3 border-[var(--color-warning)] px-3 py-1 text-sm font-bold text-[var(--color-warning)]"
        style={{ opacity: upIndicatorOpacity }}
      >
        関係追加 ↑
      </motion.div>

      <div
        className={`rounded-3xl bg-[var(--color-card)] p-6 shadow-2xl transition-shadow ${
          dragging ? "shadow-[var(--color-primary)]/20" : ""
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
