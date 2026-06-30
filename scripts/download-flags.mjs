import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'flags');

/** Team id → ISO 3166-1 alpha-2 (flagcdn.com) */
const TEAM_FLAGS = {
  0: 'de',   // Germany
  1: 'py',   // Paraguay
  2: 'fr',   // France
  3: 'se',   // Sweden
  4: 'za',   // South Africa
  5: 'ca',   // Canada
  6: 'nl',   // Netherlands
  7: 'ma',   // Morocco
  8: 'pt',   // Portugal
  9: 'hr',   // Croatia
  10: 'es',  // Spain
  11: 'at',  // Austria
  12: 'us',  // USA
  13: 'ba',  // Bosnia
  14: 'be',  // Belgium
  15: 'sn',  // Senegal
  16: 'br',  // Brazil
  17: 'jp',  // Japan
  18: 'ci',  // Cote d'Ivoire
  19: 'no',  // Norway
  20: 'mx',  // Mexico
  21: 'ec',  // Ecuador
  22: 'gb-eng', // England
  23: 'cd',  // DR Congo
  24: 'ar',  // Argentina
  25: 'cv',  // Cape Verde
  26: 'au',  // Australia
  27: 'eg',  // Egypt
  28: 'ch',  // Switzerland
  29: 'dz',  // Algeria
  30: 'co',  // Colombia
  31: 'gh',  // Ghana
};

await mkdir(outDir, { recursive: true });

for (const [id, code] of Object.entries(TEAM_FLAGS)) {
  const url = `https://flagcdn.com/w160/${code}.png`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed ${id} (${code}): ${res.status}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(outDir, `${id}.png`), buf);
  console.log(`Saved flags/${id}.png (${code})`);
}

console.log('Done.');
