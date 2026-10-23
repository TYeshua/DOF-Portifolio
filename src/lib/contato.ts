import { perfil } from '../data'

// Origem da visita: o QR code impresso aponta para ?origem=qr. Fica guardada na sessão
// e sai do endereço, para que um link repassado adiante não carregue a origem "qr".
function lerOrigem(): string | null {
  try {
    const url = new URL(location.href)
    const p = url.searchParams.get('origem')
    if (p) {
      sessionStorage.setItem('origem', p)
      url.searchParams.delete('origem')
      history.replaceState(history.state, '', url)
    }
    return p ?? sessionStorage.getItem('origem')
  } catch {
    return null
  }
}
export const veioDoQr = typeof window !== 'undefined' && lerOrigem() === 'qr'

export const whatsappUrl = `https://wa.me/${perfil.telefoneE164.replace('+', '')}?text=${encodeURIComponent(veioDoQr ? perfil.whatsappMsgQr : perfil.whatsappMsg)}`
export const mailtoUrl = `mailto:${perfil.email}?subject=${encodeURIComponent('Contato pelo portfólio')}`
// Arquivo estático em public/. Celulares abrem direto na tela "Adicionar contato".
export const vcardUrl = 'thiago-yeshua.vcf'

// Endereço oficial do portfólio, sem parâmetros (para compartilhar)
export const urlPortfolio = () => document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? location.href.split(/[?#]/)[0]

export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = texto
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

export const fmt = (n: number, casas = 0) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
