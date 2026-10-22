import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { projetos, type Projeto } from '../data'
import { DemoGeoquimica } from './DemoGeoquimica'
import { DemoPoco } from './DemoPoco'
import { Secao } from './ui'

const corStatus: Record<Projeto['status'], string> = {
  'Em andamento': 'bg-accent',
  Concluído: 'bg-good',
  Registrado: 'bg-good',
  'Em preparação': 'bg-steel',
}

function Meta({ p }: { p: Projeto }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.75rem] text-muted">
      <span className="inline-flex items-center gap-1.5 text-ink">
        <span aria-hidden className={`size-2 rounded-full ${corStatus[p.status]}`} />
        {p.status}
      </span>
      <span>{p.periodo}</span>
    </div>
  )
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
      {tags.map((t) => (
        <li key={t} className="rounded-md bg-sunken px-2 py-0.5 font-mono text-[0.75rem] text-muted">
          {t}
        </li>
      ))}
    </ul>
  )
}

const TITULO_DEMO = {
  poco: 'Calcular volume anular e bottoms-up',
  geoquimica: 'Classificar uma rocha geradora',
}

function CartaoDemo({ p }: { p: Projeto }) {
  const [aberto, setAberto] = useState(false)
  const painel = `demo-${p.id}`
  return (
    <article className="revela overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-col gap-3 p-5">
        <Meta p={p} />
        <h3 className="text-[1.15rem] font-semibold leading-snug">{p.titulo}</h3>
        <p className="text-[0.9rem] text-muted">{p.papel}</p>
        <p className="text-[0.97rem]">{p.resumo}</p>
        {p.extra && <p className="font-mono text-[0.78rem] text-accent-ink">{p.extra}</p>}
        <Tags tags={p.tags} />
      </div>
      {p.demo && (
        <>
          <button
            type="button"
            aria-expanded={aberto}
            aria-controls={painel}
            onClick={() => setAberto((v) => !v)}
            className="flex min-h-13 w-full items-center justify-between gap-3 border-t border-line bg-sunken px-5 text-left text-[0.95rem] font-semibold"
          >
            <span>
              <span className="label mr-2 text-accent-ink">Teste</span>
              {TITULO_DEMO[p.demo]}
            </span>
            <ChevronDown aria-hidden size={20} className={`shrink-0 transition-transform duration-300 ${aberto ? 'rotate-180' : ''}`} />
          </button>
          <div id={painel} className="sanfona bg-sunken" data-aberta={aberto} inert={!aberto}>
            <div className="min-h-0">
              <div className="border-t border-line px-5 pb-6 pt-5">{p.demo === 'poco' ? <DemoPoco /> : <DemoGeoquimica />}</div>
            </div>
          </div>
        </>
      )}
    </article>
  )
}

export function Projetos() {
  const comDemo = projetos.filter((p) => p.demo)
  const outros = projetos.filter((p) => !p.demo)
  return (
    <Secao id="pesquisa" rotulo={`Pesquisa e bolsas · ${projetos.length}`} titulo="Na universidade">
      <p className="-mt-2 max-w-[38ch] text-[0.97rem] text-muted">Trabalhos de iniciação científica e produtos de pesquisa na UFPA.</p>
      <div className="flex flex-col gap-4">
        {comDemo.map((p) => (
          <CartaoDemo key={p.id} p={p} />
        ))}
      </div>
      <ul className="flex flex-col">
        {outros.map((p) => (
          <li key={p.id} className="revela flex flex-col gap-2.5 border-t border-line py-5 last:border-b">
            <Meta p={p} />
            <h3 className="text-[1.08rem] font-semibold leading-snug">{p.titulo}</h3>
            <p className="text-[0.9rem] text-muted">{p.papel}</p>
            <p className="text-[0.95rem]">{p.resumo}</p>
            <Tags tags={p.tags} />
          </li>
        ))}
      </ul>
    </Secao>
  )
}
