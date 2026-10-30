"use client";

// Content used to tilt with scroll velocity in the WTF theme. It made the whole
// page move while scrolling, so the content now stays put; the wrapper remains
// so the layout markup doesn't change.
export function ScrollSkew({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
