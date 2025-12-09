# VECTICUM Chat Server

Express serveris, integruotas su OpenAI API, skirtas VECTICUM svetainės chatbot funkcijai.

## Diegimo instrukcijos

### 1. Įdiekite priklausomybes

```bash
cd server
npm install
```

### 2. Paleiskite serverį

**Development režimu (su auto-reload):**
```bash
npm run dev
```

**Production režimu:**
```bash
npm start
```

Serveris bus pasiekiamas adresu: `http://localhost:3000`

## API Endpoints

### POST /api/chat
Siunčia žinutę į OpenAI ir grąžina atsakymą.

**Request body:**
```json
{
  "message": "Kokios yra VECTICUM sistemos funkcijos?"
}
```

**Response:**
```json
{
  "reply": "VECTICUM sistema turi šias pagrindines funkcijas..."
}
```

### GET /api/health
Serverio būsenos tikrinimas.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-12-08T10:30:00.000Z"
}
```

## Konfigūracija

### Aplinkos kintamieji (.env)

- `OPENAI_API_KEY` - Jūsų OpenAI API raktas
- `PORT` - Serverio portas (numatytasis: 3000)

### OpenAI Model

Naudojamas modelis: `gpt-4o-mini`
- Greitas atsakymas
- Mažesnė kaina
- Puikiai tinka chatbot užduotims

Galite pakeisti į kitus modelius:
- `gpt-4o` - galingesnis, bet brangesnis
- `gpt-3.5-turbo` - ekonomiškas variantas

## Frontend integracija

ChatWidget komponentas automatiškai pridėtas į `MainLayout.astro`.

Chat langas:
- Rodomas dešiniajame apatiniame kampe
- Atsidaro paspaudus mygtuką
- Responvus dizainas
- Animuoti pranešimai
- Typing indicator

## Saugumas

⚠️ **SVARBU:**
- `.env` failas įtrauktas į `.gitignore`
- Niekada nekelkite API raktų į Git
- Production aplinkoje naudokite aplinkos kintamuosius (environment variables)

## Production Deployment

### Vercel/Netlify/Railway

1. Sukurkite naują projektą
2. Pridėkite `OPENAI_API_KEY` environment variable
3. Deploy `server` direktoriją

### Frontend konfigūracija

Pakeiskite `API_URL` ChatWidget.astro faile:

```javascript
const API_URL = 'https://jusu-serveris.com/api/chat';
```

## Troubleshooting

### CORS klaidos
Jei gaunate CORS klaidas, patikrinkite:
- Ar serveris veikia
- Ar cors() middleware įjungtas
- Ar frontend naudoja teisingą URL

### OpenAI API klaidos
- Patikrinkite API rakto galiojimą
- Užtikrinkite, kad turite kreditų
- Patikrinkite rate limits

### Connection refused
- Įsitikinkite, kad serveris paleistas
- Patikrinkite portą (3000)
- Patikrinkite firewall nustatymus

## Plėtra

### Pridėti pokalbių istoriją
Modifikuokite `messages` array, kad saugotų ankstesnius pranešimus:

```javascript
const conversationHistory = [];
// Pridėti user message
conversationHistory.push({ role: "user", content: userMessage });
// Siųsti visą istoriją
```

### Pridėti rate limiting
```bash
npm install express-rate-limit
```

### Pridėti logging
```bash
npm install winston
```

## Pagalba

Jei turite klausimų, kreipkitės į VECTICUM techniką komandą.
