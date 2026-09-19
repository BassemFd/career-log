"use client";

import { useTheme } from "./ThemeProvider";

// In light theme, the name renders white with mix-blend-mode: difference —
// against the plain paper background that difference is near-black (reads
// the same as before), but wherever HeroPaint's brush reveals the gradient
// underneath, the same math inverts to that color's complement. The name
// "paints itself" the opposite color of whatever's behind it, live.
export default function NameHeading({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const invert = theme === "light" ? "text-white mix-blend-difference" : "";
  return (
    <h1 className={`relative select-none ${invert} ${className ?? ""}`}>
      {children}
    </h1>
  );
}
