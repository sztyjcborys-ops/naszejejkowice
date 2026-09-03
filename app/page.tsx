import { Hero } from "@/components/home/hero"
import { QuickAccess } from "@/components/home/quick-access"
import { Highlights } from "@/components/home/highlights"
import { WasteAndIdeas } from "@/components/home/waste-and-ideas"
import { SurveyResults } from "@/components/shared/survey-results"
import { SectionTitle } from "@/components/shared/section-title"
import { getFeaturedPoll } from "@/lib/polls"

// Publiczna strona główna — cache z rewalidacją w tle (wyróżniona ankieta to
// dane publiczne). Edycje w panelu odświeżają ją natychmiast przez
// revalidatePath('/').
export const revalidate = 300

export default async function HomePage() {
  const featured = await getFeaturedPoll()
  const surveyTitle = featured?.title ?? "Co powinno powstać w Jejkowicach?"
  const surveyDescription = featured
    ? featured.daysLeft != null
      ? `Zagłosuj i zdecyduj, na co warto przeznaczyć środki gminy. Koniec za ${featured.daysLeft} dni.`
      : "Zagłosuj i zdecyduj, na co warto przeznaczyć środki gminy."
    : "Zagłosuj i zdecyduj, na co warto przeznaczyć środki gminy. Koniec za 5 dni."

  return (
    <div className="flex flex-col gap-14 pb-16 md:gap-20 md:pb-24">
      <Hero />

      <div id="centrum" className="-mt-8 mx-auto w-full max-w-6xl scroll-mt-24 px-4 md:mt-0 md:px-6">
        <SectionTitle
          eyebrow="Centrum mieszkańca"
          title="Wszystko, co ważne — w jednym miejscu"
          description="Sprawy urzędowe, wywóz odpadów, wydarzenia i głos w sprawach gminy."
        />
        <QuickAccess />
      </div>

      <Highlights />

      <WasteAndIdeas />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionTitle
          eyebrow="Ankieta mieszkańców"
          title={surveyTitle}
          description={surveyDescription}
        />
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <SurveyResults results={featured?.results} total={featured?.total ?? 342} />
        </div>
      </div>
    </div>
  )
}
