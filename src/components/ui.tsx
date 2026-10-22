import { useState, type ReactNode } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { copiar } from '../lib/contato'

export function Secao({ id, rotulo, titulo, children }: { id: string; rotulo: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="gutter flex flex-col gap-5 py-12">
      <header className="revela flex flex-col gap-1">
        <p className="label text-accent-ink">{rotulo}</p>
        <h2 id={`${id}-titulo`} className="display text-[1.75rem] font-extrabold leading-tight">
          {titulo}
        </h2>
      </header>
      {children}
    </section>
  )
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
