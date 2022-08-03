import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => {
  return json(
    {
      short_name: "Listes",
      name: "Listes de courses",
      start_url: "/",
      display: "standalone",
      background_color: "#d3d7dd",
      theme_color: "#3b82f6",
      shortcuts: [],
      icons: [
        {
          src: "/icons/icon.png",
          sizes: "any",
          type: "image/png",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
};
