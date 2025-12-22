import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mark this endpoint as server-rendered
export const prerender = false;

// Google Sheets integration - using Google Apps Script Web App
const SHEET_WEBHOOK_URL = import.meta.env.GOOGLE_SHEET_WEBHOOK_URL || '';
const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID || '';
const GOOGLE_API_KEY = import.meta.env.GOOGLE_SHEETS_API_KEY || '';

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

    // Initialize Gemini AI
    let aiReply;
    const geminiApiKey = import.meta.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      // Fallback response if no API key
      aiReply = `Ačiū už jūsų klausimą! Šiuo metu chatbot veikia testiniu režimu. Prašome susisiekti su mumis el. paštu info@vecticum.lt arba telefonu, kad galėtume jums padėti.`;
    } else {
      try {
        const genAI = new GoogleGenerativeAI(geminiApiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        // Generate AI response
        const prompt = `Esi VECTICUM personalo ir dokumentų valdymo sistemos pagalbos asistentas. 
Atsakyk į klausimą lietuviškai, profesionaliai ir draugiškai.

Klausimas: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiReply = response.text();
      } catch (aiError) {
        console.error('Gemini API error:', aiError);
        // Fallback response if AI fails
        aiReply = `Ačiū už jūsų klausimą: "${message}". Šiuo metu susidūrėme su laikinu techniniu sutrikdimu. Prašome susisiekti su mumis tiesiogiai el. paštu info@vecticum.lt arba telefonu, kad galėtume jums padėti.`;
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
