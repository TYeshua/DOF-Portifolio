import * as THREE from 'three'

// Cena da abertura: gêmeo digital de um poço direcional.
// Camadas de rocha em malha, plataforma na superfície, coluna perfurando até o
// reservatório, sensores que emitem pulsos e dados subindo pelo poço.

const CREME = new THREE.Color('#f1ede6')
const LARANJA = new THREE.Color('#ff5500')
const FUNDO = 0x0b0b0c
const SUPERFICIE = 0.6

export type Cena = {
  progresso: number
  mergulhar: () => void
  destruir: () => void
}

function texturaBrilho() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.18, 'rgba(255,170,110,0.85)')
  r.addColorStop(0.45, 'rgba(255,85,0,0.25)')
  r.addColorStop(1, 'rgba(255,85,0,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 128, 128)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Malha ondulada de uma camada, com brilho caindo nas bordas.
function camada(y: number, cor: THREE.Color, intensidade: number, fase: number) {
  const n = 30
  const larg = 7.4
  const prof = 5.2
  const pos: number[] = []
  const cores: number[] = []
  const altura = (x: number, z: number) => y + 0.13 * Math.sin(x * 0.85 + fase) + 0.07 * Math.cos(z * 1.3 + fase * 1.7)
  const brilho = (x: number, z: number) => {
    const d = Math.sqrt((x / (larg / 2)) ** 2 + (z / (prof / 2)) ** 2)
    return Math.max(0, 1 - d) ** 1.4 * intensidade
  }
  const ponto = (x: number, z: number) => {
    pos.push(x, altura(x, z), z)
    const b = brilho(x, z)
    cores.push(cor.r * b, cor.g * b, cor.b * b)
  }
  for (let i = 0; i <= n; i++) {
    for (let j = 0; j < n; j++) {
      const x0 = -larg / 2 + (j / n) * larg
      const x1 = -larg / 2 + ((j + 1) / n) * larg
      const z = -prof / 2 + (i / n) * prof
      ponto(x0, z)
      ponto(x1, z)
      const zx = -prof / 2 + (j / n) * prof
      const zx1 = -prof / 2 + ((j + 1) / n) * prof
      const xz = -larg / 2 + (i / n) * larg
      ponto(xz, zx)
      ponto(xz, zx1)
    }
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cores, 3))
  const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })
  return new THREE.LineSegments(geo, mat)
}

function plataforma() {
  const g = new THREE.Group()
  const m = new THREE.LineBasicMaterial({ color: CREME, transparent: true, opacity: 0.75 })
  const linhas: number[] = []
  const seg = (a: number[], b: number[]) => linhas.push(...a, ...b)
  const d = 0.42
  const yDeck = SUPERFICIE + 0.42
  // pernas
  for (const [x, z] of [[-d, -d], [d, -d], [d, d], [-d, d]]) seg([x * 1.25, SUPERFICIE - 0.35, z * 1.25], [x, yDeck, z])
  // conveses
  for (const yy of [yDeck, yDeck - 0.18]) {
    seg([-d, yy, -d], [d, yy, -d]); seg([d, yy, -d], [d, yy, d]); seg([d, yy, d], [-d, yy, d]); seg([-d, yy, d], [-d, yy, -d])
  }
  // torre
  const topo = [0, yDeck + 0.95, 0]
  const b = 0.2
  for (const [x, z] of [[-b, -b], [b, -b], [b, b], [-b, b]]) seg([x, yDeck, z], topo)
  for (const f of [0.33, 0.66]) {
    const s = b * (1 - f)
    const yy = yDeck + 0.95 * f
    seg([-s, yy, -s], [s, yy, -s]); seg([s, yy, -s], [s, yy, s]); seg([s, yy, s], [-s, yy, s]); seg([-s, yy, s], [-s, yy, -s])
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(linhas, 3))
  g.add(new THREE.LineSegments(geo, m))
  return { grupo: g, topo: new THREE.Vector3(...topo) }
}

export function criarCena(canvas: HTMLCanvasElement): Cena {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(FUNDO, 1)
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(FUNDO, 10, 28)
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 60)
  const alvo = new THREE.Vector3(0.9, -1.75, 0.25)
  let retrato = false
  const brilhoTex = texturaBrilho()

  // Camadas de rocha (a última é o reservatório)
  const profundidades = [-0.75, -1.55, -2.35, -3.1]
  const camadas = profundidades.map((y, i) => camada(y, CREME, 0.22 - i * 0.025, i * 1.3))
  const reservatorio = camada(-3.85, LARANJA, 0.7, 5.2)
  ;[...camadas, reservatorio].forEach((c) => scene.add(c))

  // Superfície do mar em pontos
  const nx = 46
  const nz = 32
  const mar = new Float32Array(nx * nz * 3)
  const marCor = new Float32Array(nx * nz * 3)
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const k = (i * nz + j) * 3
      const x = -3.8 + (i / (nx - 1)) * 7.6
      const z = -2.7 + (j / (nz - 1)) * 5.4
      mar[k] = x
      mar[k + 2] = z
      const b = Math.max(0, 1 - Math.hypot(x / 3.8, z / 2.7)) ** 1.2 * 0.75
      marCor[k] = CREME.r * b
      marCor[k + 1] = CREME.g * b
      marCor[k + 2] = CREME.b * b
    }
  const marGeo = new THREE.BufferGeometry()
  marGeo.setAttribute('position', new THREE.BufferAttribute(mar, 3))
  marGeo.setAttribute('color', new THREE.BufferAttribute(marCor, 3))
  const marPts = new THREE.Points(marGeo, new THREE.PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
  scene.add(marPts)

  const { grupo: plat, topo } = plataforma()
  scene.add(plat)
  const farol = new THREE.Sprite(new THREE.SpriteMaterial({ map: brilhoTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
  farol.position.copy(topo).add(new THREE.Vector3(0, 0.05, 0))
  farol.scale.setScalar(0.35)
  scene.add(farol)

  // Trajetória do poço direcional
  const curva = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0, SUPERFICIE + 0.25, 0),
      new THREE.Vector3(0, -0.6, 0),
      new THREE.Vector3(0.03, -1.6, 0.02),
      new THREE.Vector3(0.3, -2.55, 0.12),
      new THREE.Vector3(0.95, -3.35, 0.35),
      new THREE.Vector3(1.85, -3.8, 0.62),
      new THREE.Vector3(2.9, -3.92, 0.85),
    ],
    false,
    'centripetal',
  )
  const SEG = 420
  const RAD = 8
  const tubo = new THREE.Mesh(new THREE.TubeGeometry(curva, SEG, 0.022, RAD, false), new THREE.MeshBasicMaterial({ color: LARANJA }))
  const halo = new THREE.Mesh(
    new THREE.TubeGeometry(curva, SEG, 0.075, RAD, false),
    new THREE.MeshBasicMaterial({ color: LARANJA, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  tubo.geometry.setDrawRange(0, 0)
  halo.geometry.setDrawRange(0, 0)
  scene.add(tubo, halo)

  // Trilha prevista (tracejada, fraca)
  const previsto = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(curva.getSpacedPoints(160)),
    new THREE.LineDashedMaterial({ color: CREME, dashSize: 0.05, gapSize: 0.06, transparent: true, opacity: 0.28 }),
  )
  previsto.computeLineDistances()
  scene.add(previsto)

  // Sapatas de revestimento
  const sapatas = [0.1, 0.24, 0.4].map((t, i) => {
    const anel = new THREE.Mesh(
      new THREE.TorusGeometry(0.24 - i * 0.05, 0.006, 6, 64),
      new THREE.MeshBasicMaterial({ color: CREME, transparent: true, opacity: 0 }),
    )
    const p = curva.getPointAt(t)
    const tg = curva.getTangentAt(t)
    anel.position.copy(p)
    anel.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tg)
    anel.scale.setScalar(0.001)
    scene.add(anel)
    return { t, anel }
  })

  // Sensores ao longo do poço
  const sensores = [0.18, 0.38, 0.6, 0.82].map((t) => {
    const no = new THREE.Mesh(new THREE.OctahedronGeometry(0.045), new THREE.MeshBasicMaterial({ color: CREME, transparent: true, opacity: 0 }))
    no.position.copy(curva.getPointAt(t)).add(new THREE.Vector3(0.12, 0, 0))
    scene.add(no)
    const pulsos = [0, 1].map(() => {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.09, 0.1, 48),
        new THREE.MeshBasicMaterial({ color: LARANJA, transparent: true, opacity: 0, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false }),
      )
      r.position.copy(no.position)
      r.rotation.x = -Math.PI / 2
      scene.add(r)
      return r
    })
    return { t, no, pulsos, ativoDesde: -1 }
  })

  // Ondas sísmicas na superfície
  const ondas = [0, 1, 2].map(() => {
    const r = new THREE.Mesh(
      new THREE.RingGeometry(0.98, 1, 96),
      new THREE.MeshBasicMaterial({ color: CREME, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    )
    r.rotation.x = -Math.PI / 2
    r.position.y = SUPERFICIE + 0.001
    scene.add(r)
    return r
  })

  // Broca
  const broca = new THREE.Sprite(new THREE.SpriteMaterial({ map: brilhoTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
  broca.scale.setScalar(0.55)
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 16), new THREE.MeshBasicMaterial({ color: '#fff3e8' }))
  scene.add(broca, nucleo)

  // Telemetria: partículas subindo pelo poço
  const NP = 180
  const pp = new Float32Array(NP * 3)
  const pc = new Float32Array(NP * 3)
  const u = new Float32Array(NP)
  const vel = new Float32Array(NP)
  for (let i = 0; i < NP; i++) {
    u[i] = Math.random()
    vel[i] = 0.08 + Math.random() * 0.14
    const c = Math.random() < 0.35 ? CREME : LARANJA
    pc[i * 3] = c.r
    pc[i * 3 + 1] = c.g
    pc[i * 3 + 2] = c.b
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3))
  pGeo.setAttribute('color', new THREE.BufferAttribute(pc, 3))
  const particulas = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }))
  scene.add(particulas)

  const estado = { progresso: 0, mergulho: -1 }
  const relogio = new THREE.Timer()
  let quadro = 0
  let chegou = -1
  const tmp = new THREE.Vector3()

  const ajustar = () => {
    const w = canvas.clientWidth || window.innerWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Em pé, o texto ocupa a parte de baixo: a cena sobe para o terço de cima
    retrato = w / h < 0.8
    camera.updateProjectionMatrix()
  }
  ajustar()
  window.addEventListener('resize', ajustar)

  const suave = (x: number) => x * x * (3 - 2 * x)

  const desenhar = () => {
    quadro = requestAnimationFrame(desenhar)
    relogio.update()
    const t = relogio.getElapsed()
    const p = Math.min(1, Math.max(0, estado.progresso))
    if (p >= 1 && chegou < 0) chegou = t

    // Câmera em órbita lenta; recua mais em telas em pé
    const raio = retrato ? 17 : 9.4
    alvo.y = retrato ? -2.9 : -2.0
    const ang = 0.55 + t * 0.09
    const cam = new THREE.Vector3(alvo.x + Math.sin(ang) * raio, (retrato ? 1.2 : 1.0) + Math.sin(t * 0.25) * 0.25, alvo.z + Math.cos(ang) * raio)
    if (estado.mergulho >= 0) {
      const m = suave(Math.min(1, (t - estado.mergulho) / 1.2))
      const fim = curva.getPointAt(0.97)
      cam.lerp(tmp.copy(fim).add(new THREE.Vector3(0.6, 0.35, 0.9)), m)
      camera.fov = 36 + m * 22
      camera.updateProjectionMatrix()
    }
    camera.position.copy(cam)
    camera.lookAt(estado.mergulho >= 0 ? alvo.clone().lerp(curva.getPointAt(0.97), suave(Math.min(1, (t - estado.mergulho) / 1.2))) : alvo)

    // Poço perfurado até o progresso atual
    const n = Math.floor(p * SEG) * RAD * 6
    tubo.geometry.setDrawRange(0, n)
    halo.geometry.setDrawRange(0, n)
    const ponta = curva.getPointAt(Math.max(0.001, p))
    broca.position.copy(ponta)
    nucleo.position.copy(ponta)
    broca.scale.setScalar(0.5 + Math.sin(t * 9) * 0.05 + (chegou > 0 ? Math.min(1, (t - chegou) * 2) * 0.6 : 0))

    // Mar ondulando
    const pos = marGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < nx * nz; i++) {
      const x = mar[i * 3]
      const z = mar[i * 3 + 2]
      pos.array[i * 3 + 1] = SUPERFICIE + 0.03 * Math.sin(x * 1.6 + t * 1.2) + 0.02 * Math.cos(z * 2.1 + t * 0.9)
    }
    pos.needsUpdate = true

    farol.material.opacity = 0.55 + 0.45 * Math.max(0, Math.sin(t * 3.2))

    // Ondas sísmicas
    ondas.forEach((o, i) => {
      const f = ((t * 0.32 + i / 3) % 1)
      o.scale.setScalar(0.3 + f * 3.6)
      ;(o.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.22
    })

    sapatas.forEach(({ t: tt, anel }) => {
      const k = Math.min(1, Math.max(0, (p - tt) / 0.06))
      anel.scale.setScalar(0.001 + suave(k))
      ;(anel.material as THREE.MeshBasicMaterial).opacity = k * 0.85
    })

    sensores.forEach((s) => {
      const ativo = p >= s.t
      if (ativo && s.ativoDesde < 0) s.ativoDesde = t
      ;(s.no.material as THREE.MeshBasicMaterial).opacity = ativo ? 0.95 : 0
      s.no.rotation.y = t * 1.4
      s.pulsos.forEach((r, i) => {
        if (!ativo) return
        const f = ((t - s.ativoDesde) / 1.8 + i * 0.5) % 1
        r.scale.setScalar(1 + f * 5)
        ;(r.material as THREE.MeshBasicMaterial).opacity = (1 - f) * 0.55
      })
    })

    // Reservatório acende quando a broca chega
    const acende = chegou > 0 ? Math.min(1, (t - chegou) * 1.6) : 0
    ;(reservatorio.material as THREE.LineBasicMaterial).opacity = 0.32 + acende * 0.68
    camadas.forEach((c, i) => ((c.material as THREE.LineBasicMaterial).opacity = 0.75 + 0.25 * Math.sin(t * 0.8 + i)))

    // Dados sobem do fundo até a superfície
    const pa = pGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < NP; i++) {
      u[i] -= vel[i] * 0.016
      if (u[i] < 0) u[i] = Math.max(0.001, p) * (0.85 + Math.random() * 0.15)
      const q = Math.min(u[i], p)
      curva.getPointAt(Math.max(0, q), tmp)
      const ang2 = i * 2.39 + t * 2
      pa.array[i * 3] = tmp.x + Math.cos(ang2) * 0.045
      pa.array[i * 3 + 1] = tmp.y
      pa.array[i * 3 + 2] = tmp.z + Math.sin(ang2) * 0.045
    }
    pa.needsUpdate = true
    particulas.visible = p > 0.04

    renderer.render(scene, camera)
  }
  desenhar()

  return {
    get progresso() {
      return estado.progresso
    },
    set progresso(v: number) {
      estado.progresso = v
    },
    mergulhar() {
      estado.mergulho = relogio.getElapsed()
    },
    destruir() {
      cancelAnimationFrame(quadro)
      window.removeEventListener('resize', ajustar)
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      brilhoTex.dispose()
      renderer.dispose()
    },
  }
}
