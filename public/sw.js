// Guarda o portfólio no celular para abrir mesmo com o Wi-Fi do congresso ruim ou sem rede.
// - Página: tenta a rede por até 3 s; se não vier, usa a cópia guardada.
// - Arquivos com hash (assets/): guardados de vez, porque o nome muda a cada versão.
// - Demais arquivos (contato .vcf, ícone, imagem de prévia): usa a cópia e atualiza por trás.
// Para forçar a limpeza de tudo, troque a versão abaixo.
const CACHE = 'portfolio-v1'
const PAGINA = './'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([PAGINA, './thiago-yeshua.vcf', './favicon.svg'])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

// A primeira visita carrega os arquivos antes do service worker existir;
// a página manda a lista do que já baixou para guardar também.
self.addEventListener('message', (e) => {
  if (e.data?.tipo !== 'guardar' || !Array.isArray(e.data.urls)) return
  const urls = e.data.urls.filter((u) => typeof u === 'string' && new URL(u).origin === self.location.origin)
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(urls.map((u) => c.add(u).catch(() => {})))))
})

const guardar = (req, res) => {
  if (res.ok) {
    const copia = res.clone()
    caches.open(CACHE).then((c) => c.put(req, copia))
  }
  return res
}

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    const rede = fetch(req).then((res) => guardar(PAGINA, res))
    const limite = new Promise((ok) => setTimeout(ok, 3000)).then(() => caches.match(PAGINA))
    e.respondWith(
      Promise.race([rede, limite])
        .then((res) => res || rede)
        .catch(() => caches.match(PAGINA)),
    )
    return
  }

  if (new URL(req.url).pathname.includes('/assets/')) {
    e.respondWith(caches.match(req).then((achou) => achou || fetch(req).then((res) => guardar(req, res))))
    return
  }

  const rede = fetch(req).then((res) => guardar(req, res))
  e.respondWith(caches.match(req).then((achou) => achou || rede))
  e.waitUntil(rede.catch(() => {}))
})
