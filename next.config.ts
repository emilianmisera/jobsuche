import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Client Router Cache: dynamische Segmente 30 Sekunden im Browser halten,
    // damit ein zweiter Klick auf dieselbe Bewerbung ohne Serverabfrage öffnet.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}

export default nextConfig