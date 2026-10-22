import { perfil } from '../data'

export const whatsappUrl = `https://wa.me/${perfil.telefoneE164.replace('+', '')}?text=${encodeURIComponent(perfil.whatsappMsg)}`
export const mailtoUrl = `mailto:${perfil.email}?subject=${encodeURIComponent('Contato pelo portfólio')}`
// Arquivo estático em public/. Celulares abrem direto na tela "Adicionar contato".
export const vcardUrl = 'thiago-yeshua.vcf'

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
