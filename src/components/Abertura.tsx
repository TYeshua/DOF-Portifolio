import { useEffect, useRef, useState } from 'react'
import type { Cena } from '../lib/cenaPoco'

// Tela de abertura: um gêmeo digital do poço é perfurado enquanto o site carrega.
// Aparece uma vez por sessão. "Pular" encerra na hora.

const DURACAO = 3.6 // segundos de perfuração
const MD_FINAL = 3480 // m, profundidade medida no fim do poço direcional
const TVD_FINAL = 2950

const etapas = [
  { ate: 0.15, texto: 'Iniciando o gêmeo digital' },
  { ate: 0.4, texto: 'Perfurando a fase de superfície' },
  { ate: 0.62, texto: 'Descendo o revestimento' },
  { ate: 0.99, texto: 'Navegando até o reservatório' },
  { ate: 2, texto: 'Reservatório alcançado' },
]

export function deveMostrarAbertura() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (new URLSearchParams(location.search).has('intro')) return true
  try {
    return sessionStorage.getItem('abertura-vista') !== '1'
  } catch {
    return true
  }
}

export function Abertura({ aoRevelar, aoFim }: { aoRevelar: () => void; aoFim: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const raiz = useRef<HTMLDivElement>(null)
  const md = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const rop = useRef<HTMLSpanElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const barra = useRef<HTMLSpanElement>(null)
  const [etapa, setEtapa] = useState(0)
  const [fase, setFase] = useState<'perfurando' | 'chegou' | 'saindo'>('perfurando')
  const cena = useRef<Cena | null>(null)
  const encerrar = useRef<() => void>(() => {})

  useEffect(() => {
    let vivo = true
    let quadro = 0
    let inicio = 0
    let pronto = false
    let saindo = false
    const timers: number[] = []

    const pagina = Promise.all([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => (document.readyState === 'complete' ? r(0) : window.addEventListener('load', r, { once: true })))])
    pagina.then(() => (pronto = true))

    const sair = () => {
      if (saindo) return
      saindo = true
      try {
        sessionStorage.setItem('abertura-vista', '1')
      } catch {
        /* sem armazenamento */
      }
      cena.current?.mergulhar()
      setFase('saindo')
      timers.push(window.setTimeout(aoRevelar, 520))
      timers.push(window.setTimeout(aoFim, 1700))
    }
    encerrar.current = sair

    import('../lib/cenaPoco').then(({ criarCena }) => {
      if (!vivo || !canvas.current) return
      try {
        cena.current = criarCena(canvas.current)
      } catch {
        // Sem WebGL: segue só com os números e a barra
      }
    })

    // Tempo acumulado com passo limitado: um travamento (ex.: compilação do WebGL)
    // não faz a perfuração pular direto para o fim.
    let t = 0
    let ultimo = 0
    const passo = (agora: number) => {
      if (!inicio) inicio = ultimo = agora
      t += Math.min(0.05, (agora - ultimo) / 1000)
      ultimo = agora
      let p = Math.min(1, t / DURACAO)
      p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
      if (!pronto) p = Math.min(p, 0.94)
      if (cena.current) cena.current.progresso = p
      if (md.current) md.current.textContent = Math.round(p * MD_FINAL).toLocaleString('pt-BR')
      if (bar.current) bar.current.textContent = Math.round(p * TVD_FINAL * 0.1177).toLocaleString('pt-BR')
      if (rop.current) rop.current.textContent = p < 1 ? (22 + Math.sin(t * 5) * 4 + Math.sin(t * 13) * 2).toFixed(1).replace('.', ',') : '0,0'
      if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`
      if (barra.current) barra.current.style.transform = `scaleX(${p})`
      const e = etapas.findIndex((x) => p < x.ate)
      setEtapa(e === -1 ? etapas.length - 1 : e)
      if (p >= 1) {
        setFase((f) => (f === 'perfurando' ? 'chegou' : f))
        timers.push(window.setTimeout(sair, 750))
        return
      }
      quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)

    return () => {
      vivo = false
      cancelAnimationFrame(quadro)
      timers.forEach(clearTimeout)
      cena.current?.destruir()
    }
  }, [aoRevelar, aoFim])

  return (
    <div ref={raiz} className="abertura fixed inset-0 z-[100] overflow-hidden" data-fase={fase} role="status" aria-label="Carregando o portfólio">
      <canvas ref={canvas} className="abertura-canvas absolute inset-0 size-full" aria-hidden />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_100%,rgba(11,11,12,.95)_25%,rgba(11,11,12,0)_70%)]" />

      <div
        className="abertura-ui relative flex h-full flex-col justify-between text-[#f1ede6]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 18px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
          paddingLeft: 'max(20px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
        }}
      >
        <div className="flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#a29e97]">
          <span className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-[#ff5500]" />
            Poço TY-01 · gêmeo digital
          </span>
          <button
            type="button"
            onClick={() => encerrar.current()}
            className="pointer-events-auto rounded-full border border-white/15 px-3 py-1.5 tracking-[0.12em] text-[#f1ede6] transition hover:bg-white/10"
          >
            Pular
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-col gap-5">
          <div className="a-item flex flex-col gap-2" style={{ ['--i' as string]: 0 }}>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[#ff7a3d]">Digital Oilfield</span>
            <h1 className="display text-[2.9rem] leading-[0.95] text-[#f1ede6]">
              Thiago <em className="text-[#ff7a3d]">Yeshua</em>
            </h1>
            <p className="text-[0.95rem] text-[#a29e97]">Engenharia de Petróleo · Software · Dados</p>
          </div>

          <dl className="a-item grid grid-cols-3 border-y border-white/10 font-mono" style={{ ['--i' as string]: 1 }}>
            {[
              { rotulo: 'Prof. medida', ref: md, un: 'm' },
              { rotulo: 'Pressão fundo', ref: bar, un: 'bar' },
              { rotulo: 'Taxa (ROP)', ref: rop, un: 'm/h' },
            ].map((x, i) => (
              <div key={x.rotulo} className={`flex flex-col gap-1 py-3 ${i ? 'border-l border-white/10 pl-3' : 'pr-3'}`}>
                <dt className="text-[0.62rem] uppercase tracking-[0.14em] text-[#a29e97]">{x.rotulo}</dt>
                <dd className="tabular text-[1.05rem] text-[#f1ede6]">
                  <span ref={x.ref}>0</span> <span className="text-[0.7rem] text-[#a29e97]">{x.un}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="a-item flex flex-col gap-2" style={{ ['--i' as string]: 2 }}>
            <div className="flex items-baseline justify-between font-mono text-[0.72rem]">
              <span key={etapa} className="etapa text-[#f1ede6]">
                {etapas[etapa].texto}
              </span>
              <span ref={pct} className="tabular text-[#a29e97]">
                0%
              </span>
            </div>
            <span className="relative block h-[2px] overflow-hidden rounded-full bg-white/10">
              <span ref={barra} className="absolute inset-0 origin-left bg-[#ff5500] shadow-[0_0_12px_#ff5500]" style={{ transform: 'scaleX(0)' }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
