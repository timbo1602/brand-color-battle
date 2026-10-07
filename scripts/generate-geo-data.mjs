import fs from "node:fs";
import path from "node:path";

const sourceCountries = process.argv[2];
const sourceOutlines = process.argv[3];
if (!sourceCountries || !sourceOutlines) {
  throw new Error("Usage: node scripts/generate-geo-data.mjs countries.json outlines.geojson");
}

const selected = new Set("DE FR ES IT PT GB IE NL BE CH AT PL CZ DK SE NO FI IS GR TR UA RO HU BG HR RS SK SI EE LV LT US CA MX BR AR CL CO PE VE UY CN JP KR IN ID TH VN MY SG PH PK BD AU NZ ZA EG MA DZ NG KE ET GH TZ UG RU SA AE IL IR IQ JO KZ MN NP LK CU CR PA DO".split(" "));
const continentNames = { Europe: "Europa", Asia: "Asien", Africa: "Afrika", "North America": "Nordamerika", "South America": "Südamerika", Oceania: "Ozeanien", Antarctica: "Antarktika" };
const raw = JSON.parse(fs.readFileSync(sourceCountries, "utf8"));
const byA3 = new Map(raw.map((country) => [country.cca3, country]));
const flag = (iso) => [...iso].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join("");

const countries = raw
  .filter((country) => selected.has(country.cca2))
  .map((country) => ({
    iso: country.cca2,
    iso3: country.cca3,
    name: country.translations?.deu?.common || country.name.common,
    capital: country.capital?.[0] || "–",
    continent: continentNames[country.continents?.[0]] || country.continents?.[0] || "–",
    lat: country.latlng?.[0] || 0,
    lng: country.latlng?.[1] || 0,
    flag: flag(country.cca2),
    neighbors: (country.borders || []).map((code) => byA3.get(code)?.cca2).filter((iso) => selected.has(iso))
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "de"));

if (countries.length !== 80) throw new Error(`Expected 80 countries, got ${countries.length}`);

const outDir = path.resolve("games/geo-sprint/data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "countries.js"), `// Generated from the open mledoze/countries dataset on 2026-10-07. Local runtime data only.\nwindow.GEO_COUNTRIES = Object.freeze(${JSON.stringify(countries, null, 2)});\n`);

const geo = JSON.parse(fs.readFileSync(sourceOutlines, "utf8"));
const features = geo.features
  .filter((feature) => selected.has(feature.properties.ISO_A2_EH) || selected.has(feature.properties.ISO_A2))
  .map((feature) => ({
    type: "Feature",
    properties: { iso: selected.has(feature.properties.ISO_A2_EH) ? feature.properties.ISO_A2_EH : feature.properties.ISO_A2 },
    geometry: feature.geometry
  }));
fs.writeFileSync(path.join(outDir, "outlines.geojson"), JSON.stringify({ type: "FeatureCollection", features }));
console.log(JSON.stringify({ countries: countries.length, outlines: features.length }));
