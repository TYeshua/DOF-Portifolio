import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Folha que sobe da parte de baixo da tela. Fecha arrastando para baixo (longe o bastante
// ou com um peteleco rápido), tocando fora, no X ou com Esc.
const DISTANCIA_FECHA = 110 // px
// Velocidade média do gesto inteiro (px/ms). A média é mais estável que a dos últimos
// eventos, que o navegador agrupa por quadro.
const VELOCIDADE_FECHA = 0.3

export function Folha({ aberta, titulo, aoFechar, children }: { aberta: boolean; titulo: string; aoFechar: () => void; children: ReactNode }) {
  const painel = useRef<HTMLDivElement>(null)
  const topo = useRef<HTMLDivElement>(null)
  const arraste = useRef<{ id: number; y0: number; t0: number; d: number } | null>(null)
  const idTitulo = useId()

  useEffect(() => {
    if (!aberta) return
    const anterior = document.activeElement as HTMLElement | null
    const corpo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && !e.defaultPrevented && aoFechar()
    window.addEventListener('keydown', tecla)
    painel.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = corpo
      window.removeEventListener('keydown', tecla)
      // Devolve o foco ao botão que abriu a folha
      anterior?.focus({ preventScroll: true })
    }
  }, [aberta, aoFechar])

  // Durante o arraste o painel segue o dedo direto no estilo, sem renderizar o conteúdo de novo
  const mover = (d: number) => {
    const p = painel.current
    if (!p) return
    p.style.transition = 'none'
    p.style.transform = `translateY(${d}px)`
  }
  const soltar = (fechar: boolean) => {
    const p = painel.current
    arraste.current = null
    if (p) {
      // Sem estilo próprio, o painel volta (ou desce) pela transição do CSS a partir de onde parou
      p.style.transition = ''
      p.style.transform = ''
    }
    if (fechar) aoFechar()
  }

  return createPortal(
    <div className="folha fixed inset-0 z-[58]" data-aberta={aberta} inert={!aberta} aria-hidden={!aberta}>
      <button type="button" tabIndex={-1} aria-label="Fechar" onClick={aoFechar} className="folha-fundo absolute inset-0 bg-panel/50 backdrop-blur-[2px]" />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        tabIndex={-1}
        className="folha-painel absolute inset-x-0 bottom-0 mx-auto flex max-h-[88svh] max-w-[440px] flex-col rounded-t-[26px] border border-b-0 border-line bg-bg shadow-[0_-20px_50px_-20px_rgba(0,0,0,.5)] outline-none"
      >
        <div
          ref={topo}
          className="folha-topo flex cursor-grab touch-none flex-col items-center gap-3 px-5 pt-3 active:cursor-grabbing"
          onPointerDown={(e) => {
            // Um dedo só: um segundo toque no meio do arraste não faz o painel pular
            if (arraste.current || (e.target as HTMLElement).closest('button')) return
            arraste.current = { id: e.pointerId, y0: e.clientY, t0: performance.now(), d: 0 }
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            const a = arraste.current
            if (!a || a.id !== e.pointerId) return
            const bruto = e.clientY - a.y0
            // Para baixo segue o dedo; para cima resiste cada vez mais, sem parar seco
            a.d = bruto >= 0 ? bruto : -8 * Math.log1p(-bruto / 24)
            mover(a.d)
          }}
          onPointerUp={(e) => {
            const a = arraste.current
            if (!a || a.id !== e.pointerId) return
            const vel = a.d / Math.max(1, performance.now() - a.t0)
            soltar(a.d > DISTANCIA_FECHA || (a.d > 24 && vel > VELOCIDADE_FECHA))
          }}
          onPointerCancel={(e) => {
            if (arraste.current?.id === e.pointerId) soltar(false)
          }}
          onLostPointerCapture={(e) => {
            if (arraste.current?.id === e.pointerId) soltar(false)
          }}
        >
          <span aria-hidden className="h-1.5 w-11 rounded-full bg-line" />
          <div className="flex w-full items-center justify-between gap-3 pb-3">
            <h2 id={idTitulo} className="display text-[1.3rem] leading-tight">
              {titulo}
            </h2>
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface transition active:scale-95"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div
          className="overflow-y-auto overscroll-contain px-5 pt-3"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}
          onScroll={(e) => {
            if (topo.current) topo.current.dataset.rolou = String(e.currentTarget.scrollTop > 4)
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
