import { ImageResponse } from "next/og";

// iOS "Add to Home Screen" icon — same mark as icon.tsx, larger canvas.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #2f6bff, #0d9488)",
        }}
      >
        <svg
          width="104"
          height="104"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 17l5-6 4 4 5-8" />
          <path d="M17 7h4v4" />
        </svg>
      </div>
    ),
    size,
  );
}
