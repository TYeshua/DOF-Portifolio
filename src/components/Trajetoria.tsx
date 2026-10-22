import { trajetoria } from '../data'
import { Secao } from './ui'

export function Trajetoria() {
  return (
    <Secao id="trajetoria" rotulo="Trajetória" titulo="Pesquisa, liderança e formação">
      <ol className="flex flex-col">
        {trajetoria.map((t, i) => (
          <li key={t.cargo} className="revela relative flex flex-col gap-1 pb-7 pl-7 last:pb-0">
            {i < trajetoria.length - 1 && <span aria-hidden className="absolute bottom-0 left-[5px] top-3 w-px bg-line" />}
            <span
              aria-hidden
              className={`absolute left-0 top-[0.4rem] size-[11px] rounded-full border-2 ${i < 2 ? 'border-accent bg-accent' : 'border-steel bg-bg'}`}
            />
            <p className="tabular font-mono text-[0.78rem] text-muted">{t.periodo}</p>
            <h3 className="text-[1.05rem] font-semibold leading-snug">{t.cargo}</h3>
            <p className="text-[0.92rem] font-medium text-accent-ink">{t.local}</p>
            <p className="text-[0.95rem] text-muted">{t.texto}</p>
          </li>
        ))}
      </ol>
    </Secao>
  )
}
