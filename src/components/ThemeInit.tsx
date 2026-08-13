"use client";

import { useEffect } from "react";

// Applies the saved theme after mount. The document defaults to `.dark`
// (set on <html> during SSR), so only users who chose light mode may see a
// brief flash — an acceptable tradeoff that keeps the tree free of an inline
// script tag (which React 19 refuses to execute on the client).
export default function ThemeInit() {
  useEffect(() => {
    try {
      const t = localStorage.getItem("nx-theme");
      document.documentElement.classList.toggle("dark", t !== "light");
    } catch {}
  }, []);
  return null;
}
