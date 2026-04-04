import { buildApiUrl } from "../config/api";

const STORAGE_KEY = "event-platform-contact";

export const defaultContactInfo = {
  heading: "Contact Us",
  description: "Share your event requirements and our team will reach out with a tailored plan.",
  email: "asquareevents99@gmail.com",
  phone: "+91 9985830114",
  location: "Nijampet, Kukatpally, Hyderabad",
  address: "Nijampet, Kukatpally, Hyderabad - 500090"
};

function readLocalContactInfo() {
  if (typeof window === "undefined") {
    return defaultContactInfo;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultContactInfo;
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultContactInfo,
      ...(parsed || {})
    };
  } catch {
    return defaultContactInfo;
  }
}

function writeLocalContactInfo(info) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  window.dispatchEvent(new CustomEvent("contact-updated"));
}

async function syncContactFromServer() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const response = await fetch(buildApiUrl("/api/content/contact"), {
      credentials: "include"
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const info = {
      ...defaultContactInfo,
      ...(data?.info || readLocalContactInfo())
    };
    writeLocalContactInfo(info);
  } catch {
    // Keep local fallback silently
  }
}

export function loadContactInfo() {
  const localInfo = readLocalContactInfo();
  void syncContactFromServer();
  return localInfo;
}

export function saveContactInfo(info) {
  const mergedInfo = {
    ...defaultContactInfo,
    ...(info || {})
  };

  writeLocalContactInfo(mergedInfo);

  void fetch(buildApiUrl("/api/content/contact"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ info: mergedInfo })
  }).catch(() => {
    // Keep local fallback silently
  });
}
