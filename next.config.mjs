/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
    // Optymalizacja włączona (mniejszy transfer), ale mocno ograniczamy
    // liczbę generowanych wariantów i wydłużamy cache, aby zredukować
    // liczbę requestów do /_next/image (były to setki w Observability).
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [128, 256, 384],
    // Zoptymalizowane obrazy cache'owane przez rok — kolejne wejścia
    // i nawigacja nie generują ponownych transformacji/requestów.
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        // Zasoby serwowane wprost z /public (svg, og-image dla crawlerów).
        // Rok cache => brak ponownych pobrań przy każdym wejściu.
        source: '/:file(og-image.jpg|og-image-v2.jpg|favicon.svg|icon.svg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Bezpieczne nagłówki bazowe (bez wpływu na wygląd i działanie).
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
