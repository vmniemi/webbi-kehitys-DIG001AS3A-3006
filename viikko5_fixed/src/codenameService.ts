const ADJECTIVES = ["Sneaky", "Fuzzy", "Turbo", "Mighty", "Cosmic", "Shadow"];
const ANIMALS = ["Panda", "Otter", "Fox", "Koala", "Badger", "Raven"];

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function getOrCreateCodename(uid: string): string {
  const key = `codename_${uid}`;
  const saved = localStorage.getItem(key);

  if (saved) return saved;

  const codename = `${randomItem(ADJECTIVES)}${randomItem(ANIMALS)}${Math.floor(Math.random() * 9000) + 100}`;
  localStorage.setItem(key, codename);

  return codename;
}