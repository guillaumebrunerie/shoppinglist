import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => {
  return json(
    {
      short_name: "Listes",
      name: "Listes de courses",
      start_url: "/",
      display: "standalone",
      background_color: "#F0F0F0",
      theme_color: "#142136",
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
