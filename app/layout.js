import './globals.css'

export const metadata = {
  title: 'Nexus AI - Asistente de IA Profesional',
  description: 'Nexus AI es tu asistente de IA profesional. Genera imagenes, escribe codigo, busca productos, crea modelos 3D y mas. Potente, rapido y personalizable.',
  keywords: ['IA', 'asistente', 'inteligencia artificial', 'chat', 'imagenes', 'codigo', '3D', 'Nexus AI', 'asistente virtual', 'chatbot', 'generador de imagenes', 'generador de codigo'],
  authors: [{ name: 'ZT', url: 'https://github.com/Lobocielo' }],
  creator: 'ZT',
  publisher: 'Nexus AI',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://ia-web-zeta.vercel.app',
    siteName: 'Nexus AI',
    title: 'Nexus AI - Asistente de IA Profesional',
    description: 'Genera imagenes, escribe codigo, busca productos, crea modelos 3D y mas con Nexus AI.',
    images: [
      {
        url: 'https://ia-web-zeta.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nexus AI - Asistente de IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nexus AI - Asistente de IA Profesional',
    description: 'Genera imagenes, escribe codigo, busca productos, crea modelos 3D y mas.',
    images: ['https://ia-web-zeta.vercel.app/og-image.png'],
    creator: '@nexusai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Nexus AI',
  },
  themeColor: '#0a0a0a',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%2300d4ff"/><stop offset="50%25" stop-color="%236366f1"/><stop offset="100%25" stop-color="%23a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="url(%23g)"/><path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="12" cy="13" r="2" fill="white"/><circle cx="20" cy="13" r="2" fill="white"/></svg>',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="canonical" href="https://ia-web-zeta.vercel.app" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}