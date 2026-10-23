import { useState } from 'react'
import { fmt } from '../lib/contato'

// Peters & Cassa (1994), AAPG Memoir 60: faixas de potencial gerador.
const CLASSES = ['Pobre', 'Regular', 'Bom', 'Muito bom', 'Excelente']
const LIMITES_COT = [0.5, 1, 2, 4]
const LIMITES_S2 = [2.5, 5, 10, 20]

function classe(valor: number, limites: number[]) {
  const i = limites.findIndex((l) => valor < l)
  return i === -1 ? limites.length : i
}

function tipoQuerogenio(hi: number) {
  if (hi > 600) return 'Tipo I · gera óleo'
  if (hi >= 300) return 'Tipo II · gera óleo'
  if (hi >= 200) return 'Tipo II/III · óleo e gás'
  if (hi >= 50) return 'Tipo III · gera gás'
  return 'Tipo IV · inerte'
}

function Escala({ id, rotulo, unidade, valor, max, passo, limites, casas, onChange }: {
  id: string
  rotulo: string
  unidade: string
  valor: number
  max: number
  passo: number
  limites: number[]
  casas: number
  onChange: (v: number) => void
}) {
  const c = classe(valor, limites)
  const bordas = [0, ...limites, max]
  const pos = ((c + Math.min(1, (valor - bordas[c]) / (bordas[c + 1] - bordas[c]))) / 5) * 100
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[0.9rem] text-muted">
          {rotulo}
        </label>
        <output htmlFor={id} className="tabular font-mono text-[0.9rem] font-medium">
          {fmt(valor, casas)} {unidade}
        </output>
      </div>
      <input id={id} type="range" min={0} max={max} step={passo} value={valor} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="relative">
        <div className="grid h-2.5 grid-cols-5 gap-0.5 overflow-hidden rounded-full">
          {CLASSES.map((nome, i) => (
            <span key={nome} className={i <= c ? 'bg-accent' : 'bg-line'} style={{ opacity: i <= c ? 0.35 + (i / 4) * 0.65 : 1 }} />
          ))}
        </div>
        <span aria-hidden className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-ink" style={{ left: `${pos}%` }} />
      </div>
      <div className="grid grid-cols-5 font-mono text-[0.7rem] text-muted">
        {limites.map((l, i) => (
          <span key={l} className="col-span-1 text-right" style={{ gridColumnStart: i + 1 }}>
            {fmt(l, l % 1 ? 1 : 0)}
          </span>
        ))}
      </div>
      <p className="text-[0.95rem]">
        Potencial <strong className="font-semibold text-accent-ink">{CLASSES[c].toLowerCase()}</strong>
      </p>
    </div>
  )
}

export function DemoGeoquimica() {
  const [cot, setCot] = useState(2.8)
  const [s2, setS2] = useState(9)
  const hi = cot > 0 ? (s2 / cot) * 100 : 0

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[0.9rem] text-muted">Mova os controles para classificar uma rocha com valores de exemplo.</p>
      <Escala id="geo-cot" rotulo="COT" unidade="% em peso" valor={cot} max={8} passo={0.1} casas={1} limites={LIMITES_COT} onChange={setCot} />
      <Escala id="geo-s2" rotulo="S2 (Rock-Eval)" unidade="mg HC/g rocha" valor={s2} max={30} passo={0.5} casas={1} limites={LIMITES_S2} onChange={setS2} />
      <div className="flex items-baseline justify-between gap-3 border-t border-line pt-4">
        <div className="flex flex-col">
          <span className="text-[0.78rem] text-muted">Índice de hidrogênio</span>
          <span className="tabular font-mono text-[1.05rem] font-medium">
            {fmt(hi)} <span className="text-[0.78rem] text-muted">mg HC/g COT</span>
          </span>
        </div>
        <span className="text-right text-[0.95rem] font-medium">{tipoQuerogenio(hi)}</span>
      </div>
      <p className="text-[0.8rem] leading-relaxed text-muted">
        Faixas de Peters &amp; Cassa (1994), válidas para amostras termicamente imaturas. O SIGMA vai além dessas faixas fixas e usa aprendizado de
        máquina para estimar potencial e maturidade.
      </p>
    </div>
  )
}
