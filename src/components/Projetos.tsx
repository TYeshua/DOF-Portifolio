import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, FlaskConical, Info } from 'lucide-react'
import { projetos, type Demo, type Projeto } from '../data'
import { DemoGeoquimica } from './DemoGeoquimica'
import { DemoPoco } from './DemoPoco'
import { Folha } from './Folha'
import { Secao } from './ui'

const corStatus: Record<Projeto['status'], string> = {
  'Em andamento': 'bg-accent',
  Concluído: 'bg-good',
  Registrado: 'bg-good',
  'Em preparação': 'bg-steel',
}

const TITULO_DEMO: Record<Demo, string> = {
  poco: 'Calcular volume anular e bottoms-up',
  geoquimica: 'Classificar uma rocha geradora',
}

// Cartões empilhados: cada um fica preso no topo e o seguinte desliza por cima,
// enquanto o de baixo recua um pouco.
function usePilha(n: number) {
  const refs = useRef<(HTMLElement | null)[]>([])
  useEffect(() => {
    // Em tela baixa (ex.: iPhone SE), um cartão alto preso a 72px do topo teria o fim
    // coberto pelo próximo antes de ser lido. Nesse caso ele prende mais acima,
    // com a base visível, e só então o seguinte passa por cima.
    // clientHeight usa a altura menor da tela (com a barra do navegador visível), que não
    // muda enquanto a barra some e volta na rolagem; assim os cartões não pulam.
    const posicionar = () => {
      const livre = document.documentElement.clientHeight - 16
      refs.current.forEach((li, i) => {
        if (!li) return
        const topo = Math.min(72 + i * 12, livre - li.offsetHeight)
        li.style.top = `calc(env(safe-area-inset-top, 0px) + ${Math.round(topo)}px)`
      })
    }
    posicionar()
    window.addEventListener('resize', posicionar)
    document.fonts?.ready.then(posicionar)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => window.removeEventListener('resize', posicionar)
    let quadro = 0
    const atualizar = () => {
      quadro = 0
      for (let i = 0; i < n - 1; i++) {
        const a = refs.current[i]
        const b = refs.current[i + 1]
        if (!a || !b) continue
        const ra = a.getBoundingClientRect()
        const rb = b.getBoundingClientRect()
        const cobre = Math.min(1, Math.max(0, (ra.bottom - rb.top) / ra.height))
        a.style.setProperty('--cobre', cobre.toFixed(3))
      }
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar)
    }
    atualizar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    return () => {
      window.removeEventListener('resize', posicionar)
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
    }
  }, [n])
  return refs
}

export function Projetos() {
  const refs = usePilha(projetos.length)
  const [demo, setDemo] = useState<Demo | null>(null)
  const fechar = useCallback(() => setDemo(null), [])

  return (
    <Secao id="pesquisa" rotulo="Pesquisa e bolsas" nota={`${projetos.length} projetos`} titulo="Na universidade">
      <p className="justo revela -mt-1 text-[0.97rem] text-muted">Trabalhos de iniciação científica e produtos de pesquisa na UFPA.</p>
      <ol className="flex flex-col gap-5">
        {projetos.map((p, i) => (
          <li
            key={p.id}
            ref={(el) => {
              refs.current[i] = el
            }}
            className="pilha-item sticky"
            style={{ top: `calc(env(safe-area-inset-top, 0px) + ${72 + i * 12}px)`, zIndex: i + 1 }}
          >
            <article className="pilha-cartao relative flex flex-col gap-3 overflow-hidden rounded-[22px] border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3 font-mono text-[0.72rem] text-muted">
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <span aria-hidden className={`size-2 rounded-full ${corStatus[p.status]}`} />
                  {p.status}
                </span>
                <span className="tabular">{p.periodo}</span>
              </div>
              <h3 className="display text-[1.32rem] leading-[1.15]">{p.titulo}</h3>
              <p className="text-[0.88rem] text-muted">{p.papel}</p>
              <p className="justo text-[0.95rem] leading-relaxed">{p.resumo}</p>
              {p.extra && <p className="font-mono text-[0.75rem] text-accent-ink">{p.extra}</p>}
              <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
                {p.tags.map((t) => (
                  <li key={t} className="rounded-md bg-sunken px-2 py-0.5 font-mono text-[0.72rem] text-muted">
                    {t}
                  </li>
                ))}
              </ul>
              {p.demo && (
                <button
                  type="button"
                  onClick={() => setDemo(p.demo!)}
                  className="ripple group mt-1 flex min-h-14 items-center justify-between gap-3 rounded-xl bg-ink px-4 py-2.5 text-left text-bg transition active:scale-[0.98]"
                >
                  <span className="flex items-center gap-3">
                    <FlaskConical aria-hidden size={18} className="shrink-0 text-accent" />
                    <span className="flex flex-col">
                      <span className="text-[0.92rem] font-medium leading-snug">{TITULO_DEMO[p.demo]}</span>
                      <span className="text-[0.76rem] leading-snug opacity-70">Amostra simples · não é o produto final</span>
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden size={17} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              )}
              <span aria-hidden className="pilha-sombra pointer-events-none absolute inset-0 rounded-[22px] bg-panel" />
            </article>
          </li>
        ))}
      </ol>
      <Folha aberta={demo !== null} titulo={demo ? TITULO_DEMO[demo] : ''} aoFechar={fechar}>
        <p className="mb-5 flex gap-2.5 rounded-xl bg-sunken px-3.5 py-3 text-[0.85rem] leading-snug">
          <Info aria-hidden size={17} className="mt-px shrink-0 text-accent-ink" />
          <span className="justo">
            <strong className="font-semibold">Isto é só uma amostra.</strong> Um exemplo simplificado para mostrar a ideia do projeto, com cálculos
            básicos. Não é o produto final e não usa o código nem os dados da pesquisa.
          </span>
        </p>
        {demo === 'poco' && <DemoPoco />}
        {demo === 'geoquimica' && <DemoGeoquimica />}
      </Folha>
    </Secao>
  )
}
