// Ištraukia Kommo custom laukus (Contact, Company, Lead) su ID ir Select reikšmių enum ID.
// Paleidimas (PowerShell):
//   cd C:\Users\DomasLalas\Documents\GitHub\web
//   $env:KOMMO_SUBDOMAIN="isilinskaite"; $env:KOMMO_ACCESS_TOKEN="<token>"; node scripts/kommo-fields.mjs

const subdomain = process.env.KOMMO_SUBDOMAIN;
const token = process.env.KOMMO_ACCESS_TOKEN;

if (!subdomain || !token) {
  console.error('Trūksta KOMMO_SUBDOMAIN arba KOMMO_ACCESS_TOKEN aplinkos kintamųjų.');
  process.exit(1);
}

const base = `https://${subdomain}.kommo.com/api/v4`;
const entities = [
  { label: 'KONTAKTAS (contacts)', path: 'contacts' },
  { label: 'ĮMONĖ (companies)', path: 'companies' },
  { label: 'LEAD (leads)', path: 'leads' },
];

for (const entity of entities) {
  try {
    const res = await fetch(`${base}/${entity.path}/custom_fields`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(`\n[${entity.label}] API klaida ${res.status}:`, await res.text());
      continue;
    }

    const data = await res.json();
    const fields = data?._embedded?.custom_fields ?? [];

    console.log(`\n=== ${entity.label} ===`);
    if (!fields.length) {
      console.log('   (custom laukų nėra)');
      continue;
    }

    for (const f of fields) {
      console.log(`   "${f.name}"  ->  field_id = ${f.id}  (type: ${f.type})`);
      if (Array.isArray(f.enums)) {
        for (const e of f.enums) {
          console.log(`        reikšmė: "${e.value}"  ->  enum_id = ${e.id}`);
        }
      }
    }
  } catch (err) {
    console.error(`\n[${entity.label}] Nepavyko pasiekti Kommo API:`, err);
  }
}
