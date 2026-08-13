import { ImageResponse } from "next/og";

// Browser tab favicon — matches the header Logo() badge in SiteHeader.tsx
// (rounded gradient square, white uptrend-arrow glyph).
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          background: "linear-gradient(135deg, #2f6bff, #0d9488)",
        }}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.6"
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
