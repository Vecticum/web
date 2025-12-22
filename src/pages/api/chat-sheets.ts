import type { APIRoute } from 'astro';

// Mark this endpoint as server-rendered
export const prerender = false;

// Google Sheets integration - using Google Apps Script Web App
const SHEET_WEBHOOK_URL = import.meta.env.GOOGLE_SHEET_WEBHOOK_URL || '';
const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID || '';
const GOOGLE_API_KEY = import.meta.env.GOOGLE_SHEETS_API_KEY || '';

// --- Lightweight knowledge base support (keyword matching) ---
type KBEntry = { id: string; title: string; tags?: string[]; content: string };
let kbCache: KBEntry[] | null = null;

async function loadKnowledgeBase(): Promise<KBEntry[]> {
  if (kbCache) return kbCache;
  try {
    // Import JSON packaged with the build (under project root /server)
    const mod: any = await import('../../../server/knowledgeBase.json');
    kbCache = (mod?.default ?? mod) as KBEntry[];
  } catch (err) {
    console.warn('Nepavyko įkelti knowledgeBase.json:', err);
    kbCache = [];
  }
  return kbCache;
}

function pickContext(entries: KBEntry[], query: string, maxItems = 3): KBEntry[] {
  if (!query || entries.length === 0) return [];
  const normalized = query.toLowerCase();
  const keywords = normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  return entries
    .map((e) => {
      const hay = `${e.title} ${(e.tags ?? []).join(' ')} ${e.content}`.toLowerCase();
      let score = 0;
      for (const w of keywords) if (hay.includes(w)) score += 1;
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map((x) => x.e);
}

// Simple rule-based fallback answers for common queries
function generateFallbackReply(message: string): string {
  const q = (message || '').toLowerCase();
  if (/(kas\s+yra|what\s+is).*vecticum/.test(q) || q.includes('kas yra vecticum') || q.includes('vecticum')) {
    return (
      'VECTICUM – tai personalo ir dokumentų valdymo sistema, padedanti automatizuoti įdarbinimą, '
      + 'darbo sutarčių ir dokumentų tvirtinimą, atostogų bei komandiruočių procesus, darbo užmokesčio '
      + 'skaičiavimą ir integracijas su „Sodra“, VMI, i.SAF/i.VAZ. Sistema pritaikyta augančioms įmonėms, '
      + 'užtikrina saugumą ir atitiktį teisės aktams.'
    );
  }
  if (q.includes('kaina') || q.includes('planai') || q.includes('pricing') || q.includes('planu')) {
    return (
      'Kainodara priklauso nuo pasirinkto plano ir darbuotojų skaičiaus. '
      + 'Siūlome Basic, Advanced ir Enterprise planus. Parašykite mums arba palikite el. paštą – atsiųsime pasiūlymą.'
    );
  }
  if (q.includes('demo') || q.includes('pabandyti') || q.includes('bandomoji')) {
    return (
      'Galite užsiregistruoti demonstracijai per puslapį „Registracija demo“ arba parašyti el. paštu info@vecticum.lt – '
      + 'pademonstruosime sistemą ir atsakysime į klausimus.'
    );
  }
  if (q.includes('migracija') || q.includes('perkelti') || q.includes('perkėlimas')) {
    return (
      'Padedame migruoti duomenis iš esamų sistemų (Excel, buhalterinės programos, HR sistemos). '
      + 'Parengiame duomenų struktūrą, atliekame patikrinimus ir mokymus.'
    );
  }
  if (q.includes('kontakt') || q.includes('susisiekti') || q.includes('telefon') || q.includes('email')) {
    return 'Kontaktai: info@vecticum.lt • Tel.: +370 000 00000. Lauksime žinutės!';
  }
  return (
    'Ačiū už klausimą! Šiuo metu negalime sugeneruoti AI atsakymo. '
    + 'Parašykite, kuo konkrečiai galiu padėti, arba susisiekite el. paštu info@vecticum.lt – atsakysime greitai.'
  );
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse JSON body safely
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const { message, sessionId, userEmail } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini via REST API (avoids SDK model/version issues)
    let aiReply: string;
    const geminiApiKey = import.meta.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      aiReply = `Ačiū už jūsų klausimą! Šiuo metu chatbot veikia testiniu režimu. Prašome susisiekti su mumis el. paštu info@vecticum.lt arba telefonu, kad galėtume jums padėti.`;
    } else {
      try {
        const kb = await loadKnowledgeBase();
        const ctx = pickContext(kb, message, 3);
        const contextText =
          ctx.length > 0
            ? ctx
                .map(
                  (c) => `# ${c.title}\nŽymos: ${(c.tags ?? []).join(', ')}\n${c.content}`
                )
                .join('\n\n')
            : 'Papildomas kontekstas nerastas – remkis bazine VECTICUM informacija.';

        const prompt = `Tu esi VECTICUM personalo ir dokumentų valdymo sistemos pagalbos asistentas.
Tavo tikslas – aiškiai, trumpai ir profesionaliai lietuvių kalba atsakyti į kliento klausimus.
Naudok sąrašus, kai tai padeda; venk perteklinių frazių; jei trūksta tikslios informacijos – pasiūlyk susisiekti arba užsiregistruoti demonstracijai.

Papildomas kontekstas (vidinė žinių bazė):
${contextText}

Kliento klausimas: ${message}

Tavo atsakymas (LT):`;

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          }
        );

        const data = await resp.json();
        if (!resp.ok) {
          console.error('Gemini API error:', data);
          throw new Error(data?.error?.message || 'Gemini API error');
        }
        aiReply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          'Atsiprašome, šiuo metu negaliu atsakyti. Bandykite dar kartą.';
      } catch (aiError) {
        console.error('Gemini API error:', aiError);
        aiReply = generateFallbackReply(message);
      }
    }

    // Save to Google Sheets via Web App
    if (SHEET_WEBHOOK_URL) {
      try {
        await saveToGoogleSheets({
          timestamp: new Date().toISOString(),
          sessionId: sessionId || 'unknown',
          userEmail: userEmail || 'Not provided',
          userMessage: message,
          aiReply: aiReply,
        });
      } catch (error) {
        console.error('Failed to save to Google Sheets:', error);
        // Don't fail the request if sheets save fails
      }
    }

    return new Response(
      JSON.stringify({ reply: aiReply }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// Function to save conversation to Google Sheets via Apps Script Web App
async function saveToGoogleSheets(data: {
  timestamp: string;
  sessionId: string;
  userEmail: string;
  userMessage: string;
  aiReply: string;
}) {
  // Use Google Apps Script Web App endpoint
  const response = await fetch(SHEET_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Sheets Web App error: ${error}`);
  }

  return response.json();
}
