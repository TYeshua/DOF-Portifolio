import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { ArrowUpRight, Mail, Menu, MessageCircle, Moon, Phone, Sun, UserPlus, X } from 'lucide-react'
import { perfil } from '../data'
import fotoP from '../assets/foto-p.webp'
import { mailtoUrl, vcardUrl, whatsappUrl } from '../lib/contato'
import { definirTema, useTema } from '../lib/tema'
import { BotaoCompartilhar, BotaoCopiar } from './ui'

export const SECOES = [
  { id: 'pesquisa', rotulo: 'Pesquisa e bolsas' },
  { id: 'projetos', rotulo: 'Projetos pessoais' },
  { id: 'trajetoria', rotulo: 'Trajetória' },
  { id: 'producao', rotulo: 'Produção' },
  { id: 'contato', rotulo: 'Contato' },
]
const APELIDO: Record<string, string> = { competencias: 'producao' }

export const abrirGaveta = () => window.dispatchEvent(new Event('abrir-gaveta'))

function useSecaoAtiva() {
  const [ativa, setAtiva] = useState('')
  useEffect(() => {
    const ids = ['inicio', ...SECOES.map((s) => s.id), 'competencias']
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) setAtiva(APELIDO[e.target.id] ?? e.target.id)
        }),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])
  return ativa
}

type DocVT = Document & { startViewTransition?: (cb: () => void) => unknown }

function BotaoTema() {
  const tema = useTema()
  const proximo = tema === 'escuro' ? 'claro' : 'escuro'
  return (
    <button
      type="button"
      onClick={(e) => {
        const doc = document as DocVT
        const r = e.currentTarget.getBoundingClientRect()
        const raiz = document.documentElement
        raiz.style.setProperty('--tema-x', `${r.left + r.width / 2}px`)
        raiz.style.setProperty('--tema-y', `${r.top + r.height / 2}px`)
        if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          definirTema(proximo)
          return
        }
        raiz.classList.add('trocando-tema')
        const t = doc.startViewTransition(() => flushSync(() => definirTema(proximo))) as { finished: Promise<void> }
        t.finished.finally(() => raiz.classList.remove('trocando-tema'))
      }}
      aria-label={proximo === 'claro' ? 'Usar tema claro' : 'Usar tema escuro'}
      title={proximo === 'claro' ? 'Tema claro' : 'Tema escuro'}
      className="grid size-10 place-items-center rounded-full border border-line bg-surface/70 text-ink transition active:scale-95"
    >
      <span key={tema} className="giro grid place-items-center">
        {tema === 'escuro' ? <Sun size={18} /> : <Moon size={18} />}
      </span>
    </button>
  )
}

export function Navegacao() {
  const [rolou, setRolou] = useState(false)
  const [aberta, setAberta] = useState(false)
  const barra = useRef<HTMLSpanElement>(null)
  const botaoMenu = useRef<HTMLButtonElement>(null)
  const ativa = useSecaoAtiva()

  useEffect(() => {
    let quadro = 0
    const atualizar = () => {
      quadro = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
      if (barra.current) barra.current.style.transform = `scaleX(${p})`
      setRolou(window.scrollY > 12)
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(atualizar)
    }
    const abrir = () => setAberta(true)
    atualizar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    window.addEventListener('resize', aoRolar)
    window.addEventListener('abrir-gaveta', abrir)
    return () => {
      window.removeEventListener('scroll', aoRolar)
      window.removeEventListener('resize', aoRolar)
      window.removeEventListener('abrir-gaveta', abrir)
    }
  }, [])

  const fechar = useCallback(() => {
    setAberta(false)
    botaoMenu.current?.focus({ preventScroll: true })
  }, [])

  return (
    <>
      <header
        className={`cabecalho sticky z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
          rolou ? 'border-line shadow-[0_6px_20px_-16px_rgba(0,0,0,.45)]' : 'border-transparent'
        }`}
        data-rolou={rolou}
        style={{ top: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="gutter flex h-14 items-center justify-between gap-3">
          <a href="#inicio" className="flex min-w-0 items-center gap-2.5" aria-label={`${perfil.nome}, voltar ao início`}>
            <img src={fotoP} alt="" width={34} height={34} className="size-[34px] shrink-0 rounded-full border border-line object-cover" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="display truncate text-[0.98rem]">{perfil.nome}</span>
              <span className="truncate font-mono text-[0.68rem] text-muted">Petróleo · UFPA</span>
            </span>
          </a>
          <div className="flex shrink-0 items-center gap-2">
            <BotaoTema />
            <button
              ref={botaoMenu}
              type="button"
              onClick={() => setAberta(true)}
              aria-expanded={aberta}
              aria-controls="gaveta"
              className="ripple flex h-10 items-center gap-2 rounded-full bg-ink pl-3.5 pr-4 text-[0.85rem] font-semibold text-bg transition active:scale-95"
            >
              <Menu aria-hidden size={17} />
              Contato
            </button>
          </div>
        </div>
        <span ref={barra} aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
      </header>
      {createPortal(<Gaveta aberta={aberta} ativa={ativa} aoFechar={fechar} />, document.body)}
    </>
  )
}

function LinhaContato({ Icone, rotulo, valor, href, externo }: { Icone: typeof Mail; rotulo: string; valor: string; href: string; externo?: boolean }) {
  return (
    <li className="flex items-center gap-3 border-t border-line py-2.5">
      <a
        href={href}
        {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sunken text-accent-ink">
          <Icone aria-hidden size={17} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-[0.75rem] text-muted">{rotulo}</span>
          <span className="truncate font-mono text-[0.86rem]">{valor}</span>
        </span>
      </a>
      <BotaoCopiar texto={valor} rotulo={rotulo} />
    </li>
  )
}

function Gaveta({ aberta, ativa, aoFechar }: { aberta: boolean; ativa: string; aoFechar: () => void }) {
  const fecharRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberta) return
    const corpo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    fecharRef.current?.focus({ preventScroll: true })
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', tecla)
    return () => {
      document.body.style.overflow = corpo
      window.removeEventListener('keydown', tecla)
    }
  }, [aberta, aoFechar])

  const links = [
    { rotulo: 'LinkedIn', href: perfil.links.linkedin, detalhe: 'linkedin.com/in/thiagoyeshua' },
    { rotulo: 'Currículo Lattes', href: perfil.links.lattes, detalhe: 'lattes.cnpq.br/7788480032641561' },
    { rotulo: 'ORCID', href: perfil.links.orcid, detalhe: '0009-0005-4137-7052' },
  ]

  return (
    <div className="gaveta fixed inset-0 z-[55]" data-aberta={aberta} inert={!aberta} aria-hidden={!aberta}>
      <button type="button" tabIndex={-1} aria-label="Fechar" onClick={aoFechar} className="gaveta-fundo absolute inset-0 bg-panel/45 backdrop-blur-[2px]" />
      <aside
        id="gaveta"
        role="dialog"
        aria-modal="true"
        aria-label="Contato e navegação"
        className="gaveta-painel absolute inset-y-0 right-0 flex w-[min(88vw,360px)] flex-col overflow-y-auto border-l border-line bg-bg shadow-[-20px_0_40px_-24px_rgba(0,0,0,.5)]"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
          paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
          paddingLeft: 20,
        }}
      >
        <div className="g-item flex items-start justify-between gap-3" style={{ ['--i' as string]: 0 }}>
          <div className="flex min-w-0 items-center gap-3">
            <img src={fotoP} alt={`Foto de ${perfil.nome}`} width={56} height={56} className="size-14 shrink-0 rounded-full border border-line object-cover" />
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="display text-[1.1rem]">{perfil.nome}</span>
              <span className="text-[0.82rem] text-muted">Eng. de Exploração e Produção de Petróleo · UFPA</span>
            </div>
          </div>
          <button ref={fecharRef} type="button" onClick={aoFechar} aria-label="Fechar" className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-surface">
            <X size={18} />
          </button>
        </div>

        <p className="g-item mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.82rem]" style={{ ['--i' as string]: 1 }}>
          <span aria-hidden className="size-2 rounded-full bg-good" />
          {perfil.disponibilidade}
        </p>

        <a
          href={vcardUrl}
          download
          className="g-item mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-on-accent active:scale-[0.98]"
          style={{ ['--i' as string]: 2 }}
        >
          <UserPlus aria-hidden size={19} />
          Salvar meu contato
        </a>

        <ul className="g-item mt-4" style={{ ['--i' as string]: 3 }}>
          <LinhaContato Icone={MessageCircle} rotulo="WhatsApp" valor={perfil.telefone} href={whatsappUrl} externo />
          <LinhaContato Icone={Mail} rotulo="E-mail" valor={perfil.email} href={mailtoUrl} />
          <LinhaContato Icone={Phone} rotulo="Telefone" valor={perfil.telefone} href={`tel:${perfil.telefoneE164}`} />
        </ul>

        <ul className="g-item border-b border-line" style={{ ['--i' as string]: 4 }}>
          {links.map((l) => (
            <li key={l.rotulo} className="border-t border-line">
              <a href={l.href} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between gap-3 py-2">
                <span className="flex min-w-0 flex-col">
                  <span className="text-[0.92rem] font-medium">{l.rotulo}</span>
                  <span className="truncate font-mono text-[0.72rem] text-muted">{l.detalhe}</span>
                </span>
                <ArrowUpRight aria-hidden size={17} className="shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>

        <BotaoCompartilhar className="g-item mt-4 bg-surface" />

        <nav aria-label="Seções" className="g-item mt-6" style={{ ['--i' as string]: 5 }}>
          <p className="label mb-2 text-muted">Nesta página</p>
          <ul className="flex flex-col">
            {SECOES.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={aoFechar}
                  aria-current={ativa === s.id ? 'true' : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-lg px-2 text-[0.95rem] transition-colors ${
                    ativa === s.id ? 'bg-surface font-semibold text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span aria-hidden className={`h-4 w-[3px] rounded-full transition-colors ${ativa === s.id ? 'bg-accent' : 'bg-line'}`} />
                  {s.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="g-item mt-auto pt-6 font-mono text-[0.72rem] text-muted" style={{ ['--i' as string]: 6 }}>
          {perfil.cidade} · Brasil
        </p>
      </aside>
    </div>
  )
}

// Aparece depois que os botões do topo saem da tela e some na seção de contato.
// Enquanto a pessoa rola para baixo (lendo), sai do caminho; volta ao rolar para cima.
export function BarraContato() {
  const [visivel, setVisivel] = useState(false)
  useEffect(() => {
    const cta = document.getElementById('cta-contato')
    const contato = document.getElementById('contato')
    if (!cta || !contato) return
    let ctaFora = false
    let contatoVisivel = false
    let descendo = false
    let ultimoY = window.scrollY
    const atualizar = () => setVisivel(ctaFora && !contatoVisivel && !descendo)
    const aoRolar = () => {
      const y = window.scrollY
      if (Math.abs(y - ultimoY) < 10) return
      descendo = y > ultimoY
      ultimoY = y
      atualizar()
    }
    window.addEventListener('scroll', aoRolar, { passive: true })
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (e.target === cta) ctaFora = !e.isIntersecting && e.boundingClientRect.top < 0
        if (e.target === contato) contatoVisivel = e.isIntersecting
      })
      atualizar()
    })
    obs.observe(cta)
    obs.observe(contato)
    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', aoRolar)
    }
  }, [])

  return (
    <div
      aria-hidden={!visivel}
      className={`fixed inset-x-0 z-40 flex justify-center transition-all duration-300 ${visivel ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
      style={{
        bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
      }}
    >
      <div className="flex w-full max-w-[408px] gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)]">
        <a
          href={vcardUrl}
          download
          tabIndex={visivel ? 0 : -1}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-accent font-semibold text-on-accent"
        >
          <UserPlus aria-hidden size={19} />
          Salvar contato
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={visivel ? 0 : -1}
          aria-label="Conversar no WhatsApp"
          className="grid min-h-12 w-14 place-items-center rounded-xl border border-line"
        >
          <MessageCircle aria-hidden size={20} />
        </a>
      </div>
    </div>
  )
}
