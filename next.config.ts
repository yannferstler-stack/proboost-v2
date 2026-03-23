import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Empêche le clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Empêche le MIME-sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Force HTTPS (1 an)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Contrôle les informations de référence
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Désactive les fonctionnalités navigateur inutilisées
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

export default nextConfig;
