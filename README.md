# Portfólio · Thiago Yeshua

Página de uma coluna, feita para ser aberta no celular pelo QR code.
React + TypeScript + Vite + Tailwind CSS v4. Fontes self-hosted (funciona mesmo com Wi-Fi ruim de congresso).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ para publicar
```

## Editar o conteúdo

Todo o texto está em `src/data.ts` (perfil, projetos, trajetória, produção, competências).
Os componentes só leem esse arquivo.

- **Foto:** `src/assets/foto.webp` (topo da página) e `src/assets/foto-p.webp` (cabeçalho e barra lateral). A mesma foto vai dentro do contato salvo (`public/thiago-yeshua.vcf`).
- **Projetos pessoais e telas:** os textos ficam em `projetosPessoais` (`src/data.ts`); as telas, em `src/assets/prints/` (`nome.webp` para tela cheia e `nome-p.webp` para a miniatura).
- **Contato salvo no celular:** `public/thiago-yeshua.vcf`. Se mudar telefone/e-mail, atualize ali também.
- **Prévia de link (WhatsApp/LinkedIn):** em `index.html`, troque `SEU-DOMINIO` pela URL final.

## Publicar (Vercel)

1. Suba a pasta para um repositório no GitHub.
2. Na Vercel: *Add New → Project*, escolha o repositório. Framework: Vite. Build: `npm run build`, saída: `dist`.
3. O `vercel.json` já serve o `.vcf` com o tipo certo para abrir "Adicionar contato" no iPhone e no Android.
4. Gere o QR code com a URL final (de preferência um domínio curto) e teste em dois celulares antes de imprimir.

## Estrutura

```
src/
  data.ts                 conteúdo
  index.css               cores (claro/escuro) e tipografia
  components/
    Hero.tsx              topo, botões de contato, destaques
    Navegacao.tsx         menu fixo + barra "Salvar contato" flutuante
    Projetos.tsx          pesquisa e bolsas (com demonstrações)
    ProjetosPessoais.tsx  projetos pessoais com telas
    Galeria.tsx           faixa de telas e visor em tela cheia
    DemoPoco.tsx          cálculo didático: volume anular, bottoms-up, hidrostática
    DemoGeoquimica.tsx    faixas de Peters & Cassa (1994) para COT, S2 e IH
    Trajetoria.tsx
    Producao.tsx          produção + competências
    Contato.tsx           contato + rodapé com seletor de tema
```
