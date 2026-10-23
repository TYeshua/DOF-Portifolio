import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Aviso curto no topo da tela depois de baixar o contato no Android, onde o .vcf
// costuma só baixar, sem abrir a tela de contato. No iPhone ele já abre direto.
const ehAndroid = () => /Android/i.test(navigator.userAgent)

export function Aviso() {
  const [texto, setTexto] = useState<string | null>(null)

  useEffect(() => {
    let timer = 0
    const exibir = (t: string) => {
      setTexto(t)
      clearTimeout(timer)
      timer = window.setTimeout(() => setTexto(null), 7000)
    }
    const aoClicar = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a[href$=".vcf"]')
      if (link && ehAndroid()) exibir('Contato baixado. Abra o arquivo thiago-yeshua.vcf pela notificação ou em Downloads para salvar.')
    }
    document.addEventListener('click', aoClicar)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', aoClicar)
    }
  }, [])

  return createPortal(
    <div
      className="aviso pointer-events-none fixed inset-x-0 z-70 flex justify-center px-4"
      data-visivel={texto !== null}
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}
    >
      <div role="status" aria-live="polite" className="aviso-caixa pointer-events-auto flex w-full max-w-102 items-start gap-3 rounded-2xl bg-panel py-3 pl-4 pr-2 text-[0.88rem] leading-snug text-on-panel shadow-[0_14px_34px_-14px_rgba(0,0,0,.6)]">
        <span className="flex-1 pt-1.5">{texto}</span>
        {texto && (
          <button type="button" onClick={() => setTexto(null)} aria-label="Fechar aviso" className="grid size-9 shrink-0 place-items-center rounded-full">
            <X size={17} />
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
