import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CTHL · Diagnóstico Pruebas Saber",
    short_name: "CTHL Saber",
    description: "Diagnóstico integral de Pruebas Saber para establecimientos educativos de Bolívar",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1D74BB",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}