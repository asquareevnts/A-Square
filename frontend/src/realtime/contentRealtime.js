import { buildApiUrl } from "../config/api";
import { syncProductsFromServer } from "../data/productsStore";
import { syncEventsFromServer } from "../data/eventsStore";
import { syncGalleryFromServer } from "../data/galleryStore";
import { syncContactFromServer } from "../data/contactStore";
import { syncSocialLinksFromServer } from "../data/socialLinksStore";

const refreshByKey = {
  products: syncProductsFromServer,
  events: syncEventsFromServer,
  gallery: syncGalleryFromServer,
  contact: syncContactFromServer,
  "social-links": syncSocialLinksFromServer
};

let stream;
let reconnectTimer;

function connect() {
  if (typeof window === "undefined" || stream) {
    return;
  }

  const streamUrl = buildApiUrl("/api/content/stream");
  stream = new EventSource(streamUrl, { withCredentials: true });

  stream.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data || "{}");
      const refresh = refreshByKey[payload?.key];

      if (typeof refresh === "function") {
        void refresh();
      }
    } catch {
      // Ignore malformed stream events
    }
  };

  stream.onerror = () => {
    if (stream) {
      stream.close();
      stream = null;
    }

    if (!reconnectTimer) {
      reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, 2000);
    }
  };
}

export function initRealtimeContentSync() {
  connect();
}
