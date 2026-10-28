import { createHash, timingSafeEqual } from "node:crypto";

export const prerender = false;

function reply(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export function GET() {
  return reply(200, { status: "Omnisend endpoint veikia" });
}

export async function POST({ request }) {
  const subdomain = process.env.KOMMO_SUBDOMAIN?.trim();
  const token = process.env.KOMMO_ACCESS_TOKEN?.trim();
  const secret = process.env.OMNISEND_WEBHOOK_SECRET;
  const testEmail = process.env.OMNISEND_TEST_EMAIL
    ?.trim()
    .toLowerCase();

  if (
    !subdomain ||
    !/^[a-z0-9-]+$/.test(subdomain) ||
    !token ||
    !secret ||
    secret.length < 32
  ) {
    return reply(500, { error: "Patikrink Vercel kintamuosius" });
  }

  const receivedSecret = request.headers.get("x-webhook-secret") || "";
  const hash = (value) =>
    createHash("sha256").update(value).digest();

  if (!timingSafeEqual(hash(secret), hash(receivedSecret))) {
    return reply(401, { error: "Neteisingas webhook slaptas raktas" });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return reply(400, { error: "Netaisyklingas JSON" });
  }

  const email =
    typeof body?.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  const title =
    typeof body?.message_title === "string"
      ? body.message_title.trim()
      : "";

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !title ||
    title.length > 4000 ||
    title.includes("[[")
  ) {
    return reply(400, { error: "Netinkamas el. pastas arba pavadinimas" });
  }

  if (testEmail && email !== testEmail) {
    return reply(200, { status: "Praleista: ne bandomasis kontaktas" });
  }

  const base = `https://${subdomain}.kommo.com/api/v4`;
  let stage = "contact_search";

  async function kommo(path, options = {}) {
    const response = await fetch(`${base}${path}`, {
      ...options,
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Kommo HTTP ${response.status}`);
    }

    return response.status === 204 ? {} : response.json();
  }

  try {
    const matches = new Map();

    for (let page = 1; page <= 10; page++) {
      const data = await kommo(
        `/contacts?query=${encodeURIComponent(email)}&limit=250&page=${page}`
      );

      for (const contact of data._embedded?.contacts || []) {
        const exactMatch = (contact.custom_fields_values || []).some(
          (field) =>
            field.field_code === "EMAIL" &&
            (field.values || []).some(
              (item) =>
                typeof item.value === "string" &&
                item.value.trim().toLowerCase() === email
            )
        );

        if (exactMatch) matches.set(contact.id, contact);
      }

      if (!data._links?.next) break;

      if (page === 10) {
        return reply(422, { error: "Per daug paieskos rezultatu" });
      }
    }

    if (matches.size === 0) {
      console.info("omnisend: contact_not_found");
      return reply(200, { status: "Kontaktas nerastas; pastaba nekurta" });
    }

    if (matches.size > 1) {
      return reply(409, {
        error: "Keli kontaktai su tuo paciu el. pastu; pastaba nekurta",
      });
    }

    const contactId = Number([...matches.keys()][0]);

    if (!Number.isSafeInteger(contactId) || contactId <= 0) {
      return reply(502, { error: "Netinkamas Kommo kontakto ID" });
    }

    const receivedAt = new Intl.DateTimeFormat("lt-LT", {
      timeZone: "Europe/Vilnius",
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date());

    stage = "add_note";

    await kommo("/contacts/notes", {
      method: "POST",
      body: JSON.stringify([
        {
          entity_id: contactId,
          note_type: "common",
          params: {
            text:
              `Omnisend – išsiųstas laiškas\n` +
              `Pavadinimas: ${title}\n` +
              `Gavėjas: ${email}\n` +
              `Įvykis gautas: ${receivedAt} (Europe/Vilnius)`,
          },
        },
      ]),
    });

    console.info("omnisend: note_created");
    return reply(200, { status: "Pastaba sukurta" });
  } catch (error) {
    const detail = /^Kommo HTTP \d{3}$/.test(error.message || "")
      ? error.message
      : "Rysio arba atsakymo klaida";

    console.error("omnisend:", stage, detail);
    return reply(502, { error: detail, stage });
  }
}
