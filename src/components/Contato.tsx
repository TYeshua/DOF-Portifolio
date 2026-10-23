import { Mail, MessageCircle, UserPlus } from 'lucide-react'
import { objetivo, perfil } from '../data'
import { mailtoUrl, vcardUrl, whatsappUrl } from '../lib/contato'
import { BotaoCompartilhar, BotaoCopiar } from './ui'

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-t py-2" style={{ borderColor: 'color-mix(in oklab, var(--on-panel) 22%, transparent)' }}>
      <div className="flex min-w-0 flex-col">
        <span className="text-[0.78rem] opacity-70">{rotulo}</span>
        <span className="select-all break-all font-mono text-[0.92rem]">{valor}</span>
      </div>
      <BotaoCopiar texto={valor} rotulo={rotulo} />
    </div>
  )
}

export function Contato() {
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="gutter py-12">
      <div className="flex flex-col gap-5 rounded-3xl border bg-panel p-6 text-on-panel"
        style={{ borderColor: 'var(--panel-line)' }}>
        <h2 id="contato-titulo" className="display text-[2.15rem] leading-tight">
          Vamos conversar
        </h2>
        <p className="justo text-[0.98rem] leading-relaxed opacity-85">{objetivo}</p>
        <div className="flex flex-col">
          <Linha rotulo="E-mail" valor={perfil.email} />
          <Linha rotulo="Telefone e WhatsApp" valor={perfil.telefone} />
        </div>
        <div className="flex flex-col gap-3">
          <a
            href={vcardUrl}
            download
            className="flex min-h-13 items-center justify-center gap-2 rounded-xl bg-accent px-4 font-semibold text-on-accent"
          >
            <UserPlus aria-hidden size={20} />
            Salvar meu contato
          </a>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: whatsappUrl, rotulo: 'WhatsApp', Icone: MessageCircle, externo: true },
              { href: mailtoUrl, rotulo: 'E-mail', Icone: Mail, externo: false },
            ].map(({ href, rotulo, Icone, externo }) => (
              <a
                key={rotulo}
                href={href}
                {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border font-medium"
                style={{ borderColor: 'color-mix(in oklab, var(--on-panel) 35%, transparent)' }}
              >
                <Icone aria-hidden size={18} />
                {rotulo}
              </a>
            ))}
          </div>
        </div>
        <p className="text-[0.85rem] opacity-70">{perfil.cidade} · Brasil</p>
      </div>
    </section>
  )
}

export function Rodape() {
  return (
    <footer className="gutter flex flex-col items-center gap-4 pb-28 pt-2 text-[0.82rem] text-muted">
      <BotaoCompartilhar className="w-full bg-surface text-ink" />
      <p className="text-center">
        {perfil.nomeCompleto} · atualizado em {perfil.atualizado}
      </p>
    </footer>
  )
}
