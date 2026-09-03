import type { Metadata } from 'next'
import { countByStatus } from '@/lib/reports'
import { getReports, getSignedReportImages } from '@/lib/reports-server'
import { ReportsManager } from '@/components/admin/reports-manager'

export const metadata: Metadata = {
  title: 'Zgłoszenia — panel | Jejkowice',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const reports = await getReports()

  // Podpisane adresy URL wszystkich zdjęć (jedno zapytanie do Storage).
  const allPaths = reports.flatMap((r) => r.image_paths)
  const signedImages = await getSignedReportImages(allPaths)

  const counts = countByStatus(reports)
  const openCount = counts['Zgłoszone'] + counts['W trakcie']

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Zgłoszenia</h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {reports.length === 0
            ? 'Zgłoszenia mieszkańców pojawią się tutaj.'
            : `${reports.length} ${reports.length === 1 ? 'zgłoszenie' : 'zgłoszeń'} · ${openCount} w toku`}
        </p>
      </header>

      <ReportsManager reports={reports} signedImages={signedImages} />
    </div>
  )
}
