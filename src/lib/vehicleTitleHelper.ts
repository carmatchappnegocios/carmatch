/**
 * Helpers para normalizar títulos y versiones de vehículos.
 * Evita duplicación de marca/modelo cuando la versión ya los incluye.
 */

export function normalizeSpaces(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

export function cleanVersion(brand: string, model: string, version: string | null | undefined): string {
  if (!version) return '';
  const v = normalizeSpaces(version);
  const b = normalizeSpaces(brand || '');
  const m = normalizeSpaces(model || '');
  if (!b || !m || !v) return v;

  const prefix = `${b} ${m}`;
  const vLower = v.toLowerCase();
  const prefixLower = prefix.toLowerCase();

  // Si la versión empieza con marca + modelo (insensible a mayúsculas y espacios)
  if (vLower.startsWith(prefixLower)) {
    // Quitar prefijo
    let remaining = v.slice(prefix.length);
    remaining = normalizeSpaces(remaining);
    return remaining;
  }

  // Caso adicional: versión empieza con marca sola y luego modelo separado por espacios extra
  // Normalizar comparando token por token
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

export function removeConsecutiveDuplicateWords(str: string): string {
  const words = normalizeSpaces(str).split(' ');
  const out: string[] = [];
  for (const w of words) {
    const last = out[out.length - 1];
    if (last && last.toLowerCase() === w.toLowerCase()) {
      continue;
    }
    out.push(w);
  }
  return out.join(' ');
}

export function buildVehicleTitle(brand: string, model: string, version: string | null | undefined, year: number | null | undefined): string {
  const b = normalizeSpaces(brand || '');
  const m = normalizeSpaces(model || '');
  // Limpiar versión eliminando prefijo marca+modelo
  const cleanedVersion = cleanVersion(b, m, version);
  const y = year ? String(year) : '';

  // Construir título base
  const parts = [b, m, cleanedVersion, y].filter(Boolean);
  let title = normalizeSpaces(parts.join(' '));

  // Seguridad: eliminar palabras consecutivas repetidas
  title = removeConsecutiveDuplicateWords(title);

  return title;
}
