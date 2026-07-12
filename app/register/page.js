'use client'

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
            <defs>
              <linearGradient id="authGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff"/>
                <stop offset="50%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a855f7"/>
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="15" fill="url(#authGrad)"/>
            <path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="12" cy="13" r="2" fill="white"/>
            <circle cx="20" cy="13" r="2" fill="white"/>
          </svg>
          <span>Nexus AI</span>
        </div>
        <h1>Solicitar Cuenta</h1>
        <p style={{color:'var(--text-secondary)', fontSize:'14px', textAlign:'center', lineHeight:'1.6', marginBottom:'16px'}}>
          Para obtener una cuenta, unite a nuestro servidor de Discord y pedila alli.
        </p>
        <a href="https://discord.gg/KmpPP4SGxm" className="discord-btn" target="_blank" rel="noopener noreferrer">
          Unirte al Discord
        </a>
        <p className="auth-link" style={{marginTop:'20px'}}><a href="/login">Ya tenes cuenta? Inicia sesion</a></p>
      </div>
    </div>
  )
}
