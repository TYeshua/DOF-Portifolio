import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import type { Tela } from '../data'

const arquivos = import.meta.glob('../assets/prints/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<
  string,
  string
>
const url = (nome: string) => arquivos[`../assets/prints/${nome}.webp`]

type DocVT = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function transicao(atualizar: () => void) {
  const doc = document as DocVT
  if (!doc.startViewTransition || reduzMovimento()) {
    atualizar()
    return Promise.resolve()
  }
  return doc.startViewTransition(() => flushSync(atualizar)).finished
}

function Moldura({ tela, children }: { tela: Tela; children: React.ReactNode }) {
  if (tela.formato === 'celular') {
    return <div className="overflow-hidden rounded-[18px] border border-line bg-sunken shadow-[0_8px_24px_-16px_rgba(0,0,0,.5)]">{children}</div>
  }
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-sunken shadow-[0_10px_28px_-18px_rgba(0,0,0,.55)]">
      <div aria-hidden className="flex h-4 items-center gap-1 border-b border-line bg-surface px-2">
        <span className="size-1.5 rounded-full bg-line" />
        <span className="size-1.5 rounded-full bg-line" />
        <span className="size-1.5 rounded-full bg-line" />
      </div>
      {children}
    </div>
  )
}

export { transicao }

export function Galeria({ titulo, telas, ativo = true }: { titulo: string; telas: Tela[]; ativo?: boolean }) {
  const [atual, setAtual] = useState(0)
  const [aberta, setAberta] = useState<number | null>(null)
  const [tocou, setTocou] = useState(false)
  const [pronto, setPronto] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const imgs = useRef<(HTMLImageElement | null)[]>([])

  // A troca automática só começa depois que o cartão fica parado na tela por um tempo,
  // para não mudar a imagem enquanto a pessoa ainda está lendo ou rolando.
  useEffect(() => {
    const el = raiz.current
    if (!el || !ativo || telas.length < 2) return
    let timer = 0
    const obs = new IntersectionObserver(
      ([e]) => {
        clearTimeout(timer)
        if (e.isIntersecting) timer = window.setTimeout(() => setPronto(true), 2500)
        else setPronto(false)
      },
      { threshold: 0.6 },
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      clearTimeout(timer)
      setPronto(false)
    }
  }, [ativo, telas.length])

  const abrir = (i: number) => {
    const el = imgs.current[i]
    if (el) el.style.viewTransitionName = 'tela-ampliada'
    transicao(() => {
      if (el) el.style.viewTransitionName = ''
      setAberta(i)
    })
  }
  const auto = ativo && pronto && !tocou && telas.length > 1 && aberta === null

  return (
    <div ref={raiz} className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => abrir(atual)}
        aria-label={`Ampliar: ${telas[atual].legenda}`}
        className="palco group relative block h-[214px] w-full overflow-hidden rounded-2xl bg-sunken text-left"
      >
        {telas.map((t, i) => (
          <div
            key={t.arquivo}
            aria-hidden={i !== atual}
            className={`palco-tela absolute inset-0 flex items-center justify-center p-3 ${i === atual ? 'ativa' : ''}`}
          >
            <Moldura tela={t}>
              <img
                ref={(el) => {
                  imgs.current[i] = el
                }}
                src={url(`${t.arquivo}-p`)}
                alt={t.legenda}
                loading="lazy"
                decoding="async"
                className={`block object-cover object-top ${t.formato === 'celular' ? 'h-[174px] w-auto aspect-[9/16]' : 'h-auto w-full aspect-[16/10] max-h-[172px]'}`}
              />
            </Moldura>
          </div>
        ))}
        <span aria-hidden className="absolute bottom-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-panel/80 text-on-panel backdrop-blur transition-transform duration-300 group-hover:scale-110">
          <Maximize2 size={14} />
        </span>
      </button>
      <p key={atual} className="legenda min-h-[2.6em] text-[0.8rem] leading-snug text-muted">{telas[atual].legenda}</p>
      {telas.length > 1 && (
        <div className="flex gap-2" role="tablist" aria-label={`Telas do ${titulo}`}>
          {telas.map((t, i) => (
            <button
              key={t.arquivo}
              type="button"
              role="tab"
              aria-selected={i === atual}
              aria-label={t.legenda}
              onClick={() => {
                setTocou(true)
                setAtual(i)
              }}
              className={`miniatura relative h-11 flex-1 overflow-hidden rounded-lg border transition-all duration-300 ${i === atual ? 'border-accent' : 'border-line opacity-60 hover:opacity-100'}`}
            >
              <img src={url(`${t.arquivo}-p`)} alt="" loading="lazy" className="size-full object-cover object-top" />
              {i === atual && auto && (
                <span
                  aria-hidden
                  className="avanco absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent"
                  onAnimationEnd={() => setAtual((a) => (a + 1) % telas.length)}
                />
              )}
            </button>
          ))}
        </div>
      )}
      {aberta !== null &&
        createPortal(
          <Visor
            titulo={titulo}
            telas={telas}
            inicio={aberta}
            aoFechar={(i) => {
              const el = imgs.current[i]
              transicao(() => {
                setAberta(null)
                setAtual(i)
                if (el) el.style.viewTransitionName = 'tela-ampliada'
              }).then(() => {
                if (el) el.style.viewTransitionName = ''
              })
            }}
          />,
          document.body,
        )}
    </div>
  )
}

function Visor({ titulo, telas, inicio, aoFechar }: { titulo: string; telas: Tela[]; inicio: number; aoFechar: (i: number) => void }) {
  const trilho = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(inicio)
  const [nomeAtivo, setNomeAtivo] = useState(true)

  useLayoutEffect(() => {
    const el = trilho.current
    if (el) el.scrollLeft = inicio * el.clientWidth
  }, [inicio])

  useEffect(() => {
    const t = setTimeout(() => setNomeAtivo(false), 450)
    const corpo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.body.style.overflow = corpo
    }
  }, [inicio])

  const fechar = useCallback(() => {
    flushSync(() => setNomeAtivo(true))
    aoFechar(atual)
  }, [aoFechar, atual])

  const ir = useCallback(
    (d: number) => {
      const el = trilho.current
      if (!el) return
      const alvo = Math.max(0, Math.min(telas.length - 1, atual + d))
      el.scrollTo({ left: alvo * el.clientWidth, behavior: reduzMovimento() ? 'auto' : 'smooth' })
    },
    [atual, telas.length],
  )

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar()
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [fechar, ir])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${titulo}: telas ampliadas`}
      className="visor fixed inset-0 z-[60] flex flex-col bg-panel text-on-panel"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className="flex items-center justify-between gap-3 py-3"
        style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
      >
        <p className="min-w-0 truncate text-[0.95rem] font-semibold">
          {titulo} <span className="tabular ml-1 font-mono text-[0.8rem] opacity-60">{atual + 1}/{telas.length}</span>
        </p>
        <button type="button" onClick={fechar} className="grid size-11 place-items-center rounded-full bg-on-panel/10" aria-label="Fechar">
          <X size={20} />
        </button>
      </div>
      <div
        ref={trilho}
        onScroll={(e) => {
          const el = e.currentTarget
          setAtual(Math.round(el.scrollLeft / el.clientWidth))
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) fechar()
        }}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {telas.map((t, i) => (
          <figure
            key={t.arquivo}
            className="flex h-full w-full shrink-0 snap-center flex-col items-center justify-center gap-3 px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) fechar()
            }}
          >
            <img
              src={url(t.arquivo)}
              alt={t.legenda}
              decoding="async"
              className={`max-h-[78%] max-w-full rounded-lg object-contain shadow-2xl ${t.formato === 'celular' ? 'rounded-[20px]' : ''}`}
              style={{ viewTransitionName: nomeAtivo && i === atual ? 'tela-ampliada' : undefined, touchAction: 'pan-x pinch-zoom' }}
            />
            <figcaption className="max-w-[40ch] text-center text-[0.9rem] leading-snug opacity-80">
              {t.legenda}
              {t.formato === 'desktop' && <span className="dica-girar mt-1 block font-mono text-[0.72rem] opacity-70">Gire o celular para ver maior</span>}
            </figcaption>
          </figure>
        ))}
      </div>
      {telas.length > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button type="button" onClick={() => ir(-1)} disabled={atual === 0} className="grid size-11 place-items-center rounded-full bg-on-panel/10 disabled:opacity-30" aria-label="Tela anterior">
            <ChevronLeft size={20} />
          </button>
          <div className="flex gap-1.5" aria-hidden>
            {telas.map((t, i) => (
              <span key={t.arquivo} className={`h-1.5 rounded-full transition-all duration-300 ${i === atual ? 'w-5 bg-accent' : 'w-1.5 bg-on-panel/30'}`} />
            ))}
          </div>
          <button type="button" onClick={() => ir(1)} disabled={atual === telas.length - 1} className="grid size-11 place-items-center rounded-full bg-on-panel/10 disabled:opacity-30" aria-label="Próxima tela">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
