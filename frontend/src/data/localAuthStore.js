const ACCOUNTS_KEY = "event-platform-local-accounts";

function readAccounts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function sanitizeUser(account) {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone || "",
    address: account.address || ""
  };
}

export function registerLocalAccount({ fullName, email, phone, password }) {
  const accounts = readAccounts();
  const normalizedEmail = (email || "").trim().toLowerCase();

  const exists = accounts.some((account) => account.email === normalizedEmail);
  if (exists) {
    return { success: false, message: "Account already exists with this email" };
  }

  const newAccount = {
    id: Date.now(),
    fullName: (fullName || "").trim(),
    email: normalizedEmail,
    phone: (phone || "").trim(),
    address: "",
    password
  };

  accounts.push(newAccount);
  writeAccounts(accounts);

  return { success: true, user: sanitizeUser(newAccount) };
}

export function loginLocalAccount({ identifier, password }) {
  const accounts = readAccounts();
  const normalizedIdentifier = (identifier || "").trim().toLowerCase();

  const match = accounts.find(
    (account) => account.email === normalizedIdentifier && account.password === password
  );

  if (!match) {
    return { success: false, message: "Invalid email or password" };
  }

  return { success: true, user: sanitizeUser(match) };
}
