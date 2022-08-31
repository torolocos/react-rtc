export const generateUserName = () => {
  const toUpperCaseFirstCharacter = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const filterDuplicities = (text?: string[] | null) =>
    Array.from(new Set(text)).join('');

  const name = crypto.randomUUID().match(/[a-z]/gm);

  return toUpperCaseFirstCharacter(filterDuplicities(name).slice(0, 6));
};
