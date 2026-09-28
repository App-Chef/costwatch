import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 14, background: "#121212", padding: "0 0 38px" }}>
        <div style={{ width: 26, height: 46, background: "#f6f5f0", borderRadius: 5 }} />
        <div style={{ width: 26, height: 74, background: "#f6f5f0", borderRadius: 5 }} />
        <div style={{ width: 26, height: 104, background: "#e8590c", borderRadius: 5 }} />
      </div>
    ),
    size,
  );
}
