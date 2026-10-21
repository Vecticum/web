// Ištraukia visus Kommo pipeline'us ir jų etapus su ID.
// Paleidimas (PowerShell):
//   $env:KOMMO_SUBDOMAIN="isilinskaite"; $env:KOMMO_ACCESS_TOKEN="<token>"; node scripts/kommo-pipelines.mjs

const subdomain = process.env.KOMMO_SUBDOMAIN;
const token = process.env.KOMMO_ACCESS_TOKEN;

if (!subdomain || !token) {
  console.error('Trūksta KOMMO_SUBDOMAIN arba KOMMO_ACCESS_TOKEN aplinkos kintamųjų.');
  process.exit(1);
}

const url = `https://${subdomain}.kommo.com/api/v4/leads/pipelines`;

try {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error(`Kommo API klaida ${res.status}:`, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const pipelines = data?._embedded?.pipelines ?? [];

  for (const p of pipelines) {
    console.log(`\nPIPELINE: "${p.name}"  ->  pipeline_id = ${p.id}`);
    const statuses = p?._embedded?.statuses ?? [];
    for (const s of statuses) {
      console.log(`   etapas: "${s.name}"  ->  status_id = ${s.id}`);
    }
  }
  console.log('\nNukopijuokite reikiamo etapo pipeline_id ir status_id.');
} catch (err) {
  console.error('Nepavyko pasiekti Kommo API:', err);
  process.exit(1);
}
