import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Costwatch - Know what your product actually costs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f6f5f0",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#1a1a19",
              lineHeight: 1.1,
              marginBottom: 30,
              maxWidth: 900,
            }}
          >
            Know what your product{" "}
            <span
              style={{
                background: "#ff6b35",
                color: "#1a1a19",
                padding: "0 20px",
              }}
            >
              actually costs
            </span>
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#55534d",
              marginBottom: 40,
              maxWidth: 700,
            }}
          >
            Track your software costs, revenue, renewals, and profit in one place
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 24,
              color: "#8a8782",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#ff6b35",
                }}
              />
              Open Source
            </div>
            <div>·</div>
            <div>Self-Hostable</div>
            <div>·</div>
            <div>Private & Secure</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
