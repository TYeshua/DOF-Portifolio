import { ChevronDown } from 'lucide-react'
import { coautorias, competencias, idiomas, producao } from '../data'
import { Secao } from './ui'

export function Producao() {
  return (
    <Secao id="producao" rotulo="Produção" titulo="Registro e publicações">
      <ul className="flex flex-col">
        {producao.map((p) => (
          <li key={p.titulo} className="revela flex flex-col gap-1.5 border-t border-line py-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="label text-accent-ink">{p.tipo}</span>
              <span className="tabular font-mono text-[0.78rem] text-muted">{p.ano}</span>
            </div>
            <h3 className="text-[1rem] font-semibold leading-snug">{p.titulo}</h3>
            <p className="text-[0.85rem] text-muted">{p.autores}</p>
            <p className="text-[0.88rem]">{p.onde}</p>
          </li>
        ))}
      </ul>
      <details className="group rounded-xl border border-line bg-surface">
        <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[0.95rem] [&::-webkit-details-marker]:hidden">
          <span>{coautorias.resumo}</span>
          <ChevronDown aria-hidden size={20} className="shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="flex flex-col gap-3 border-t border-line px-4 py-4 text-[0.88rem] text-muted">
          {coautorias.itens.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </details>
    </Secao>
  )
}

export function Competencias() {
  return (
    <Secao id="competencias" rotulo="Competências" titulo="Ferramentas do dia a dia" className="overflow-hidden">
      <div className="-mx-4 flex flex-col gap-5">
        {competencias.map((g, k) => (
          <div key={g.grupo} className="revela flex flex-col gap-2.5">
            <h3 className="px-4 text-[0.9rem] font-semibold">{g.grupo}</h3>
            <div className="faixa" style={{ ['--dur' as string]: `${g.itens.length * 4.2}s` }} data-sentido={k % 2 ? 'volta' : 'vai'}>
              <ul className="faixa-trilho flex w-max gap-2 px-1">
                {[...g.itens, ...g.itens].map((item, i) => (
                  <li
                    key={i}
                    aria-hidden={i >= g.itens.length}
                    className="faixa-item shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.88rem] transition-colors duration-300 hover:border-accent hover:text-accent-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
        <div className="revela flex flex-col gap-1 px-4">
          <h3 className="text-[0.9rem] font-semibold">Idiomas</h3>
          <p className="text-[0.92rem] text-muted">{idiomas}</p>
        </div>
      </div>
    </Secao>
  )
}
