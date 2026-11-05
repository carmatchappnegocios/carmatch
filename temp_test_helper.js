require('dotenv').config();
// copy helper functions
function normalizeSpaces(str) {
  return str.replace(/\s+/g, ' ').trim();
}
function cleanVersion(brand, model, version) {
  if (!version) return '';
  const v = normalizeSpaces(version);
  const b = normalizeSpaces(brand || '');
  const m = normalizeSpaces(model || '');
  if (!b || !m || !v) return v;
  const prefix = `${b} ${m}`;
  const vLower = v.toLowerCase();
  const prefixLower = prefix.toLowerCase();
  if (vLower.startsWith(prefixLower)) {
    let remaining = v.slice(prefix.length);
    remaining = normalizeSpaces(remaining);
    return remaining;
  }
  const vTokens = vLower.split(' ');
  const pTokens = prefixLower.split(' ');
  if (vTokens.length >= pTokens.length) {
    const matches = pTokens.every((tok, i) => vTokens[i] === tok);
    if (matches) {
      const remaining = vTokens.slice(pTokens.length).join(' ');
      return normalizeSpaces(remaining);
    }
  }
  return v;
}
function removeConsecutiveDuplicateWords(str) {
  const words = normalizeSpaces(str).split(' ');
  const out = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && last.toLowerCase() === w.toLowerCase()) continue;
    out.push(w);
  }
  return out.join(' ');
}
function buildVehicleTitle(brand, model, version, year) {
  const b = normalizeSpaces(brand || '');
  const m = normalizeSpaces(model || '');
  const cleanedVersion = cleanVersion(b, m, version);
  const y = year ? String(year) : '';
  const parts = [b, m, cleanedVersion, y].filter(Boolean);
  let title = normalizeSpaces(parts.join(' '));
  title = removeConsecutiveDuplicateWords(title);
  return title;
}

console.log(buildVehicleTitle('Ford','F-150','Ford F-150 King Ranch',2021));
// Expected Ford F-150 King Ranch 2021
console.log(buildVehicleTitle('Chevrolet','Suburban','1500 LT',2017));
// Expected Chevrolet Suburban 1500 LT 2017
console.log(buildVehicleTitle('Ford','F-150','Ford F-150  King Ranch',2021));
// Test extra spaces
