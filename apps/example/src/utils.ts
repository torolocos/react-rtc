export function generateUserName() {
  const string = crypto.randomUUID().match(/[a-z]/gm)?.join('');
  if (string) {
    const name = filterDuplicatedCharacters(string);

    return toUpperCaseFirstCharacter(name);
  }
}

export function toUpperCaseFirstCharacter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function filterDuplicatedCharacters(string: string) {
  return Array.from(new Set(string)).join('');
}
