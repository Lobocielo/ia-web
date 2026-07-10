import './globals.css'

export const metadata = {
  title: 'iA Chat',
  description: 'Chat inteligente con IA',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
