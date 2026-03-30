const PERSON_NAME_REGEX = /^(?=.{2,50}$)[\p{L}]+(?:[ '\-`’][\p{L}]+)*$/u;

function normalizePersonName(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidPersonName(value) {
  return PERSON_NAME_REGEX.test(normalizePersonName(value));
}

module.exports = {
  isValidPersonName,
  normalizePersonName,
  PERSON_NAME_REGEX,
};
