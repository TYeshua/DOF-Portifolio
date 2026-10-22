import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { copiar } from '../lib/contato'

// Título que sobe palavra por palavra quando entra na tela
export function TituloRevelado({ texto, className = '' }: { texto: string; className?: string }) {
  const palavras = texto.split(' ')
  return (
    <span className={`titulo-revelado ${className}`} aria-label={texto}>
      {palavras.map((p, i) => (
        <span key={i} aria-hidden className="-mb-[0.18em] inline-block overflow-hidden pb-[0.18em] pt-[0.06em] -mt-[0.06em] align-top">
          <span className="palavra inline-block" style={{ ['--i' as string]: i }}>
            {p}
            {i < palavras.length - 1 ? '\u00a0' : ''}
          </span>
        </span>
      ))}
    </span>
  )
}

export function Secao({ id, rotulo, titulo, children, className = '' }: { id: string; rotulo: string; titulo: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className={`gutter flex flex-col gap-5 py-14 ${className}`}>
      <header className="revela revela-titulo flex flex-col gap-1.5">
        <p className="label flex items-center gap-2 text-accent-ink">
          <span aria-hidden className="traco-rotulo h-px w-6 bg-accent" />
          {rotulo}
        </p>
        <h2 id={`${id}-titulo`} className="display text-[2.15rem] leading-[1.05]">
          <TituloRevelado texto={titulo} />
        </h2>
      </header>
      {children}
    </section>
  )
}

// Conta de 0 até o número do texto (ex.: "8 %", "264") quando fica visível
export function Contador({ valor, ativo = true }: { valor: string; ativo?: boolean }) {
  const m = valor.match(/^([\d.,]+)(.*)$/)
  const alvo = m ? Number(m[1].replace(/\./g, '').replace(',', '.')) : NaN
  const [mostra, setMostra] = useState(Number.isNaN(alvo) ? valor : `0${m?.[2] ?? ''}`)
  const ref = useRef<HTMLSpanElement>(null)
  const feito = useRef(false)
  useEffect(() => {
    if (Number.isNaN(alvo) || feito.current || !ativo) return
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMostra(valor)
      return
    }
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || feito.current) return
      feito.current = true
      obs.disconnect()
      const t0 = performance.now()
      const dur = 1100
      const passo = (agora: number) => {
        const k = Math.min(1, (agora - t0) / dur)
        const v = Math.round(alvo * (1 - Math.pow(1 - k, 3)))
        setMostra(`${v.toLocaleString('pt-BR')}${m?.[2] ?? ''}`)
        if (k < 1) requestAnimationFrame(passo)
      }
      requestAnimationFrame(passo)
    }, { threshold: 0.6 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [alvo, ativo, valor, m])
  return <span ref={ref}>{mostra}</span>
}

export function LinkExterno({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-1 text-[0.95rem] font-medium underline decoration-line decoration-2 underline-offset-4 transition-colors hover:decoration-accent"
    >
      {children}
      <ArrowUpRight aria-hidden size={16} className="text-muted" />
    </a>
  )
}

export function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copiar(texto)) {
          setOk(true)
          setTimeout(() => setOk(false), 2000)
        }
      }}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-current opacity-80 transition hover:opacity-100"
      aria-label={`Copiar ${rotulo}`}
    >
      {ok ? <Check aria-hidden size={16} /> : <Copy aria-hidden size={16} />}
      <span aria-live="polite">{ok ? 'Copiado' : 'Copiar'}</span>
    </button>
  )
}
