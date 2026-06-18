import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const MODULE_COLORS = {
  listening: 0x7c5cfc,
  reading:   0x1fd9a0,
  writing:   0xf9a825,
  speaking:  0xf75c5c,
}

const MODULE_LABELS = ['L', 'R', 'W', 'S']
const MODULE_KEYS   = ['listening', 'reading', 'writing', 'speaking']

export default function SkillSphere({ scores = { listening: 0, reading: 0, writing: 0, speaking: 0 }, size = 320 }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const W = size, H = size
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mountRef.current.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.set(0, 0, 4.5)

    // Ambient + point lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4))
    const pLight = new THREE.PointLight(0x7c5cfc, 2, 10)
    pLight.position.set(2, 2, 2)
    scene.add(pLight)

    // Core sphere (wireframe)
    const coreGeo = new THREE.SphereGeometry(1, 32, 32)
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x7c5cfc, wireframe: true, opacity: 0.08, transparent: true })
    const core = new THREE.Mesh(coreGeo, coreMat)
    scene.add(core)

    // Inner glow sphere
    const glowGeo = new THREE.SphereGeometry(0.95, 32, 32)
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x7c5cfc, opacity: 0.04, transparent: true })
    scene.add(new THREE.Mesh(glowGeo, glowMat))

    // Module orbs — positioned at cardinal directions
    const positions = [
      new THREE.Vector3(0, 1.6, 0),    // top — Listening
      new THREE.Vector3(1.6, 0, 0),    // right — Reading
      new THREE.Vector3(0, -1.6, 0),   // bottom — Writing
      new THREE.Vector3(-1.6, 0, 0),   // left — Speaking
    ]

    const orbs = []
    MODULE_KEYS.forEach((key, i) => {
      const score = scores[key] || 0
      const normalised = Math.max(0.15, score / 9)

      // Orb
      const geo = new THREE.SphereGeometry(0.18 + normalised * 0.14, 24, 24)
      const mat = new THREE.MeshPhongMaterial({
        color: MODULE_COLORS[key],
        emissive: MODULE_COLORS[key],
        emissiveIntensity: 0.4,
        shininess: 80,
        transparent: true,
        opacity: 0.9,
      })
      const orb = new THREE.Mesh(geo, mat)
      orb.position.copy(positions[i])
      scene.add(orb)
      orbs.push(orb)

      // Ring around orb
      const ringGeo = new THREE.RingGeometry(0.28, 0.32, 40)
      const ringMat = new THREE.MeshBasicMaterial({ color: MODULE_COLORS[key], side: THREE.DoubleSide, opacity: 0.35, transparent: true })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.copy(positions[i])
      ring.lookAt(camera.position)
      scene.add(ring)

      // Connector line to core
      const points = [new THREE.Vector3(0, 0, 0), positions[i].clone().multiplyScalar(0.9)]
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points)
      const lineMat = new THREE.LineBasicMaterial({ color: MODULE_COLORS[key], opacity: 0.25, transparent: true })
      scene.add(new THREE.Line(lineGeo, lineMat))
    })

    // Floating particles
    const particleGeo = new THREE.BufferGeometry()
    const count = 120
    const positions2 = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi   = Math.acos(2 * Math.random() - 1)
      const r     = 1.3 + Math.random() * 0.8
      positions2[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      positions2[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions2[i * 3 + 2] = r * Math.cos(phi)
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions2, 3))
    const particleMat = new THREE.PointsMaterial({ color: 0x7c5cfc, size: 0.025, transparent: true, opacity: 0.5 })
    scene.add(new THREE.Points(particleGeo, particleMat))

    // Mouse drag
    let isDragging = false, prevX = 0, prevY = 0
    const group = new THREE.Group()
    scene.children.forEach(c => { if (c !== scene) {} })

    const el = renderer.domElement
    el.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY })
    window.addEventListener('mouseup', () => { isDragging = false })
    window.addEventListener('mousemove', e => {
      if (!isDragging) return
      const dx = (e.clientX - prevX) * 0.008
      const dy = (e.clientY - prevY) * 0.008
      core.rotation.y += dx
      core.rotation.x += dy
      orbs.forEach(o => {
        o.position.applyEuler(new THREE.Euler(dy, dx, 0))
      })
      prevX = e.clientX; prevY = e.clientY
    })

    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)
      core.rotation.y += 0.003
      orbs.forEach((orb, i) => {
        orb.position.y += Math.sin(Date.now() * 0.001 + i) * 0.0008
      })
      pLight.position.set(Math.sin(Date.now() * 0.0008) * 3, 2, Math.cos(Date.now() * 0.0008) * 3)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      renderer.dispose()
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [scores, size])

  return (
    <div style={{ position: 'relative', width: size, height: size, cursor: 'grab' }}>
      <div ref={mountRef} />
      {/* Labels */}
      {['Listening', 'Reading', 'Writing', 'Speaking'].map((label, i) => {
        const positions = [
          { top: 4, left: '50%', transform: 'translateX(-50%)' },
          { top: '50%', right: 4, transform: 'translateY(-50%)' },
          { bottom: 4, left: '50%', transform: 'translateX(-50%)' },
          { top: '50%', left: 4, transform: 'translateY(-50%)' },
        ]
        const colors = ['#7c5cfc', '#1fd9a0', '#f9a825', '#f75c5c']
        return (
          <div key={label} style={{
            position: 'absolute',
            ...positions[i],
            fontSize: 11,
            fontWeight: 600,
            color: colors[i],
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}>
            {MODULE_LABELS[i]}
          </div>
        )
      })}
    </div>
  )
}
