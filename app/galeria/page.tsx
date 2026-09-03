import type { Metadata } from "next"
import { UnderConstruction } from "@/components/shared/under-construction"

export const metadata: Metadata = {
  title: "Galeria mieszkańców | Jejkowice — nasza gmina!",
  description: "Galeria mieszkańców Jejkowic — strona w budowie.",
}

export default function GaleriaPage() {
  return (
    <UnderConstruction
      eyebrow="Galeria mieszkańców"
      title="Strona w budowie"
      description="Galeria mieszkańców jest w trakcie przygotowania. Wkrótce zobaczysz tu najpiękniejsze kadry z naszej gminy."
    />
  )
}
