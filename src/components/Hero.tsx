import { ChevronRight, UserPlus } from 'lucide-react'
import foto from '../assets/foto.webp'
import { destaques, perfil } from '../data'
import { vcardUrl } from '../lib/contato'
import { abrirGaveta } from './Navegacao'

// Retrato 4:5 com marcas de canto, como uma figura numa folha técnica
function Retrato() {
  return (
    <div className="relative w-37 shrink-0">
      {['left-[-7px] top-[-7px] border-l border-t', 'right-[-7px] top-[-7px] border-r border-t', 'bottom-[-7px] left-[-7px] border-b border-l', 'bottom-[-7px] right-[-7px] border-b border-r'].map((c) => (
        <span key={c} aria-hidden className={`absolute size-3 border-accent ${c}`} />
      ))}
      <img
        src={foto}
        alt={`Foto de ${perfil.nome}`}
        width={148}
        height={185}
        className="block aspect-4/5 w-full rounded-[10px] bg-sunken object-cover shadow-[0_14px_28px_-18px_rgba(0,0,0,.6)]"
      />
    </div>
  )
}

// Esquema simplificado de revestimentos (telescópico), com profundidade em km.
const colunas = [
  { meia: 26, base: 18 },
  { meia: 20, base: 44 },
  { meia: 14, base: 74 },
  { meia: 9, base: 100 },
]
function EsquemaPoco() {
  const altura = 185
  const y = (p: number) => 8 + (p / 100) * (altura - 16)
  return (
    <svg viewBox={`0 0 88 ${altura}`} width="88" height={altura} aria-hidden className="shrink-0 overflow-visible">
      {[0, 1, 2, 3].map((km) => (
        <g key={km}>
          <line x1="0" x2="6" y1={y((km / 3) * 100)} y2={y((km / 3) * 100)} stroke="var(--steel)" strokeWidth="1" />
          <text x="0" y={y((km / 3) * 100) - 3} fill="var(--muted)" fontSize="9" fontFamily="var(--font-mono)">
            {km === 0 ? '0' : `${km} km`}
          </text>
        </g>
      ))}
      <line x1="3" x2="3" y1={y(0)} y2={y(100)} stroke="var(--line)" strokeWidth="1" />
      <rect className="lama" x={58 - 5} y={y(0)} width="10" height={y(100) - y(0)} fill="var(--accent)" opacity="0.18" />
      {colunas.map((c, i) => (
        <g key={i} stroke="var(--ink)" strokeWidth="1.5" fill="var(--ink)" style={{ ['--i' as string]: i }}>
          <line className="traco" pathLength={1} x1={58 - c.meia} x2={58 - c.meia} y1={y(0)} y2={y(c.base)} />
          <line className="traco" pathLength={1} x1={58 + c.meia} x2={58 + c.meia} y1={y(0)} y2={y(c.base)} />
          <path className="sapata" d={`M${58 - c.meia} ${y(c.base)} l-4 0 l4 -5 z`} stroke="none" />
          <path className="sapata" d={`M${58 + c.meia} ${y(c.base)} l4 0 l-4 -5 z`} stroke="none" />
        </g>
      ))}
      <line className="coluna" pathLength={1} x1="58" x2="58" y1={y(0)} y2={y(100) - 4} stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <circle className="broca" cx="58" cy={y(100) - 2} r="4" fill="var(--accent)" />
      <circle className="pulso" cx="58" cy={y(100) - 2} r="4" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  )
}

export function Hero() {
  return (
    <header id="inicio" className="gutter flex flex-col gap-7 pb-10 pt-5">
      <div className="entra flex items-center justify-between gap-3 border-b border-line pb-2.5 font-mono text-[0.72rem] text-muted" style={{ ['--i' as string]: 0 }}>
        <span>Portfólio · {perfil.atualizado}</span>
        <span>{perfil.cidade}</span>
      </div>
      <div className="flex items-end justify-between gap-4 pt-1.5">
        <div className="entra paralaxe-lenta" style={{ ['--i' as string]: 1 }}>
          <Retrato />
        </div>
        <div className="entra" style={{ ['--i' as string]: 1 }}>
          <div className="paralaxe-rapida">
            <EsquemaPoco />
          </div>
        </div>
      </div>

      <div className="entra flex flex-col gap-2" style={{ ['--i' as string]: 2 }}>
        <h1 className="display text-[3.6rem] leading-[0.9]">
          Thiago <em className="text-accent-ink">Yeshua</em>
        </h1>
        <p className="font-mono text-[0.78rem] text-muted">{perfil.nomeCompleto}</p>
        <p className="text-balance text-[0.92rem] leading-snug text-muted">{perfil.curso}</p>
      </div>

      <p className="justo entra text-[1.06rem] leading-relaxed" style={{ ['--i' as string]: 2 }}>{perfil.chamada}</p>

      <ul className="entra flex flex-col gap-2 text-[0.95rem]" style={{ ['--i' as string]: 3 }}>
        {perfil.vinculos.map((v) => (
          <li key={v} className="flex gap-2.5">
            <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent" />
            <span>{v}</span>
          </li>
        ))}
      </ul>

      <div className="entra flex flex-col gap-2" style={{ ['--i' as string]: 4 }}>
        <p className="mb-1 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm">
          <span aria-hidden className="size-2 rounded-full bg-good" />
          {perfil.disponibilidade}
        </p>
        <a
          id="cta-contato"
          href={vcardUrl}
          download
          className="ripple relative flex min-h-13 items-center justify-center gap-2 overflow-hidden rounded-xl bg-accent px-4 text-[1.02rem] font-semibold text-on-accent transition active:scale-[0.98]"
        >
          <UserPlus aria-hidden size={20} />
          Salvar meu contato
        </a>
        <button
          type="button"
          onClick={abrirGaveta}
          className="group flex min-h-11 w-fit items-center gap-1 self-center text-[0.92rem] font-medium text-muted transition-colors hover:text-ink"
        >
          WhatsApp, e-mail, LinkedIn e Lattes
          <ChevronRight aria-hidden size={17} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <div className="entra grid grid-cols-3 border-y border-line" style={{ ['--i' as string]: 5 }}>
        {destaques.map((d, i) => (
          <div key={d.rotulo} className={`flex min-w-0 flex-col gap-0.5 py-4 ${i > 0 ? 'border-l border-line pl-3' : 'pr-3'}`}>
            <p className="display text-[1.35rem] leading-none text-accent-ink">{d.valor}</p>
            <p className="text-[0.85rem] font-medium leading-snug">{d.rotulo}</p>
            <p className="font-mono text-[0.72rem] leading-snug text-muted">{d.detalhe}</p>
          </div>
        ))}
      </div>
    </header>
  )
}
