import { ImageResponse } from "next/og";

export const alt = "Costwatch — Know what your product actually costs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f6f5f0", padding: 72, fontFamily: "sans-serif", color: "#121212" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, width: 64, height: 64, background: "#121212", borderRadius: 10, padding: "0 12px 12px" }}>
            <div style={{ width: 10, height: 16, background: "#f6f5f0", borderRadius: 2 }} />
            <div style={{ width: 10, height: 26, background: "#f6f5f0", borderRadius: 2 }} />
            <div style={{ width: 10, height: 36, background: "#e8590c", borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>Costwatch</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>Know what your product actually costs.</div>
          <div style={{ fontSize: 32, color: "#3d3d3a" }}>Costs, revenue, renewals and profit in one place. Open source.</div>
        </div>
        <div style={{ display: "flex", height: 14, background: "#e8590c", border: "3px solid #121212", borderRadius: 4 }} />
      </div>
    ),
    size,
  );
}
