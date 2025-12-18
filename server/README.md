# VECTICUM Chatbot Server

Express.js serveris su Google Gemini AI integracija VECTICUM chatbot funkcionalumui.

## 🚀 Quick Railway Deploy (5 minutės)

### Žingsnis 1: Paruošti GitHub
```bash
# Workspace root direktorijoje
git add .
git commit -m "Add chatbot server for Railway deployment"
git push origin main
```

### Žingsnis 2: Deploy į Railway

1. **Eikite į Railway.app**
   - Atidarykite: https://railway.app/
   - Paspauskite "Login" → Prisijunkite per GitHub

2. **Sukurkite naują projektą**
   - Paspauskite "+ New Project"
   - Pasirinkite "Deploy from GitHub repo"
   - Pasirinkite savo repository (pvz., `DomasLalas/web`)

3. **Konfigūruokite Root Directory**
   - Railway Settings → Service Settings
   - "Root Directory" nustatykite: `/server`
   - Išsaugokite

4. **Pridėkite Environment Variables**
   - Settings → Variables → Raw Editor
   - Įklijuokite:
   ```
   GEMINI_API_KEY=AIzaSyDKJUp3xAU8kDTxU9dNlfkWg9NS7eMm8M4
   PORT=3000
   ```
   - Paspauskite "Add" arba "Update Variables"

5. **Deploy**
   - Railway automatiškai pradės deployment
   - Palaukite ~1-2 minutes
   - Matysite "Deployed" statusą

6. **Gaukite Public URL**
   - Settings → Networking
   - Paspauskite "Generate Domain"
   - Nukopijuokite URL (pvz., `https://web-production-a1b2.up.railway.app`)

### Žingsnis 3: Atnaujinkite Vercel

1. **Eikite į Vercel Dashboard**
   - https://vercel.com/dashboard
   - Pasirinkite savo projektą

2. **Pridėkite Environment Variables**
   - Settings → Environment Variables
   - Pridėkite 2 kintamuosius:

   **Kintamasis 1:**
   - Key: `PUBLIC_CHATBOT_API_URL`
   - Value: `https://jūsų-railway-url.railway.app/api/chat`

   **Kintamasis 2:**
   - Key: `PUBLIC_CHATBOT_CONVERSATIONS_URL`
   - Value: `https://jūsų-railway-url.railway.app/api/conversations`

3. **Redeploy**
   - Deployments → Pasirinkite paskutinį deployment
   - "..." meniu → "Redeploy"
   - Arba tiesiog push'inkite naują commit

### ✅ Baigta!

Jūsų chatbotas dabar veikia:
- ✅ Production svetainėje (Vercel)
- ✅ Pokalbių istorija admin panelėje
- ✅ 24/7 veikimas Railway serveryje

## 🔧 Troubleshooting

### Railway neranda Node.js projekto
- Patikrinkite, ar "Root Directory" nustatytas į `/server`
- Patikrinkite, ar `package.json` yra `server/` direktorijoje

### Serveris crashina
- Railway → Logs → Patikrinkite klaidas
- Įsitikinkite, kad `GEMINI_API_KEY` nustatytas teisingai
- Patikrinkite, ar PORT=3000

### Chatbotas neveikia production
- Patikrinkite Vercel environment variables
- URL turi būti: `https://...railway.app/api/chat` (su `/api/chat` pabaigoje)
- Vercel → Deployments → Redeploy po variable pakeitimų

### Admin panel nerodo pokalbių
- Patikrinkite `PUBLIC_CHATBOT_CONVERSATIONS_URL`
- URL turi būti: `https://...railway.app/api/conversations`
- Patikrinkite naršyklės Console (F12) klaidas

## 📊 Railway Free Tier Limits

- **500 valandų/mėnesį** - Daugiau nei užtenka chatbotui
- **Automatic sleep** - Neramus, kai nėra traffic
- **1GB RAM** - Pakanka Express serveriui

Jei viršijate limits, Railway praneš ir galėsite upgrade'inti.

## 🔄 Auto-Deploy iš GitHub

Railway automatiškai redeployina kai push'inate į GitHub:
```bash
git add .
git commit -m "Update chatbot"
git push
```

Railway aptiks pakeitimus ir redeployins per ~1 minutę.

---

## Diegimo instrukcijos (Localhost)

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
