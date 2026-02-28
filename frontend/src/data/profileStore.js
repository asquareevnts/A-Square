const STORAGE_KEY = "event-platform-profile-details";

function readAllProfiles() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAllProfiles(value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("profile-updated"));
}

export function loadProfileDetails(identityKey, defaults) {
  const allProfiles = readAllProfiles();
  const existing = allProfiles[identityKey] || {};

  return {
    ...defaults,
    ...existing
  };
}

export function saveProfileDetails(identityKey, profileData) {
  const allProfiles = readAllProfiles();
  allProfiles[identityKey] = profileData;
  writeAllProfiles(allProfiles);
}
