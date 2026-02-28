import placeholderEventImage from "../assets/Logo.png";

const STORAGE_KEY = "event-platform-events";

export const defaultEvents = [
  {
    id: 1,
    name: "Music Fest",
    image: placeholderEventImage,
    date: "12 Mar 2026",
    type: "Live Performance",
    description: "Discover amazing experiences curated for communities, creators, and brands."
  },
  {
    id: 2,
    name: "Tech Conference",
    image: placeholderEventImage,
    date: "19 Mar 2026",
    type: "Innovation Summit",
    description: "Connect with leaders and explore cutting-edge event technology and ideas."
  },
  {
    id: 3,
    name: "Startup Meetup",
    image: placeholderEventImage,
    date: "26 Mar 2026",
    type: "Networking",
    description: "Build meaningful collaborations with founders, investors, and innovators."
  }
];

function normalizeEvents(events) {
  return events.map((event, index) => ({
    id: event?.id ?? Date.now() + index,
    name: event?.name || `Event ${index + 1}`,
    image: event?.image || placeholderEventImage,
    date: event?.date || "TBD",
    type: event?.type || "General",
    description: event?.description || "Event details coming soon."
  }));
}

export function loadEvents() {
  if (typeof window === "undefined") {
    return defaultEvents;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultEvents;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? normalizeEvents(parsed) : defaultEvents;
  } catch {
    return defaultEvents;
  }
}

export function saveEvents(events) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  window.dispatchEvent(new CustomEvent("events-updated"));
}
