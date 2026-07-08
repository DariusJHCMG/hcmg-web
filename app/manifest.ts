import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Harris Capital Mortgage Group",
    short_name: "HCMG",
    description: "Loan Officer Portal — Harris Capital Mortgage Group",
    start_url: "/portal",
    scope: "/portal",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f0eb",
    theme_color: "#142850",
    categories: ["finance", "business"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
