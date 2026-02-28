const STORAGE_KEY = "event-platform-contact";

export const defaultContactInfo = {
  heading: "Contact Us",
  description: "Share your event requirements and our team will reach out with a tailored plan.",
  email: "hello@asquareevents.com",
  phone: "+91 90000 00000",
  location: "Hyderabad, India"
};

export function loadContactInfo() {
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

export function saveContactInfo(info) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  window.dispatchEvent(new CustomEvent("contact-updated"));
}
