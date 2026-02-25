const kvStore = new Map<string, string>();

export function getJsonValue<T>(key: string, fallback: T): T {
  const raw = kvStore.get(key);
  if (!raw) {
    kvStore.set(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    kvStore.set(key, JSON.stringify(fallback));
    return fallback;
  }
}

export function setJsonValue<T>(key: string, value: T): void {
  kvStore.set(key, JSON.stringify(value));
}

export function removeJsonValue(key: string): void {
  kvStore.delete(key);
}
