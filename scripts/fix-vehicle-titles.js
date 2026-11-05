require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Simple implementations to avoid import TS
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

(async () => {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, brand: true, model: true, version: true, year: true, title: true }
  });
  let updatedCount = 0;
  let versionUpdatedCount = 0;
  for (const v of vehicles) {
    const cleanedVersion = cleanVersion(v.brand, v.model, v.version);
    const newTitle = buildVehicleTitle(v.brand, v.model, cleanedVersion, v.year);
    const updates = {};
    if (cleanedVersion !== (v.version || '')) {
      updates.version = cleanedVersion || null;
      versionUpdatedCount++;
    }
    if (newTitle !== v.title) {
      updates.title = newTitle;
      updatedCount++;
    }
    if (Object.keys(updates).length > 0) {
      await prisma.vehicle.update({
        where: { id: v.id },
        data: updates
      });
    }
  }
  console.log(`Títulos actualizados: ${updatedCount}, versiones limpiadas: ${versionUpdatedCount}`);
  await prisma.$disconnect();
})();
