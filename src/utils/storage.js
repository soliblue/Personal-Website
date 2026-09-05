// Privacy settings and full storage must not prevent the site from loading.
const storage = (kind) => ({
  getItem(key) { try { return window[kind].getItem(key); } catch { return null; } },
  setItem(key, value) { try { window[kind].setItem(key, value); } catch { /* Optional preference. */ } },
});
export const safeStorage = storage('localStorage');
export const safeSessionStorage = storage('sessionStorage');
