const REFERRAL_STORAGE_KEY = "marketing-os-ref-code";
const REFERRAL_SOURCE_KEY = "marketing-os-ref-source";

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

export function getStoredReferralCode(): string | null {
  const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
  if (!raw) return null;
  const normalized = normalizeReferralCode(raw);
  return normalized || null;
}

export function getStoredReferralSource(): string | null {
  return localStorage.getItem(REFERRAL_SOURCE_KEY);
}

export function storeReferralCode(code: string, source: string = "manual"): void {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return;
  localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  localStorage.setItem(REFERRAL_SOURCE_KEY, source);
}

export function clearStoredReferral(): void {
  localStorage.removeItem(REFERRAL_STORAGE_KEY);
  localStorage.removeItem(REFERRAL_SOURCE_KEY);
}
