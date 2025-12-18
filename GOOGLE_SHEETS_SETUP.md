# 📊 GOOGLE SHEETS INTEGRATION - Paprasčiausias Sprendimas

## ✅ Kas bus padaryta
- Chatbot pokalbiai automatiškai rašomi į Google Sheets
- Matote visus pokalbius kaip lentelę
- Galite filtruoti, analizuoti, eksportuoti
- 100% nemokamas
- Nereikia jokių trečių šalių platformų

---

## 🚀 SETUP (10 minučių)

### ŽINGSNIS 1: Sukurti Google Sheet (2 min)

1. **Atidarykite:** https://sheets.google.com/
2. **Sukurkite naują Sheet:**
   - Click "+ Blank" (naujas tuščias sheet)
   - Pervadinkite į: **"VECTICUM Chatbot Conversations"**

3. **Sukurkite antraštės eilutę:**
   - A1: `Timestamp`
   - B1: `Session ID`
   - C1: `User Email`
   - D1: `Question`
   - E1: `AI Reply`

4. **Pervadinkite Sheet tab:**
   - Apačioje kairėje "Sheet1" → right click → Rename
   - Pakeiskite į: `Conversations`

5. **Nukopijuokite Sheet ID:**
   - URL atrodo taip: `https://docs.google.com/spreadsheets/d/1ABC-xyz123/edit`
   - Sheet ID yra viduryje: `1ABC-xyz123`
   - **IŠSAUGOKITE ŠĮ ID** - reikės vėliau

---

### ŽINGSNIS 2: Gauti Google Sheets API Key (3 min)

1. **Eikite į:** https://console.cloud.google.com/

2. **Sukurkite projektą (jei neturite):**
   - Click "Select a project" → "New Project"
   - Name: `VECTICUM Chatbot`
   - Click "Create"

3. **Įjunkite Google Sheets API:**
   - Kairėje meniu: "APIs & Services" → "Library"
   - Ieškokite: `Google Sheets API`
   - Click rezultate → "Enable"

4. **Sukurkite API Key:**
   - Kairėje: "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "API key"
   - API key bus sugeneruotas
   - **NUKOPIJUOKITE IR IŠSAUGOKITE**

5. **Apribokite API Key (saugumo sumetimais):**
   - Click ant sukurto API key
   - "API restrictions" → "Restrict key"
   - Pasirinkite: "Google Sheets API"
   - Click "Save"

---

### ŽINGSNIS 3: Padaryti Sheet Public (1 min)

1. **Grįžkite į savo Google Sheet**

2. **Click "Share" (viršuje dešinėje)**

3. **General access:**
   - Pakeiskite iš "Restricted" į **"Anyone with the link"**
   - Role: **"Viewer"** (svarbu - tik skaityti!)

4. **Click "Done"**

⚠️ **Svarbu:** Sheet turi būti public su "Viewer" teisėmis, kad API galėtų rašyti

---

### ŽINGSNIS 4: Atnaujinti Vercel Environment Variables (2 min)

1. **Eikite į Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Pasirinkite savo projektą

2. **Settings → Environment Variables**

3. **Pridėkite 3 naujus kintamuosius:**

   **Kintamasis 1:**
   - Key: `GOOGLE_SHEET_ID`
   - Value: `[Jūsų Sheet ID iš Žingsnio 1]`

   **Kintamasis 2:**
   - Key: `GOOGLE_SHEETS_API_KEY`
   - Value: `[Jūsų API Key iš Žingsnio 2]`

   **Kintamasis 3:**
   - Key: `PUBLIC_CHATBOT_API_URL`
   - Value: `/api/chat-sheets`

4. **Išsaugokite visus**

---

### ŽINGSNIS 5: Deploy (1 min)

1. **Push pakeitimus į GitHub:**
```bash
git add .
git commit -m "Add Google Sheets integration for chatbot"
git push
```

2. **Vercel automatiškai redeployins** (~2 min)

3. **Arba manual redeploy:**
   - Vercel → Deployments → ... → Redeploy

---

## ✅ BAIGTA!

Dabar:
- ✅ Chatbotas veikia jūsų svetainėje
- ✅ Visi pokalbiai rašomi į Google Sheets realiu laiku
- ✅ Galite matyti pokalbius Google Sheets (lengviau nei admin panel!)
- ✅ 100% nemokamas sprendimas

---

## 📊 Kaip Naudoti Google Sheets

### Peržiūrėti pokalbius:
- Tiesiog atidarykite savo Google Sheet
- Naujausieji pokalbiai viršuje
- Galite filtruoti pagal datą, email, klausimus

### Filtravimas:
- Data → Filter → Sukurkite filtrus pagal stulpelius
- Pvz.: Rodyti tik šiandienos pokalbius

### Eksportuoti:
- File → Download → Excel/CSV/PDF
- Dalintis su kolegomis

### Analizė:
- Sukurkite pivot tables
- Charts/grafikai
- Formulas (pvz., kiek pokalbių per dieną)

---

## 🔧 Troubleshooting

### Chatbotas neveikia
1. Patikrinkite naršyklės Console (F12)
2. Turėtų rodyti: `/api/chat-sheets` endpoint
3. Jei error - patikrinkite Vercel logs

### Pokalbiai nerašomi į Sheet
1. **Patikrinkite Sheet settings:**
   - Sheet ID teisingas?
   - Sheet pavadinimas: `Conversations` (tiksliai)?
   - Sheet yra Public Viewer access?

2. **Patikrinkite API Key:**
   - API key teisingas Vercel?
   - Google Sheets API enabled?
   - API key restricted tik Sheets API?

3. **Vercel Logs:**
   - Vercel Dashboard → Functions → Logs
   - Ieškokite error pranešimų

### "API key not valid" error
- Google Cloud Console → Credentials
- Sukurkite naują API key
- Atnaujinkite Vercel environment variable

### Sheet permissions error
- Google Sheet → Share → Anyone with link → Viewer
- Arba sukurkite Service Account (sudėtingiau)

---

## 🔐 Saugumas

**Ar saugu daryti Sheet public?**
- ✅ TAIP - jei nustatėte "Viewer" (tik skaityti)
- ✅ API key apribotas tik Sheets API
- ✅ Sheet ID ir API key saugomi Vercel (nematomi public)

**Kas gali matyti Sheet?**
- Tik žmonės su link (nebent pasidalinote)
- Niekas negali rašyti - tik skaityti
- Vercel serveris rašo per API

---

## 📈 Papildomos funkcijos (pasirinktinai)

### Dashboard Sheet
Sukurkite antrą sheet tab "Dashboard" su formulas:
```
=COUNTA(Conversations!A:A)-1  // Viso pokalbių
=COUNTIF(Conversations!A:A,TODAY())  // Šiandien
=UNIQUE(Conversations!C:C)  // Unikalūs email
```

### Email pranešimai
Google Sheets → Tools → Notification rules:
- Pasirinkite "Any changes are made"
- Gausite email kiekvieną kartą kai ateina pokalbis

### Automatinis archyvavimas
Google Apps Script:
- Automatiškai perkelti senus pokalbius į kitą sheet
- Siųsti savaitinius report'us

---

## 🎯 Privalumai vs Render/Railway

| Feature | Google Sheets | Render/Railway |
|---------|---------------|----------------|
| Kaina | ✅ $0 | ⚠️ $0-10/mėn |
| Setup laikas | ✅ 10 min | ⚠️ 20+ min |
| Maintenance | ✅ Jokio | ⚠️ Server management |
| Mobile access | ✅ Google Sheets app | ❌ Reikia admin panel |
| Data export | ✅ 1 click | ⚠️ CSV export |
| Sharing | ✅ Share link | ❌ Login credentials |
| Analytics | ✅ Built-in | ❌ Custom coding |

---

Jei kyla klausimų, kreipkitės! 🚀
