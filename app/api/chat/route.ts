import { streamText, type ModelMessage } from "ai"
import type { NextRequest } from "next/server"

export const maxDuration = 30

const SYSTEM_PROMPT = `Jesteś przyjaznym asystentem AI nieoficjalnego serwisu mieszkańców gminy Jejkowice.
Ton: ciepły, pomocny, konkretny. Odpowiadasz po polsku, krótko i rzeczowo.

Twoja rola:
- Pomagasz mieszkańcom znaleźć informacje w serwisie i odpowiadasz na pytania o życie w gminie.
- Udzielasz podstawowych informacji, a gdy trzeba, kierujesz do odpowiedniej podstrony serwisu.

O czym możesz rozmawiać (najważniejsze sekcje serwisu):
- Aktualności — bieżące informacje z gminy.
- Wydarzenia — kalendarz lokalnych wydarzeń.
- Wywóz śmieci — harmonogram odbioru odpadów, wyszukiwarka po adresie.
- Zgłoś sprawę — formularz zgłaszania usterek i spraw do gminy.
- Ankiety — konsultacje i głosowania mieszkańców.
- Galeria — zdjęcia mieszkańców i okolicy.
- Poznaj Jejkowice — informacje o miejscowości.

Styl odpowiedzi:
- 1-3 zdania, konkretnie i uprzejmie.
- Możesz używać pogrubień (**tekst**) dla najważniejszych fraz.
- Jeśli pytanie dotyczy konkretnej sekcji, podpowiedz, gdzie w serwisie ją znaleźć.
- Jeśli nie znasz szczegółowej odpowiedzi, powiedz to szczerze i zaproponuj kontakt z urzędem gminy.

Nie wymyślaj dokładnych dat, godzin ani danych kontaktowych, których nie jesteś pewien.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const modelMessages: ModelMessage[] = (Array.isArray(messages) ? messages : [])
      .filter((m: { role?: string; content?: string }) => m?.role === "user" || m?.role === "assistant")
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: String(m.content ?? ""),
      }))

    const result = streamText({
      model: "openai/gpt-4o-mini",
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      temperature: 0.5,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.log("[v0] Chat API error:", error instanceof Error ? error.message : error)
    return new Response(
      JSON.stringify({ error: "TECHNICAL_BREAK", details: "Przerwa techniczna" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
