# 📝 Google Apps Script Setup - Paprastas Būdas

## Kodėl reikia Google Apps Script?
API raktai veikia tik skaitymui, bet ne rašymui į Google Sheets.
Google Apps Script leidžia mums rašyti į Sheet be OAuth2 komplikacijų.

---

## 🚀 Setup Instrukcijos (5 minutės)

### 1. Atidarykite savo Google Sheet
- Atidarykite Sheet, kurį sukūrėte: **VECTICUM Chatbot Conversations**
- URL: https://docs.google.com/spreadsheets/d/[JŪSŲ_SHEET_ID]/edit

### 2. Atidarykite Apps Script Editor
1. Google Sheet meniu: **Extensions** → **Apps Script**
2. Tai atvers naują tab su code editor

### 3. Įklijuokite šį kodą
Ištrinkite viską, kas yra Code.gs faile ir įklijuokite:

```javascript
function doPost(e) {
  try {
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get active spreadsheet and Conversations sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Conversations');
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          error: 'Sheet "Conversations" not found'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Append new row with conversation data
    sheet.appendRow([
      data.timestamp,
      data.sessionId,
      data.userEmail,
      data.userMessage,
      data.aiReply
    ]);
    
    // Return success
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data saved successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error
    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function (optional)
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        sessionId: 'test123',
        userEmail: 'test@test.com',
        userMessage: 'Test question',
        aiReply: 'Test response'
      })
    }
  };
  
  const result = doPost(testData);
  Logger.log(result.getContent());
}
```

### 4. Išsaugokite projektą
1. Click **disketo ikoną** arba `Ctrl+S`
2. Pavadinkite projektą: **"VECTICUM Chatbot Logger"**
3. Click **"OK"**

### 5. Deploy kaip Web App
1. Click **"Deploy"** (viršuje dešinėje) → **"New deployment"**
2. Settings:
   - Click **⚙️ (gear icon)** šalia "Select type"
   - Pasirinkite **"Web app"**
3. Configuration:
   - **Description:** `Chatbot data logger v1`
   - **Execute as:** `Me ([jūsų email])`
   - **Who has access:** `Anyone` ⚠️ **SVARBU!**
4. Click **"Deploy"**
5. **Authorize:**
   - Click **"Authorize access"**
   - Pasirinkite savo Google account
   - Click **"Advanced"** → **"Go to VECTICUM Chatbot Logger (unsafe)"**
   - Click **"Allow"**

### 6. Nukopijuokite Web App URL
Po deployment pamatysite:
- **Web app URL:** `https://script.google.com/macros/s/AKfycby.../exec`
- **NUKOPIJUOKITE ŠĮ URL** - tai jūsų webhook!

---

## 🔧 Pridėkite URL į .env failą

Atidarykite `.env` failą ir pridėkite:

```env
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/AKfycby.../exec
```

Pakeiskite į savo Web App URL!

---

## ✅ Testuokite!

### Option 1: Test funkcija Apps Script
1. Apps Script editor → Pasirinkite `testDoPost` iš dropdown
2. Click **▶️ Run**
3. Patikrinkite savo Sheet - turėtų atsirasti nauja eilutė su test duomenimis

### Option 2: Test su chatbot
1. Perkraukite dev serverį (serveris automatiškai perkraus .env)
2. Atidarykite chatbot puslapyje
3. Pasiųskite žinutę
4. Patikrinkite Google Sheet - turėtų atsirasti nauja eilutė!

---

## 🔍 Troubleshooting

### "Sheet 'Conversations' not found"
- Patikrinkite, ar Sheet tab pavadinimas tiksliai `Conversations` (su didžiąja raide)
- Sheet → apačioje kairėje → right click → Rename

### "Authorization required"
- Deploy → Manage deployments → Edit → Re-authorize
- Įsitikinkite, kad "Who has access" yra `Anyone`

### Duomenys nerašomi
- Patikrinkite Execution logs: Apps Script → Executions (kairėje meniu)
- Žiūrėkite error pranešimus

### URL nėra teisingas
- URL turi baigtis su `/exec` (ne `/dev`)
- Naudokite deployment URL, ne editor URL

---

## 🎉 Baigta!

Dabar:
- ✅ Chatbot veikia
- ✅ AI atsakymai generuojami
- ✅ Visi pokalbiai automatiškai išsaugomi į Google Sheets
- ✅ 100% nemokamas sprendimas
- ✅ Nereikia OAuth2, Service Accounts, ar kitų komplikacijų

Visi pokalbiai bus matomi jūsų Google Sheet realiu laiku!
