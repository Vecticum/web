import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, "logs");
const LOG_FILE = path.join(LOG_DIR, "conversations.jsonl");

if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

let knowledgeBase = [];
try {
  const kbPath = path.join(__dirname, "knowledgeBase.json");
  const kbRaw = readFileSync(kbPath, "utf-8");
  knowledgeBase = JSON.parse(kbRaw);
} catch (err) {
  console.warn("Nepavyko įkelti knowledgeBase.json:", err.message);
}

function getDynamicContext(query, maxItems = 3) {
  if (!query || knowledgeBase.length === 0) {
    return [];
  }

  const normalized = query.toLowerCase();
  const keywords = normalized.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  const scored = knowledgeBase
    .map((entry) => {
      const haystack = `${entry.title} ${entry.tags?.join(" ") ?? ""} ${entry.content}`.toLowerCase();
      let score = 0;
      for (const word of keywords) {
        if (haystack.includes(word)) {
          score += 1;
        }
      }
      return { ...entry, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems);

  return scored;
}

function formatReply(markdown) {
  if (!markdown) {
    return "";
  }

  let text = markdown.replace(/\r\n/g, "\n");

  // Normalize excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n");

  // Replace bullet markers with a consistent format
  text = text.replace(/\n\s*\*\s+/g, "\n• ");
  text = text.replace(/^\s*\*\s+/gm, "• ");
  text = text.replace(/^\s*-\s+/gm, "• ");

  // Remove bold/italic markdown markers
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");

  return text.trim();
}

function logConversation(entry) {
  try {
    const record = {
      timestamp: new Date().toISOString(),
      sessionId: entry.sessionId,
      userEmail: entry.userEmail || null,
      userMessage: entry.userMessage,
      reply: entry.reply,
      contextEntries: entry.contextEntries?.map((ctx) => ({
        id: ctx.id,
        title: ctx.title,
        tags: ctx.tags,
      })) ?? [],
    };
    appendFileSync(LOG_FILE, JSON.stringify(record) + "\n", "utf-8");
  } catch (err) {
    console.error("Nepavyko įrašyti pokalbio žurnalo:", err);
  }
}

app.post("/api/chat", async (req, res) => {
  try {
    const { message: userMessage, sessionId, userEmail } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const contextEntries = getDynamicContext(userMessage);
    const contextText =
      contextEntries.length > 0
        ? contextEntries
            .map(
              (entry) =>
                `## ${entry.title}\nŽymos: ${(entry.tags ?? []).join(", ")}\n${entry.content}`
            )
            .join("\n\n")
        : "Papildomas kontekstas nerastas. Remkis bazine informacija apie Vecticum sistemą.";

    const prompt = `Tu esi oficialus VECTICUM dokumentų ir personalo procesų valdymo sistemos skaitmeninis asistentas. Tavo tikslas – padėti svetainės lankytojams ir esamiems klientams suprasti, kaip VECTICUM sprendimai gali padėti jų organizacijai, aiškiai ir žmogiškai atsakyti į klausimus apie funkcionalumą, naudojimo atvejus ir realią naudą verslui bei, kai tai prasminga, nukreipti į konkrečius VECTICUM sprendimų puslapius svetainėje, o ne į bendrą pradžios puslapį. Visada atsakinėk lietuvių kalba, profesionaliai, ramiai ir partneriškai, atstovaudamas tik VECTICUM (nesi bendrinis AI ar paieškos sistema). Atsakymus teik trumpus, tikslius ir orientuotus į vertę, niekada nespėliok ir nenaudok formuluočių kaip „greičiausiai“, „turėtų būti“ ar „paieškokite Google“; jei informacija nėra 100 % patvirtinta arba klausimas per abstraktus, tai aiškiai pasakyk ir pasiūlyk peržiūrėti atitinkamą sprendimo puslapį arba susisiekti su VECTICUM komanda. Jei klausiama apie susisiekimą, pateik tik tikslius ir aktualius kontaktus (telefoną, el. paštą, adresą), o jei jų nežinai – jų nenurodyk. Venk perteklinio marketinginio tono, tuščių sąrašų ir nepatvirtintų pažadų (kainodaros, individualių diegimų ar nestandartinių integracijų), o visą komunikaciją formuluok taip, lyg kalbėtum su realiu klientu – geriau trumpas, sąžiningas ir aiškus atsakymas nei ilgas ir neapibrėžtas tekstas.

Papildomas kontekstas:
${contextText}

Kliento klausimas: ${userMessage}

Tavo atsakymas:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: data.error?.message || "API klaida" });
    }

    const rawReply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const reply = formatReply(rawReply);
    logConversation({ 
      sessionId: sessionId || "unknown", 
      userEmail: userEmail || null,
      userMessage, 
      reply, 
      contextEntries 
    });
    res.json({ reply });
  } catch (err) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "Atsiprašome, įvyko klaida. Bandykite dar kartą." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api/conversations", (req, res) => {
  try {
    if (!existsSync(LOG_FILE)) {
      return res.json([]);
    }

    const raw = readFileSync(LOG_FILE, "utf-8");
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const recent = lines
      .slice(-50)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean)
      .reverse();

    res.json(recent);
  } catch (err) {
    console.error("Nepavyko perskaityti pokalbių žurnalo:", err);
    res.status(500).json({ error: "Nepavyko gauti pokalbių istorijos." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveris klausosi ant http://localhost:${PORT}`);
});
