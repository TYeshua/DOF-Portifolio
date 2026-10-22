import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Folha que sobe da parte de baixo da tela. Fecha arrastando para baixo,
// tocando fora, no X ou com Esc.
export function Folha({ aberta, titulo, aoFechar, children }: { aberta: boolean; titulo: string; aoFechar: () => void; children: ReactNode }) {
  const painel = useRef<HTMLDivElement>(null)
  const inicioY = useRef<number | null>(null)
  const [arraste, setArraste] = useState(0)

  useEffect(() => {
    if (!aberta) return
    const corpo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    painel.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = corpo
      window.removeEventListener('keydown', tecla)
    }
  }, [aberta, aoFechar])

  return createPortal(
    <div className="folha fixed inset-0 z-[58]" data-aberta={aberta} inert={!aberta} aria-hidden={!aberta}>
      <button type="button" tabIndex={-1} aria-label="Fechar" onClick={aoFechar} className="folha-fundo absolute inset-0 bg-panel/50 backdrop-blur-[2px]" />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="folha-painel absolute inset-x-0 bottom-0 mx-auto flex max-h-[88svh] max-w-[440px] flex-col rounded-t-[26px] border border-b-0 border-line bg-bg shadow-[0_-20px_50px_-20px_rgba(0,0,0,.5)] outline-none"
        style={{ transform: aberta ? `translateY(${arraste}px)` : undefined, transition: inicioY.current !== null ? 'none' : undefined }}
      >
        <div
          className="flex cursor-grab touch-none flex-col items-center gap-3 px-5 pt-3"
          onPointerDown={(e) => {
            inicioY.current = e.clientY
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerMove={(e) => {
            if (inicioY.current === null) return
            setArraste(Math.max(0, e.clientY - inicioY.current))
          }}
          onPointerUp={() => {
            const d = arraste
            inicioY.current = null
            setArraste(0)
            if (d > 110) aoFechar()
          }}
        >
          <span aria-hidden className="h-1.5 w-11 rounded-full bg-line" />
          <div className="flex w-full items-center justify-between gap-3 pb-2">
            <p className="display text-[1.3rem] leading-tight">{titulo}</p>
            <button type="button" onClick={aoFechar} aria-label="Fechar" className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto px-5 pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
