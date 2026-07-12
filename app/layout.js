import './globals.css'

export const metadata = {
  title: 'iA Chat',
  description: 'Tu asistente de IA personal',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'iA Chat'
  },
  themeColor: '#0a0a0a',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%236366f1"/><stop offset="100%25" stop-color="%23a855f7"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="url(%23g)"/><circle cx="12" cy="13" r="2" fill="white"/><circle cx="20" cy="13" r="2" fill="white"/><path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  )
}
