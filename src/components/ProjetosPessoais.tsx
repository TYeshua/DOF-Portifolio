import { projetosPessoais, type ProjetoPessoal } from '../data'
import { Galeria } from './Galeria'
import { Secao } from './ui'

const corArea: Record<ProjetoPessoal['area'], string> = {
  'Óleo e gás': 'bg-accent',
  Energia: 'bg-good',
  Software: 'bg-steel',
}

function Cartao({ p }: { p: ProjetoPessoal }) {
  return (
    <article className="revela flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-5">
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 font-mono text-[0.75rem] text-muted">
          <span className="inline-flex items-center gap-1.5 text-ink">
            <span aria-hidden className={`size-2 rounded-full ${corArea[p.area]}`} />
            {p.area}
          </span>
          <span className="tabular">{p.ano}</span>
        </div>
        <h3 className="display text-[1.4rem] font-extrabold leading-[1.1]">{p.titulo}</h3>
        <p className="text-[0.95rem] text-muted">{p.subtitulo}</p>
      </header>

      <Galeria titulo={p.titulo} telas={p.telas} />

      <p className="text-[0.97rem]">{p.resumo}</p>

      {p.numeros && (
        <div className="grid grid-cols-3 rounded-xl border border-line">
          {p.numeros.map((n, i) => (
            <div key={n.rotulo} className={`flex min-w-0 flex-col gap-1 px-3 py-3 ${i > 0 ? 'border-l border-line' : ''}`}>
              <span className="tabular display text-[1.2rem] font-extrabold leading-none text-accent-ink">{n.valor}</span>
              <span className="text-[0.75rem] leading-snug text-muted">{n.rotulo}</span>
            </div>
          ))}
        </div>
      )}

      <ul className="flex flex-col gap-1.5 text-[0.92rem]">
        {p.pontos.map((t) => (
          <li key={t} className="flex gap-2.5">
            <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
        {p.tags.map((t) => (
          <li key={t} className="rounded-md bg-sunken px-2 py-0.5 font-mono text-[0.75rem] text-muted">
            {t}
          </li>
        ))}
      </ul>
      {p.nota && <p className="text-[0.78rem] leading-snug text-muted">{p.nota}</p>}
    </article>
  )
}

export function ProjetosPessoais() {
  return (
    <Secao id="projetos" rotulo={`Projetos pessoais · ${projetosPessoais.length}`} titulo="Por conta própria">
      <p className="-mt-2 max-w-[38ch] text-[0.97rem] text-muted">
        Feitos fora das bolsas, para aprender e testar ideias de Digital Oilfield. Toque numa tela para ampliar.
      </p>
      <div className="flex flex-col gap-5">
        {projetosPessoais.map((p) => (
          <Cartao key={p.id} p={p} />
        ))}
      </div>
    </Secao>
  )
}
