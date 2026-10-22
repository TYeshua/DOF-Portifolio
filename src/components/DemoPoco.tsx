import { useState } from 'react'
import { fmt } from '../lib/contato'

const FASES = [
  { id: '8.5', d: 8.5, rotulo: '8½ in' },
  { id: '12.25', d: 12.25, rotulo: '12¼ in' },
  { id: '17.5', d: 17.5, rotulo: '17½ in' },
]
const OD_TUBO = 5 // in, drill pipe 5 in
const ID_TUBO = 4.276 // in, 19,5 lb/ft
const M_PARA_FT = 3.28084

function Deslizador(props: {
  id: string
  rotulo: string
  valor: number
  unidade: string
  casas?: number
  min: number
  max: number
  passo: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={props.id} className="text-[0.9rem] text-muted">
          {props.rotulo}
        </label>
        <output htmlFor={props.id} className="tabular font-mono text-[0.9rem] font-medium">
          {fmt(props.valor, props.casas ?? 0)} {props.unidade}
        </output>
      </div>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.passo}
        value={props.valor}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  )
}

function Corte({ dPoco }: { dPoco: number }) {
  const escala = 52 / 17.5
  const rPoco = (dPoco / 2) * escala * 2
  const rOd = (OD_TUBO / 2) * escala * 2
  const rId = (ID_TUBO / 2) * escala * 2
  return (
    <svg viewBox="0 0 120 120" className="size-[120px] shrink-0" role="img" aria-label={`Seção transversal: poço de ${dPoco} polegadas com tubo de 5 polegadas`}>
      <rect x="0" y="0" width="120" height="120" rx="10" fill="var(--sunken)" />
      <circle cx="60" cy="60" r={rPoco} fill="var(--accent)" fillOpacity="0.28" stroke="var(--ink)" strokeWidth="1.2" strokeDasharray="3 2" />
      <circle cx="60" cy="60" r={rOd} fill="var(--steel)" />
      <circle cx="60" cy="60" r={rId} fill="var(--accent)" fillOpacity="0.14" />
      <circle cx="60" cy="60" r={rId} fill="var(--surface)" fillOpacity="0.6" />
    </svg>
  )
}

function Saida({ rotulo, valor, unidade, sub }: { rotulo: string; valor: string; unidade: string; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-[0.78rem] leading-tight text-muted">{rotulo}</span>
      <span className="tabular font-mono text-[1.05rem] font-medium leading-snug">
        {valor} <span className="text-[0.78rem] text-muted">{unidade}</span>
      </span>
      {sub && <span className="tabular font-mono text-[0.72rem] text-muted">{sub}</span>}
    </div>
  )
}

export function DemoPoco() {
  const [fase, setFase] = useState('12.25')
  const [prof, setProf] = useState(3000)
  const [vazao, setVazao] = useState(600)
  const [peso, setPeso] = useState(10)

  const dPoco = FASES.find((f) => f.id === fase)!.d
  const pes = prof * M_PARA_FT
  const area = dPoco ** 2 - OD_TUBO ** 2
  const capAnular = area / 1029.4 // bbl/ft
  const volAnular = capAnular * pes // bbl
  const bblMin = vazao / 42
  const bottomsUp = volAnular / bblMin // min
  const velAnular = (24.5 * vazao) / area // ft/min
  const hidro = 0.052 * peso * pes // psi

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Corte dPoco={dPoco} />
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3">
          <Saida rotulo="Volume anular" valor={fmt(volAnular)} unidade="bbl" sub={`${fmt(volAnular * 0.158987, 0)} m³`} />
          <Saida rotulo="Tempo de bottoms-up" valor={fmt(bottomsUp)} unidade="min" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
        <Saida rotulo="Velocidade anular" valor={fmt(velAnular)} unidade="ft/min" sub={`${fmt(velAnular / M_PARA_FT)} m/min`} />
        <Saida rotulo="Pressão hidrostática" valor={fmt(hidro)} unidade="psi" sub={`${fmt(hidro * 0.0689476)} bar`} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[0.9rem] text-muted">Diâmetro da fase (broca)</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {FASES.map((f) => (
            <label
              key={f.id}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border font-mono text-[0.9rem] transition ${
                fase === f.id ? 'border-accent bg-accent text-on-accent' : 'border-line bg-surface'
              }`}
            >
              <input type="radio" name="fase" value={f.id} checked={fase === f.id} onChange={() => setFase(f.id)} className="sr-only" />
              {f.rotulo}
            </label>
          ))}
        </div>
      </fieldset>
      <Deslizador id="poco-prof" rotulo="Profundidade vertical" valor={prof} unidade="m" min={500} max={6000} passo={100} onChange={setProf} />
      <Deslizador id="poco-vazao" rotulo="Vazão da bomba" valor={vazao} unidade="gpm" min={200} max={1200} passo={10} onChange={setVazao} />
      <Deslizador id="poco-peso" rotulo="Peso do fluido" valor={peso} unidade="ppg" casas={1} min={8.6} max={16} passo={0.1} onChange={setPeso} />

      <p className="text-[0.8rem] leading-relaxed text-muted">
        Poço vertical, sem arrombamento, tubo de 5 in. Fórmulas de campo: capacidade = (D² − d²) / 1029,4 bbl/ft; Ph = 0,052 × peso × TVD. É uma
        demonstração didática. Não usa o código nem os dados do projeto.
      </p>
    </div>
  )
}
