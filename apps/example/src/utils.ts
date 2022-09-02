export function generateUserName() {
  const string = crypto.randomUUID().match(/[a-z]/gm);
  const name = filterDuplicatedCharacters(string).slice(0, 6);

  return toUpperCaseFirstCharacter(name);
}

export function toUpperCaseFirstCharacter(text: string) {
  text.charAt(0).toUpperCase() + text.slice(1);
}

export function filterDuplicatedCharacters(text?: string[] | null) {
  return Array.from(new Set(text)).join('');
}
