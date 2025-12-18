import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Sheets integration
const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID || '';
const GOOGLE_API_KEY = import.meta.env.GOOGLE_SHEETS_API_KEY || '';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, sessionId, userEmail } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini AI
    const geminiApiKey = import.meta.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Generate AI response
    const prompt = `Esi VECTICUM personalo ir dokumentų valdymo sistemos pagalbos asistentas. 
Atsakyk į klausimą lietuviškai, profesionaliai ir draugiškai.

Klausimas: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiReply = response.text();

    // Save to Google Sheets
    if (SHEET_ID && GOOGLE_API_KEY) {
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

// Function to save conversation to Google Sheets
async function saveToGoogleSheets(data: {
  timestamp: string;
  sessionId: string;
  userEmail: string;
  userMessage: string;
  aiReply: string;
}) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Conversations:append?valueInputOption=USER_ENTERED&key=${GOOGLE_API_KEY}`;

  const row = [
    data.timestamp,
    data.sessionId,
    data.userEmail,
    data.userMessage,
    data.aiReply,
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google Sheets API error: ${error}`);
  }

  return response.json();
}
