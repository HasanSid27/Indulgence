import { ImageResponse } from "next/og";

export const alt = "iNdulgence — small-batch dessert studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#8d1a1c", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 150, letterSpacing: -4, display: "flex" }}>iNdulgence</div>
        <div style={{ fontSize: 30, marginTop: 20, letterSpacing: 6, textTransform: "uppercase", opacity: 0.85 }}>Small-batch dessert studio · Kanpur</div>
      </div>
    ),
    size,
  );
}
