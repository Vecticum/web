# 🚀 RENDER.COM DEPLOYMENT - 100% NEMOKAMAS

## Render.com privalumai
- ✅ **100% nemokamas amžinai**
- ✅ 750 valandų/mėnesį (užtenka chatbotui)
- ✅ Automatinis GitHub deployment
- ✅ HTTPS sertifikatas automatiškai
- ⚠️ Cold start po 15 min (pabunda per ~30-60s)

---

## 📋 DEPLOYMENT ŽINGSNIS PO ŽINGSNIO

### ŽINGSNIS 1: Paruošti GitHub (2 min)

1. **Commit ir Push kodą:**
```bash
git add .
git commit -m "Prepare chatbot for Render deployment"
git push origin main
```

---

### ŽINGSNIS 2: Sukurti Render paskyrą (1 min)

1. **Eikite į:** https://render.com/
2. **Paspauskite:** "Get Started for Free"
3. **Prisijunkite per GitHub** (vienas mygtukas)
4. **Leiskite Render prieigą** prie jūsų repositories

---

### ŽINGSNIS 3: Sukurti Web Service (3 min)

1. **Render Dashboard:**
   - Paspauskite **"+ New"** viršuje dešinėje
   - Pasirinkite **"Web Service"**

2. **Pasirinkite GitHub Repo:**
   - Suraskite savo repository (pvz., `DomasLalas/web`)
   - Paspauskite **"Connect"**

3. **Konfigūruokite Service:**

   **Name (pavadinimas):**
   ```
   vecticum-chatbot
   ```

   **Region:**
   ```
   Frankfurt (EU Central) - artimiausias Lietuvai
   ```

   **Root Directory:**
   ```
   server
   ```
   ⚠️ SVARBU: Būtinai nustatykite `/server` - ne root!

   **Runtime:**
   ```
   Node
   ```

   **Build Command:**
   ```
   npm install
   ```

   **Start Command:**
   ```
   node server.js
   ```

   **Plan:**
   ```
   Free
   ```
   ✅ Pasirinkite FREE planą!

4. **Paspauskite "Advanced"** ir pridėkite Environment Variables:

   **Paspauskite "Add Environment Variable" 2 kartus:**

   **Variable 1:**
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyDKJUp3xAU8kDTxU9dNlfkWg9NS7eMm8M4`

   **Variable 2:**
   - Key: `PORT`
   - Value: `3000`

5. **Paspauskite:** **"Create Web Service"**

6. **Palaukite deployment (~2-3 minutės)**
   - Matysite logs ekrane
   - Kai pasirodys "Live" žalias statusas - gatava!

---

### ŽINGSNIS 4: Gauti Public URL (1 min)

1. **Viršuje kairėje** matysite jūsų service URL:
   ```
   https://vecticum-chatbot.onrender.com
   ```
   (Jūsų URL gali būti kitoks)

2. **NUKOPIJUOKITE ŠĮ URL** - reikės kitame žingsnyje

3. **Išbandykite ar veikia:**
   - Atidarykite naujame lange: `https://jūsų-url.onrender.com/api/health`
   - Turėtumėte matyti: `{"status":"ok","timestamp":"..."}`

---

### ŽINGSNIS 5: Atnaujinti Vercel (2 min)

1. **Eikite į Vercel:**
   - https://vercel.com/dashboard
   - Pasirinkite savo projektą

2. **Settings → Environment Variables**

3. **Pridėkite 2 naujus kintamuosius:**

   **Kintamasis 1:**
   - Key: `PUBLIC_CHATBOT_API_URL`
   - Value: `https://jūsų-render-url.onrender.com/api/chat`
   
   ⚠️ Pakeiskite `jūsų-render-url` savo tikru Render URL!

   **Kintamasis 2:**
   - Key: `PUBLIC_CHATBOT_CONVERSATIONS_URL`
   - Value: `https://jūsų-render-url.onrender.com/api/conversations`

4. **Paspauskite "Save"**

5. **Redeploy Vercel:**
   - Deployments → Paskutinis deployment
   - "..." meniu → "Redeploy"
   
   Arba paprasčiau - padarykite naują commit:
   ```bash
   git commit --allow-empty -m "Trigger Vercel redeploy"
   git push
   ```

---

## ✅ BAIGTA!

Dabar jūsų chatbotas veikia:
- ✅ **Production svetainėje** (per Vercel)
- ✅ **Pokalbių istorija** admin panelėje
- ✅ **24/7 veikimas** (su cold start po neaktyvumo)
- ✅ **100% NEMOKAMAI**

---

## 🧪 Testavimas

1. **Atidarykite savo svetainę:**
   - https://jūsų-domena.vercel.app
   - Išbandykite chatbotą

2. **Patikrinkite admin panelį:**
   - https://jūsų-domena.vercel.app/admin/chat-logs
   - Turėtumėte matyti pokalbių istoriją

---

## ⚙️ Cold Start Problemos Sprendimas (Pasirinktinai)

Cold start reiškia, kad pirmas apsilankymas lėtas. Galite tai išspręsti:

### Variantas A: Cron-job.org (Rekomenduoju)
1. Eikite į: https://cron-job.org/
2. Sukurkite paskyrą
3. Pridėkite naują cron job:
   - URL: `https://jūsų-url.onrender.com/api/health`
   - Interval: Kas 10 minučių
4. Tai "žadins" serverį reguliariai

### Variantas B: UptimeRobot
1. Eikite į: https://uptimerobot.com/
2. Pridėkite monitorių savo Render URL
3. Check interval: 10 minučių

---

## 🔧 Troubleshooting

### "Build Failed"
- Patikrinkite Root Directory: turi būti `server`
- Patikrinkite Build Command: `npm install`
- Žiūrėkite Render logs - rodys konkrečią klaidą

### "Application Error" / Serveris nestartuoja
- Patikrinkite Environment Variables:
  - `GEMINI_API_KEY` - turi būti nustatytas
  - `PORT=3000`
- Render → Logs → Ieškokite raudonų error pranešimų

### Chatbotas neveikia production
- Patikrinkite Vercel Environment Variables
- URL turi būti pilnas: `https://...onrender.com/api/chat`
- Vercel → Deployments → Redeploy po pakeitimų
- Patikrinkite naršyklės Console (F12) - rodys klaidas

### Admin panel nerodo pokalbių
- Patikrinkite `PUBLIC_CHATBOT_CONVERSATIONS_URL`
- Turi būti: `https://...onrender.com/api/conversations`
- Atidarykite tą URL naršyklėje - turėtų rodyti JSON masyvą

### Cold start per lėtas
- Naudokite Cron-job.org arba UptimeRobot (žr. aukščiau)
- Arba upgrade'inkite į Render mokamą planą ($7/mėn)

---

## 🔄 Auto-Deploy

Render automatiškai redeployins kai push'inate į GitHub:

```bash
git add .
git commit -m "Update chatbot"
git push
```

Render aptiks pakeitimus ir redeployins per ~2-3 minutes.

---

## 📊 Render Free Tier Limitai

- **750 valandų/mėnesį** - užtenka chatbotui (31 diena × 24h = 744h)
- **512MB RAM** - pakanka Express serveriui
- **100GB bandwidth/mėn** - daugiau nei užtenka
- **Cold start po 15 min** - serveris "miega" kai nėra traffic

**Jei viršijate limitus:**
- Render siūlys upgrade į Starter ($7/mėn)
- Bet chatbotui 99% atvejų užteks free tier

---

## ✨ Papildomos funkcijos

### Custom Domain (Pasirinktinai)
Jei norite savo domeną:
1. Render → Settings → Custom Domain
2. Įveskite domeną (pvz., `api.vecticum.lt`)
3. Pridėkite CNAME įrašą savo DNS

### Logs ir Monitoring
- Render Dashboard → Logs - matote live serverio logs
- Metrics - CPU, Memory naudojimas
- Events - deployment istorija

---

Jei kyla klausimų, kreipkitės! 🚀
