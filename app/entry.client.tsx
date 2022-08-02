import * as React from "react";
import { RemixBrowser } from "@remix-run/react";
// import { hydrateRoot } from "react-dom/client";

// function hydrate() {
// 	React.startTransition(() => {
// 		hydrateRoot(
// 			document,
// 			<React.StrictMode>
// 				<RemixBrowser />
// 			</React.StrictMode>
// 		);
// 	});
// }

// if (window.requestIdleCallback) {
// 	window.requestIdleCallback(hydrate);
// } else {
// 	window.setTimeout(hydrate, 1);
// }

import { hydrate } from "react-dom";

hydrate(<RemixBrowser />, document);

if ("serviceWorker" in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/entry.worker.js")
      .then(() => navigator.serviceWorker.ready)
      .then(() => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "SYNC_REMIX_MANIFEST",
            manifest: window.__remixManifest,
          });
        } else {
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            navigator.serviceWorker.controller?.postMessage({
              type: "SYNC_REMIX_MANIFEST",
              manifest: window.__remixManifest,
            });
          });
        }
      })
      .catch((error) => {
        console.error("Service worker registration failed", error);
      });
  });
}
