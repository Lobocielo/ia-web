'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const MODELS = [
  // === CHAT GRATIS (Groq) ===
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Potente y rapido', vision: false, cat: 'Gratis', type: 'llm' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', desc: 'Ultra rapido', vision: false, cat: 'Gratis', type: 'llm' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', desc: 'Vision + chat', vision: true, cat: 'Gratis', type: 'llm' },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', desc: 'Google - compacto', vision: false, cat: 'Gratis', type: 'llm' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', desc: 'Mixture of Experts', vision: false, cat: 'Gratis', type: 'llm' },
  { id: 'llama-3.1-8b-instant', name: 'Llama Guard', desc: 'Moderacion de contenido', vision: false, cat: 'Gratis', type: 'llm' },

  // === CHAT PREMIUM ===
  { id: 'nousresearch/hermes-4-70b', name: 'Hermes 4 70B', desc: 'Roleplay libre', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'nousresearch/hermes-3-llama-3.1-405b', name: 'Hermes 3 405B', desc: 'El mas grande', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition', name: 'Dolphin Venice', desc: '100% libre', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: 'Rapido y potente', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'mistralai/mistral-large-2512', name: 'Mistral Large 3', desc: 'Mistral oficial', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', desc: 'Google IA', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'qwen/qwen3-32b', name: 'Qwen 3 32B', desc: 'Multilingue', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', desc: 'Razonamiento elite', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', desc: 'OpenAI rapido', vision: false, cat: 'Premium', type: 'llm', premium: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o', desc: 'OpenAI potente', vision: true, cat: 'Premium', type: 'llm', premium: true },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Google rapido', vision: true, cat: 'Premium', type: 'llm', premium: true },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Google elite', vision: true, cat: 'Premium', type: 'llm', premium: true },
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', desc: 'Meta masivo', vision: true, cat: 'Premium', type: 'llm', premium: true },
  { id: 'cohere/command-a', name: 'Command A', desc: 'Cohere empresarial', vision: false, cat: 'Premium', type: 'llm', premium: true },

  // === CODIGO ===
  { id: 'deepseek/deepseek-coder-v2', name: 'DeepSeek Coder', desc: 'Especialista en codigo', vision: false, cat: 'Codigo', type: 'llm', premium: true },
  { id: 'qwen/qwen-2.5-coder-32b-instruct', name: 'Qwen Coder 32B', desc: 'Multi-lenguaje', vision: false, cat: 'Codigo', type: 'llm', premium: true },

  // === AGENTES (Groq - gratis) ===
  { id: 'groq/compound', name: 'Compound', desc: 'Busca + ejecuta', vision: false, cat: 'Agentes', type: 'agent' },
  { id: 'groq/compound-mini', name: 'Compound Mini', desc: 'Agente rapido', vision: false, cat: 'Agentes', type: 'agent' },

  // === SEGURIDAD ===
  { id: 'openai/gpt-oss-safeguard-20b', name: 'GPT Safeguard 20B', desc: 'Filtra contenido', vision: false, cat: 'Seguridad', type: 'safety' },
  { id: 'meta-llama/llama-prompt-guard-2-22m', name: 'Prompt Guard 22M', desc: 'Anti injection', vision: false, cat: 'Seguridad', type: 'safety' },
  { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'Prompt Guard 86M', desc: 'Anti injection Pro', vision: false, cat: 'Seguridad', type: 'safety' },

  // === AUDIO ===
  { id: 'whisper-large-v3', name: 'Whisper V3', desc: 'Audio a texto', vision: false, cat: 'Audio', type: 'stt' },
  { id: 'whisper-large-v3-turbo', name: 'Whisper Turbo', desc: 'Transcripcion rapida', vision: false, cat: 'Audio', type: 'stt' },
  { id: 'canopylabs/orpheus-v1-english', name: 'Orpheus EN', desc: 'Voz en ingles', vision: false, cat: 'Audio', type: 'tts' },
  { id: 'canopylabs/orpheus-arabic-saudi', name: 'Orpheus AR', desc: 'Voz en arabe', vision: false, cat: 'Audio', type: 'tts' },
]

function SearchCard({ query, url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="search-card">
      <div className="search-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <div className="search-card-info">
        <div className="search-card-title">MercadoLibre</div>
        <div className="search-card-query">{query}</div>
      </div>
      <div className="search-card-arrow">→</div>
    </a>
  )
}

function GeneratedImage({ prompt, url }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const downloadImage = () => {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.download = `nexus-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="gen-image-container">
      {!loaded && !error && <div className="gen-image-loading">Generando imagen...</div>}
      {error && <div className="gen-image-loading" style={{color:'var(--error)'}}>Error al generar. Intenta de nuevo.</div>}
      <img
        src={url}
        alt={prompt}
        className="gen-image"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{display: error ? 'none' : 'block'}}
      />
      {loaded && (
        <div className="gen-image-actions">
          <button onClick={downloadImage} className="gen-image-download">Descargar</button>
        </div>
      )}
      <div className="gen-image-prompt">{prompt}</div>
    </div>
  )
}

function RenderContent({ text }) {
  const [copiedIdx, setCopiedIdx] = useState(null)

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const downloadCode = (code, lang) => {
    const ext = {
      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
      cpp: 'cpp', c: 'c', html: 'html', css: 'css', php: 'php',
      ruby: 'rb', go: 'go', rust: 'rs', swift: 'swift', sql: 'sql',
      bash: 'sh', shell: 'sh', powershell: 'ps1', lua: 'lua',
      json: 'json', yaml: 'yml', xml: 'xml', markdown: 'md',
      javascript: 'js', jsx: 'jsx', tsx: 'tsx', dart: 'dart'
    }[lang] || 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nexus-code-${Date.now()}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!text || typeof text !== 'string') return <>{text}</>

  const parts = text.split(/(```[\s\S]*?```)/g)

  return (
    <>
      {parts.map((part, i) => {
        const codeMatch = part.match(/^```(\w*)\n?([\s\S]*?)```$/)
        if (codeMatch) {
          const lang = codeMatch[1] || 'code'
          const code = codeMatch[2].trim()
          return (
            <div key={i} className="code-block">
              <div className="code-header">
                <span className="code-lang">{lang}</span>
                <div className="code-actions">
                  <button className="code-btn" onClick={() => copyCode(code, i)}>
                    {copiedIdx === i ? '✓ Copiado' : 'Copiar'}
                  </button>
                  <button className="code-btn download-btn" onClick={() => downloadCode(code, lang)}>
                    Descargar .{{
                      javascript: 'js', typescript: 'ts', python: 'py', java: 'java',
                      cpp: 'cpp', c: 'c', html: 'html', css: 'css', lua: 'lua',
                      json: 'json', sql: 'sql', bash: 'sh', shell: 'sh'
                    }[lang] || 'txt'}
                  </button>
                </div>
              </div>
              <pre><code>{code}</code></pre>
            </div>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

function Model3DViewer({ modelData, prompt }) {
  const canvasRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !modelData?.shapes) return
    let mounted = true

    const init = async () => {
      const THREE = await import('three')
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')

      if (!mounted) return
      const canvas = canvasRef.current
      const scene = new THREE.Scene()

      const bgCanvas = document.createElement('canvas')
      bgCanvas.width = 512
      bgCanvas.height = 512
      const bgCtx = bgCanvas.getContext('2d')
      const grad = bgCtx.createRadialGradient(256, 256, 0, 256, 256, 360)
      grad.addColorStop(0, '#1a1a2e')
      grad.addColorStop(1, '#0a0a12')
      bgCtx.fillStyle = grad
      bgCtx.fillRect(0, 0, 512, 512)
      const bgTex = new THREE.CanvasTexture(bgCanvas)
      scene.background = bgTex

      const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
      camera.position.set(3.5, 2.5, 3.5)

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setSize(canvas.clientWidth, canvas.clientHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2

      const controls = new OrbitControls(camera, canvas)
      controls.enableDamping = true
      controls.autoRotate = true
      controls.autoRotateSpeed = 3
      controls.minDistance = 1.5
      controls.maxDistance = 10
      controls.target.set(0, 0.5, 0)

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
      scene.add(ambientLight)
      const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5)
      dirLight1.position.set(5, 8, 5)
      scene.add(dirLight1)
      const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.6)
      dirLight2.position.set(-5, 3, -5)
      scene.add(dirLight2)
      const pointLight = new THREE.PointLight(0xa855f7, 0.8, 15)
      pointLight.position.set(0, 4, 0)
      scene.add(pointLight)
      const rimLight = new THREE.DirectionalLight(0x00d4ff, 0.4)
      rimLight.position.set(0, -2, 5)
      scene.add(rimLight)

      const grid = new THREE.GridHelper(10, 20, 0x333355, 0x222244)
      grid.position.y = -0.5
      scene.add(grid)

      const group = new THREE.Group()

      modelData.shapes.forEach((s) => {
        let geo
        const size = s.size || [1, 1, 1]
        const segs = 48
        switch (s.type) {
          case 'sphere': geo = new THREE.SphereGeometry(size[0] * 0.5, segs, segs); break
          case 'cylinder': geo = new THREE.CylinderGeometry(size[0] * 0.5, size[1] * 0.5, size[2] * 0.5, segs); break
          case 'cone': geo = new THREE.ConeGeometry(size[0] * 0.5, size[1] * 0.5, segs); break
          case 'torus': geo = new THREE.TorusGeometry(size[0] * 0.5, size[1] * 0.18, 24, segs); break
          case 'torusKnot': geo = new THREE.TorusKnotGeometry(size[0] * 0.3, size[1] * 0.1, 128, 24); break
          default: geo = new THREE.BoxGeometry(size[0], size[1], size[2])
        }

        let mat
        const color = new THREE.Color(s.color || '#6366f1')
        switch (s.material) {
          case 'metallic':
            mat = new THREE.MeshStandardMaterial({ color, metalness: 0.95, roughness: 0.05, envMapIntensity: 1.5 })
            break
          case 'glass':
            mat = new THREE.MeshPhysicalMaterial({ color, metalness: 0.0, roughness: 0.05, transmission: 0.9, thickness: 0.5, transparent: true, opacity: 0.9 })
            break
          default:
            mat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.35 })
        }

        const mesh = new THREE.Mesh(geo, mat)
        if (s.position) mesh.position.set(s.position[0], s.position[1], s.position[2])
        if (s.rotation) mesh.rotation.set(s.rotation[0], s.rotation[1], s.rotation[2])
        group.add(mesh)
      })

      scene.add(group)

      const animate = () => {
        if (!mounted) return
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        mounted = false
        renderer.dispose()
        controls.dispose()
      }
    }

    init()
  }, [modelData])

  const downloadGLB = async () => {
    setDownloading(true)
    try {
      const THREE = await import('three')
      const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js')
      const scene = new THREE.Scene()
      const group = new THREE.Group()

      modelData.shapes.forEach((s) => {
        let geo
        const size = s.size || [1, 1, 1]
        switch (s.type) {
          case 'sphere': geo = new THREE.SphereGeometry(size[0] * 0.5, 32, 32); break
          case 'cylinder': geo = new THREE.CylinderGeometry(size[0] * 0.5, size[1] * 0.5, size[2] * 0.5, 32); break
          case 'cone': geo = new THREE.ConeGeometry(size[0] * 0.5, size[1] * 0.5, 32); break
          case 'torus': geo = new THREE.TorusGeometry(size[0] * 0.5, size[1] * 0.15, 16, 32); break
          case 'torusKnot': geo = new THREE.TorusKnotGeometry(size[0] * 0.3, size[1] * 0.08, 64, 8); break
          default: geo = new THREE.BoxGeometry(size[0], size[1], size[2])
        }
        const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(s.color || '#6366f1') })
        const mesh = new THREE.Mesh(geo, mat)
        if (s.position) mesh.position.set(s.position[0], s.position[1], s.position[2])
        if (s.rotation) mesh.rotation.set(s.rotation[0], s.rotation[1], s.rotation[2])
        group.add(mesh)
      })

      scene.add(group)
      const exporter = new GLTFExporter()
      exporter.parse(scene, (result) => {
        const blob = new Blob([result], { type: 'model/gltf-binary' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `nexus-3d-${Date.now()}.glb`
        a.click()
        URL.revokeObjectURL(url)
        setDownloading(false)
      }, { binary: true })
    } catch { setDownloading(false) }
  }

  return (
    <div className="model3d-container">
      <canvas ref={canvasRef} className="model3d-canvas" />
      <div className="model3d-info">
        <span className="model3d-name">{modelData?.name || prompt}</span>
        <span className="model3d-shapes">{modelData?.shapes?.length || 0} formas</span>
      </div>
      <div className="model3d-actions">
        <button onClick={downloadGLB} className="gen-image-download" disabled={downloading}>
          {downloading ? 'Exportando...' : 'Descargar .GLB'}
        </button>
      </div>
      <div className="model3d-prompt">{prompt}</div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [model, setModel] = useState(MODELS[0].id)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [imgModel, setImgModel] = useState('flux-realism')
  const [user, setUser] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const refInputRef = useRef(null)
  const fileInputRef = useRef(null)
  const [attachedFiles, setAttachedFiles] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const currentModel = MODELS.find(m => m.id === model)
  const supportsVision = currentModel?.vision

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages, loading])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 800
          let w = img.width, h = img.height
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round((h * MAX) / w); w = MAX }
            else { w = Math.round((w * MAX) / h); h = MAX }
          }
          canvas.width = w; canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setError('Maximo 20MB'); return }
    const compressed = await compressImage(file)
    setImage(compressed)
    setImagePreview(compressed)
    e.target.value = ''
  }

  const removeImage = () => { setImage(null); setImagePreview(null); setRefImage(null); setRefImagePreview(null) }

  const [refImage, setRefImage] = useState(null)
  const [refImagePreview, setRefImagePreview] = useState(null)

  const handleRefImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setError('Maximo 20MB'); return }
    const compressed = await compressImage(file)
    setRefImage(compressed)
    setRefImagePreview(compressed)
    e.target.value = ''
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const maxSize = 10 * 1024 * 1024
    const newFiles = []
    for (const file of files) {
      if (file.size > maxSize) { setError(`${file.name} supera 10MB`); continue }
      try {
        const text = await file.text()
        const ext = file.name.split('.').pop().toLowerCase()
        const isImage = ['png','jpg','jpeg','gif','webp','bmp','svg'].includes(ext)
        if (isImage) {
          const compressed = await compressImage(file)
          newFiles.push({ name: file.name, type: 'image', content: compressed, size: file.size })
        } else {
          newFiles.push({ name: file.name, type: 'text', content: text.slice(0, 50000), size: file.size, ext })
        }
      } catch {
        newFiles.push({ name: file.name, type: 'unknown', content: null, size: file.size })
      }
    }
    setAttachedFiles(prev => [...prev, ...newFiles])
    e.target.value = ''
  }

  const removeFile = (idx) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const generateImage = (prompt) => {
    const seed = Math.floor(Math.random() * 999999)
    const enhancedPrompt = `high quality, detailed, sharp, 4k, professional photography, masterpiece: ${prompt}`
    const encoded = encodeURIComponent(enhancedPrompt)
    return `https://image.pollinations.ai/prompt/${encoded}?width=1536&height=1024&nologo=true&seed=${seed}&model=${imgModel}`
  }

  const generateFallback3D = (prompt) => {
    const words = prompt.toLowerCase().split(/\s+/)
    const palettes = [
      ['#ff6b6b','#ee5a24','#f9ca24','#ff9ff3'],
      ['#6c5ce7','#a29bfe','#fd79a8','#e84393'],
      ['#00b894','#00cec9','#0984e3','#6c5ce7'],
      ['#fdcb6e','#e17055','#d63031','#e84393'],
      ['#55efc4','#81ecec','#74b9ff','#a29bfe'],
      ['#ff7675','#d63031','#fdcb6e','#ffeaa7'],
      ['#2d3436','#636e72','#b2bec3','#dfe6e9']
    ]
    const palette = palettes[Math.floor(Math.random() * palettes.length)]
    const pick = () => palette[Math.floor(Math.random() * palette.length)]
    const metal = () => ['metallic','metallic','standard','standard','glass'][Math.floor(Math.random() * 5)]

    const name = words.slice(0, 3).join(' ') || 'modelo'
    const shapes = []

    const isAnimal = words.some(w => ['gato','perro','pajaro','pez','conejo','lobo','oso','leon'].includes(w))
    const isBuilding = words.some(w => ['castle','castillo','casa','edificio','tower','torre','fortress'].includes(w))
    const isVehicle = words.some(w => ['car','auto','coche','moto','avion','ship','nave','vehiculo'].includes(w))
    const isRobot = words.some(w => ['robot','cyborg','mech','droid','maquina'].includes(w))

    if (isAnimal) {
      const body = pick()
      const accent = pick()
      shapes.push({ type: 'sphere', color: body, size: [1.0, 0.8, 0.8], position: [0, 0.4, 0], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'sphere', color: body, size: [0.65, 0.6, 0.6], position: [0, 1.05, 0], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'cone', color: accent, size: [0.22, 0.35, 0.22], position: [-0.28, 1.45, 0], rotation: [0, 0, 0.35], material: 'metallic' })
      shapes.push({ type: 'cone', color: accent, size: [0.22, 0.35, 0.22], position: [0.28, 1.45, 0], rotation: [0, 0, -0.35], material: 'metallic' })
      shapes.push({ type: 'sphere', color: '#ffffff', size: [0.16, 0.16, 0.16], position: [-0.17, 1.12, 0.27], rotation: [0, 0, 0], material: 'glass' })
      shapes.push({ type: 'sphere', color: '#ffffff', size: [0.16, 0.16, 0.16], position: [0.17, 1.12, 0.27], rotation: [0, 0, 0], material: 'glass' })
      shapes.push({ type: 'sphere', color: '#111111', size: [0.08, 0.08, 0.08], position: [-0.17, 1.12, 0.34], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'sphere', color: '#111111', size: [0.08, 0.08, 0.08], position: [0.17, 1.12, 0.34], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'sphere', color: '#ff69b4', size: [0.07, 0.05, 0.05], position: [0, 1.02, 0.32], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'cylinder', color: body, size: [0.1, 0.1, 0.45], position: [-0.22, -0.15, 0.18], rotation: [0.6, 0, 0], material: metal() })
      shapes.push({ type: 'cylinder', color: body, size: [0.1, 0.1, 0.45], position: [0.22, -0.15, 0.18], rotation: [0.6, 0, 0], material: metal() })
      shapes.push({ type: 'cylinder', color: body, size: [0.1, 0.1, 0.45], position: [-0.22, -0.15, -0.18], rotation: [-0.6, 0, 0], material: metal() })
      shapes.push({ type: 'cylinder', color: body, size: [0.1, 0.1, 0.45], position: [0.22, -0.15, -0.18], rotation: [-0.6, 0, 0], material: metal() })
      shapes.push({ type: 'cylinder', color: accent, size: [0.06, 0.06, 0.5], position: [0, 0.35, -0.45], rotation: [0, 0, 0], material: metal() })
    } else if (isBuilding) {
      const wall = pick()
      const roof = pick()
      shapes.push({ type: 'box', color: wall, size: [2, 1.5, 2], position: [0, 0.75, 0], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'box', color: wall, size: [1.2, 2, 1.2], position: [0, 2.25, 0], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'cone', color: roof, size: [1.5, 1.2, 1.5], position: [0, 3.85, 0], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'cylinder', color: wall, size: [0.3, 0.3, 1.8], position: [-0.9, 0.9, 0.9], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'cylinder', color: wall, size: [0.3, 0.3, 1.8], position: [0.9, 0.9, 0.9], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'cone', color: roof, size: [0.5, 0.6, 0.5], position: [-0.9, 2.1, 0.9], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'cone', color: roof, size: [0.5, 0.6, 0.5], position: [0.9, 2.1, 0.9], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'box', color: '#2d1b00', size: [0.4, 0.7, 0.1], position: [0, 0.35, 1.01], rotation: [0, 0, 0], material: 'standard' })
      shapes.push({ type: 'box', color: '#87CEEB', size: [0.35, 0.35, 0.1], position: [0, 1.2, 1.01], rotation: [0, 0, 0], material: 'glass' })
    } else if (isVehicle) {
      const body = pick()
      const accent = pick()
      shapes.push({ type: 'box', color: body, size: [2.2, 0.6, 1], position: [0, 0.5, 0], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'box', color: body, size: [1.2, 0.5, 0.9], position: [-0.2, 1.05, 0], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'cylinder', color: '#222222', size: [0.35, 0.35, 0.2], position: [-0.7, 0.18, 0.52], rotation: [1.57, 0, 0], material: 'standard' })
      shapes.push({ type: 'cylinder', color: '#222222', size: [0.35, 0.35, 0.2], position: [0.7, 0.18, 0.52], rotation: [1.57, 0, 0], material: 'standard' })
      shapes.push({ type: 'cylinder', color: '#222222', size: [0.35, 0.35, 0.2], position: [-0.7, 0.18, -0.52], rotation: [1.57, 0, 0], material: 'standard' })
      shapes.push({ type: 'cylinder', color: '#222222', size: [0.35, 0.35, 0.2], position: [0.7, 0.18, -0.52], rotation: [1.57, 0, 0], material: 'standard' })
      shapes.push({ type: 'box', color: '#87CEEB', size: [0.9, 0.35, 0.85], position: [-0.2, 1.1, 0], rotation: [0, 0, 0], material: 'glass' })
      shapes.push({ type: 'sphere', color: accent, size: [0.15, 0.15, 0.15], position: [1.12, 0.5, 0.3], rotation: [0, 0, 0], material: 'glass' })
      shapes.push({ type: 'sphere', color: accent, size: [0.15, 0.15, 0.15], position: [1.12, 0.5, -0.3], rotation: [0, 0, 0], material: 'glass' })
    } else {
      const main = pick()
      const accent = pick()
      const accent2 = pick()
      shapes.push({ type: 'sphere', color: main, size: [1.0, 1.0, 1.0], position: [0, 0.8, 0], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'box', color: main, size: [0.6, 0.8, 0.6], position: [0, 0.4, 0], rotation: [0, 0, 0], material: metal() })
      shapes.push({ type: 'cylinder', color: accent, size: [0.15, 0.15, 1.2], position: [-0.5, 0.6, 0], rotation: [0, 0, 0.5], material: metal() })
      shapes.push({ type: 'cylinder', color: accent, size: [0.15, 0.15, 1.2], position: [0.5, 0.6, 0], rotation: [0, 0, -0.5], material: metal() })
      shapes.push({ type: 'torus', color: accent2, size: [0.5, 0.12, 0.12], position: [0, 1.4, 0], rotation: [1.57, 0, 0], material: 'glass' })
      shapes.push({ type: 'sphere', color: accent, size: [0.2, 0.2, 0.2], position: [0, 1.5, 0], rotation: [0, 0, 0], material: 'glass' })
      shapes.push({ type: 'cone', color: accent2, size: [0.2, 0.4, 0.2], position: [0, 0, 0.6], rotation: [1, 0, 0], material: metal() })
      shapes.push({ type: 'sphere', color: accent2, size: [0.15, 0.15, 0.15], position: [-0.35, 1.2, 0.35], rotation: [0, 0, 0], material: 'glass' })
      shapes.push({ type: 'sphere', color: accent2, size: [0.15, 0.15, 0.15], position: [0.35, 1.2, 0.35], rotation: [0, 0, 0], material: 'glass' })
    }

    return { name, shapes }
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    if (image && !supportsVision) {
      setError('Este modelo no soporta imagenes. Elegi Llama 4 Scout.')
      return
    }

    setError(null)

    const isImageGen = msg.toLowerCase().startsWith('/img ') || msg.toLowerCase().startsWith('/imagen ')
    const is3DGen = msg.toLowerCase().startsWith('/3d ')

    if (is3DGen) {
      const prompt = msg.replace(/^\/3d\s+/i, '')
      const userMessage = { role: 'user', content: msg, text: msg }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput('')
      setLoading(true)

      let model3d = null
      let replyText = `Modelo 3D: "${prompt}"`

      try {
        const model3dMessages = [{ role: 'user', content: `Generate a 3D model of: ${prompt}. JSON ONLY.` }]
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: model3dMessages, model: 'llama-3.3-70b-versatile', isPremium: false, mode: '3d' })
        })
        const data = await res.json()
        if (data.model3d && data.model3d.shapes && data.model3d.shapes.length > 0) {
          model3d = data.model3d
          replyText = data.reply || replyText
        }
      } catch {}

      if (!model3d) {
        model3d = generateFallback3D(prompt)
        replyText = `Modelo 3D generado: "${prompt}"`
      }

      setMessages([...newMessages, { role: 'assistant', content: replyText, model3d }])
      setLoading(false)
      return
    }

    if (isImageGen) {
      const prompt = msg.replace(/^\/(img|imagen)\s+/i, '')
      const userMessage = { role: 'user', content: msg, text: msg }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput('')
      setLoading(true)

      if (refImage) {
        try {
          const visionModel = 'meta-llama/llama-4-scout-17b-16e-instruct'
          const visionRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: [
                { type: 'text', text: 'Describe esta imagen en detalle en 2-3 oraciones. Enfocate en el estilo, colores, composicion, sujeto y ambiente. Responde SOLO la descripcion, sin texto adicional.' },
                { type: 'image_url', image_url: { url: refImage } }
              ]}],
              model: visionModel,
              isPremium: false
            })
          })
          const visionData = await visionRes.json()
          const desc = visionData.reply || prompt
          const fullPrompt = `${prompt}, estilo similar a: ${desc}`
          const imageUrl = generateImage(fullPrompt)
          setMessages([...newMessages, {
            role: 'assistant',
            content: `Imagen generada (basada en referencia): "${prompt}"`,
            generatedImage: { prompt, url: imageUrl }
          }])
        } catch {
          const imageUrl = generateImage(prompt)
          setMessages([...newMessages, {
            role: 'assistant',
            content: `Imagen generada: "${prompt}"`,
            generatedImage: { prompt, url: imageUrl }
          }])
        }
      } else {
        const imageUrl = generateImage(prompt)
        setMessages([...newMessages, {
          role: 'assistant',
          content: `Imagen generada: "${prompt}"`,
          generatedImage: { prompt, url: imageUrl }
        }])
      }
      setLoading(false)
      return
    }

    let userContent
    const parts = []
    if (msg) parts.push({ type: 'text', text: msg })
    if (image && supportsVision) {
      parts.push({ type: 'image_url', image_url: { url: image } })
    }
    if (attachedFiles.length > 0) {
      const textFiles = attachedFiles.filter(f => f.type === 'text')
      const imageFiles = attachedFiles.filter(f => f.type === 'image')
      if (textFiles.length > 0) {
        const fileContent = textFiles.map(f => `[Archivo: ${f.name} (${f.ext}, ${(f.size/1024).toFixed(1)}KB)]\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n')
        parts.push({ type: 'text', text: fileContent })
      }
      for (const img of imageFiles) {
        parts.push({ type: 'image_url', image_url: { url: img.content } })
      }
    }
    userContent = parts.length > 1 ? parts : (parts[0]?.text || msg)
    setAttachedFiles([])

    const userMessage = { role: 'user', content: userContent, text: msg, hasImage: !!image }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    removeImage()
    setLoading(true)

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, model, isPremium: user?.premium || false })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al conectar con la IA')
      }
      const data = await res.json()
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.reply,
        search: data.search || null
      }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => { setMessages([]); setError(null) }

  const suggestions = [
    'Explica que es la programacion',
    'Escribi un script en Python',
    'Analiza esta imagen',
    'Busca celulares Samsung'
  ]

  return (
    <div className="chat-container">
      <div className="header">
        <div className="header-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff"/>
                  <stop offset="50%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#a855f7"/>
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="15" fill="url(#logoGrad)"/>
              <path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="13" r="2" fill="white"/>
              <circle cx="20" cy="13" r="2" fill="white"/>
            </svg>
          </div>
          <span className="logo-text">Nexus AI</span>
        </div>
        <div className="header-actions">
          <div className="model-selector">
            <button className="model-badge" onClick={() => setShowModelPicker(!showModelPicker)}>
              {currentModel?.name} ▾
            </button>
          </div>
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              {user.premium && <span className="user-premium">PRO</span>}
              {user.role === 'admin' && <a href="/admin" className="admin-link">Admin</a>}
              <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); setUser(null) }}>Salir</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="login-btn">Iniciar sesion</a>
              <a href="/admin-login" className="admin-link">Admin</a>
            </div>
          )}
          {messages.length > 0 && (
            <button className="new-chat-btn" onClick={clearChat}>+ Nuevo</button>
          )}
        </div>
      </div>

      {showModelPicker && (
        <>
          <div className="model-overlay" onClick={() => setShowModelPicker(false)} />
          <div className="model-dropdown">
                  {['Gratis', 'Premium', 'Codigo', 'Agentes', 'Seguridad', 'Audio'].map(cat => (
              <div key={cat}>
                <div className="model-cat-header">{cat}</div>
                {MODELS.filter(m => m.cat === cat).map(m => (
                  <button
                    key={m.id}
                    className={`model-option ${m.id === model ? 'active' : ''} ${m.premium && !user ? 'premium-locked' : ''}`}
                    onClick={() => {
                      if (m.premium && !user) { window.location.href = '/login'; return }
                      setModel(m.id); setShowModelPicker(false); removeImage()
                    }}
                  >
                    <span className="model-name">{m.name}</span>
                    <span className="model-desc">{m.desc}</span>
                    {m.vision && <span className="model-tag">VISION</span>}
                    {m.type === 'stt' && <span className="model-tag tag-stt">STT</span>}
                    {m.type === 'tts' && <span className="model-tag tag-tts">TTS</span>}
                    {m.type === 'agent' && <span className="model-tag tag-agent">AGENT</span>}
                    {m.premium && <span className="model-tag tag-premium">PRO</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="messages">
        <div className="bg-watermark">
          <svg viewBox="0 0 120 120" fill="none" width="120" height="120">
            <defs>
              <linearGradient id="watermarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.06"/>
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.06"/>
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="55" fill="url(#watermarkGrad)"/>
            <path d="M38 75c0-12.2 9.8-22 22-22s22 9.8 22 22" stroke="url(#watermarkGrad)" strokeWidth="5" strokeLinecap="round" fill="none" style={{stroke:'#6366f1', strokeOpacity:0.08}}/>
            <circle cx="48" cy="52" r="5" fill="#6366f1" fillOpacity="0.08"/>
            <circle cx="72" cy="52" r="5" fill="#6366f1" fillOpacity="0.08"/>
          </svg>
        </div>
        {messages.length === 0 && !loading && (
          <div className="welcome">
            <div className="welcome-icon">
              <svg viewBox="0 0 32 32" fill="none" width="48" height="48">
                <defs>
                  <linearGradient id="welcomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#e0d4ff"/>
                  </linearGradient>
                </defs>
                <path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="url(#welcomeGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <circle cx="12" cy="13" r="2" fill="url(#welcomeGrad)"/>
                <circle cx="20" cy="13" r="2" fill="url(#welcomeGrad)"/>
                <path d="M8 11c1-3 4-5 8-5s7 2 8 5" stroke="url(#welcomeGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
              </svg>
            </div>
            <h2>Hola, soy Nexus AI</h2>
            <p>Tu asistente de IA profesional. Busco productos, genero imagenes, escribo codigo y mas.</p>
            <div className="tips-grid">
              <div className="tip-card" onClick={() => { setInput('Explica que es la programacion'); sendMessage('Explica que es la programacion') }}>
                <span className="tip-icon">💡</span>
                <span className="tip-text">Explica que es la programacion</span>
              </div>
              <div className="tip-card" onClick={() => { setInput('/img un gato astronauta'); sendMessage('/img un gato astronauta') }}>
                <span className="tip-icon">🎨</span>
                <span className="tip-text">/img un gato astronauta</span>
              </div>
              <div className="tip-card" onClick={() => { setInput('Busca auriculares bluetooth'); sendMessage('Busca auriculares bluetooth') }}>
                <span className="tip-icon">🔍</span>
                <span className="tip-text">Busca auriculares bluetooth</span>
              </div>
              <div className="tip-card" onClick={() => { setInput('Escribi un script en Python que cuente hasta 10'); sendMessage('Escribi un script en Python que cuente hasta 10') }}>
                <span className="tip-icon">💻</span>
                <span className="tip-text">Escribi codigo en Python</span>
              </div>
            </div>
            <div className="img-model-selector">
              <label>Modelo de imagen:</label>
              <select value={imgModel} onChange={(e) => setImgModel(e.target.value)}>
                <option value="flux-realism">Flux Realism</option>
                <option value="flux">Flux</option>
                <option value="flux-anime">Flux Anime</option>
                <option value="flux-3d">Flux 3D</option>
                <option value="turbo">Turbo</option>
              </select>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === 'user' ? '👤' : '⚡'}</div>
            <div className="bubble-wrapper">
              <div className="bubble">
                {msg.hasImage && msg.role === 'user' && typeof msg.content === 'object' && (
                  <img
                    src={msg.content.find(c => c.type === 'image_url')?.image_url?.url}
                    alt="imagen"
                    className="message-image"
                  />
                )}
                {!msg.model3d && (
                  <RenderContent text={typeof msg.content === 'string' ? msg.content : msg.content.find(c => c.type === 'text')?.text || ''} />
                )}
              </div>
              {msg.search && <SearchCard query={msg.search.query} url={msg.search.url} />}
              {msg.generatedImage && <GeneratedImage prompt={msg.generatedImage.prompt} url={msg.generatedImage.url} />}
              {msg.model3d && <Model3DViewer modelData={msg.model3d} prompt={msg.content} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="avatar">⚡</div>
            <div className="bubble">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="preview" />
            <button className="remove-image" onClick={removeImage}>✕</button>
          </div>
        )}
        {refImagePreview && (
          <div className="image-preview ref-preview">
            <span className="ref-label">Referencia:</span>
            <img src={refImagePreview} alt="referencia" />
            <button className="remove-image" onClick={() => { setRefImage(null); setRefImagePreview(null) }}>✕</button>
          </div>
        )}
        {attachedFiles.length > 0 && (
          <div className="attached-files">
            {attachedFiles.map((f, i) => (
              <div key={i} className="attached-file">
                <span className="attached-file-icon">{f.type === 'image' ? '🖼' : f.type === 'text' ? '📄' : '📎'}</span>
                <span className="attached-file-name">{f.name}</span>
                <span className="attached-file-size">({(f.size/1024).toFixed(0)}KB)</span>
                <button className="attached-file-remove" onClick={() => removeFile(i)}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="input-wrapper">
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
          <input ref={refInputRef} type="file" accept="image/*" onChange={handleRefImage} style={{ display: 'none' }} />
          <input ref={fileInputRef} type="file" multiple accept=".txt,.md,.csv,.json,.xml,.yaml,.yml,.log,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.html,.css,.php,.rb,.go,.rs,.swift,.kt,.sql,.sh,.bat,.ps1,.r,.lua,.pl,.cs,.swift,.kt,.dart,.scala,.ex,.exs,.hs,.clj,.lisp,.elm,.vue,.svelte,.astro,.toml,.ini,.cfg,.conf,.env,.gitignore,.dockerignore,.dockerfile,.yaml,.yml,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={handleFileUpload} style={{ display: 'none' }} />
          <div className="attach-group">
            <button className="attach-btn" onClick={() => galleryInputRef.current?.click()} title="Subir imagen para analizar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            <button className="attach-btn file-btn" onClick={() => fileInputRef.current?.click()} title="Subir archivo (codigo, texto, PDF, etc)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
            <button className="attach-btn ref-btn" onClick={() => refInputRef.current?.click()} title="Subir imagen de referencia para /img">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </button>
            <button className="attach-btn camera-btn" onClick={() => cameraInputRef.current?.click()} title="Sacar foto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                <circle cx="12" cy="13" r="4"></circle>
              </svg>
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Escribi tu mensaje... (/img imagen | /3d modelo)'
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !image) || loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
