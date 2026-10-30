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

function fail(status, error) {
  console.error("omnisend:", status, error);
  return reply(status, { error });
}

export function GET() {
  return reply(200, {
    status: "Omnisend endpoint veikia",
    version: "all-matching-contacts-v2",
  });
}

export async function POST({ request }) {
  const subdomain = process.env.KOMMO_SUBDOMAIN?.trim();
  const token = process.env.KOMMO_ACCESS_TOKEN?.trim();
  const secret = process.env.OMNISEND_WEBHOOK_SECRET;

  if (
    !subdomain ||
    !/^[a-z0-9-]+$/.test(subdomain) ||
    !token ||
    !secret ||
    secret.length < 32
  ) {
    return fail(500, "Patikrink Vercel kintamuosius");
  }

  const receivedSecret =
    request.headers.get("x-webhook-secret") || "";

  const hash = (value) =>
    createHash("sha256").update(value).digest();

  if (!timingSafeEqual(hash(secret), hash(receivedSecret))) {
    return fail(401, "Neteisingas webhook slaptas raktas");
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return fail(400, "Netaisyklingas JSON");
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
    return fail(
      400,
      "Netinkamas el. pastas arba laisko pavadinimas"
    );
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

    return response.status === 204
      ? {}
      : response.json();
  }

  try {
    const matches = new Map();

    for (let page = 1; page <= 10; page++) {
      const data = await kommo(
        `/contacts?query=${encodeURIComponent(email)}` +
          `&limit=250&page=${page}`
      );

      for (const contact of data._embedded?.contacts || []) {
        const exactMatch = (
          contact.custom_fields_values || []
        ).some(
          (field) =>
            field.field_code === "EMAIL" &&
            (field.values || []).some(
              (item) =>
                typeof item.value === "string" &&
                item.value.trim().toLowerCase() === email
            )
        );

        if (exactMatch) {
          matches.set(contact.id, contact);
        }
      }

      if (!data._links?.next) {
        break;
      }

      if (page === 10) {
        return fail(422, "Per daug paieskos rezultatu");
      }
    }

    if (matches.size === 0) {
      console.info("omnisend: contact_not_found");

      return reply(200, {
        status: "Kontaktas nerastas; pastaba nekurta",
      });
    }

    const contactIds = [...matches.keys()].map(Number);

    if (
      contactIds.some(
        (id) => !Number.isSafeInteger(id) || id <= 0
      )
    ) {
      return fail(502, "Netinkamas Kommo kontakto ID");
    }

    const receivedAt = new Intl.DateTimeFormat("lt-LT", {
      timeZone: "Europe/Vilnius",
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date());

    const noteText =
      `Omnisend – išsiųstas laiškas\n` +
      `Pavadinimas: ${title}\n` +
      `Gavėjas: ${email}\n` +
      `Įvykis gautas: ${receivedAt} (Europe/Vilnius)`;

    stage = "add_notes";

    // Pastabas siunčiame grupėmis po daugiausia 50 kontaktų.
    for (let start = 0; start < contactIds.length; start += 50) {
      const batch = contactIds.slice(start, start + 50);

      await kommo("/contacts/notes", {
        method: "POST",
        body: JSON.stringify(
          batch.map((contactId) => ({
            entity_id: contactId,
            note_type: "common",
            params: {
              text: noteText,
            },
          }))
        ),
      });

      console.info(
        "omnisend: notes_created",
        JSON.stringify({ contact_ids: batch })
      );
    }

    return reply(200, {
      status: "Pastabos sukurtos",
      contacts_count: contactIds.length,
    });
  } catch (error) {
    const detail = /^Kommo HTTP \d{3}$/.test(
      error?.message || ""
    )
      ? error.message
      : "Rysio arba atsakymo klaida";

    console.error("omnisend:", stage, detail);

    return reply(502, {
      error: detail,
      stage,
    });
  }
}
