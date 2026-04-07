'use client'

import { motion } from 'framer-motion'
import {
  Terminal,
  SquareCode,
  History,
  Github,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const FIB_CODE = `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}
console.log(fib(10));`

const FIB_OUTPUT_LINES = ['> node fib.js', '55']

export type LiveFeature = {
  icon: LucideIcon
  title: string
  description: string
  color: string
}

export const LIVE_FEATURES: LiveFeature[] = [
  {
    icon: Terminal,
    title: 'Multi-language execution',
    description:
      'Run JavaScript, Python, Java, C, C++, Go, and Rust in isolated Docker sandboxes.',
    color: 'from-violet-400 to-purple-500',
  },
  {
    icon: SquareCode,
    title: 'Monaco editor',
    description:
      'Syntax highlighting, autocomplete, and themes — the same editor engine as VS Code.',
    color: 'from-pink-400 to-rose-500',
  },
  {
    icon: History,
    title: 'Run history',
    description:
      'Track past runs, review output, and restore code from earlier executions.',
    color: 'from-cyan-400 to-sky-500',
  },
]

export function FibonacciCodeMockup() {
  const [codeChars, setCodeChars] = useState(0)
  const [outputLines, setOutputLines] = useState(0)

  useEffect(() => {
    setCodeChars(0)
    setOutputLines(0)

    let phase: 'code' | 'output' = 'code'
    let codeIndex = 0
    let outIndex = 0
    const typeMs = 28

    const id = setInterval(() => {
      if (phase === 'code') {
        if (codeIndex < FIB_CODE.length) {
          codeIndex += 1
          setCodeChars(codeIndex)
        } else {
          phase = 'output'
        }
        return
      }
      if (outIndex < FIB_OUTPUT_LINES.length) {
        outIndex += 1
        setOutputLines(outIndex)
      } else {
        clearInterval(id)
      }
    }, typeMs)

    return () => clearInterval(id)
  }, [])

  const codeSlice = FIB_CODE.slice(0, codeChars)
  const lines = codeSlice.split('\n')

  return (
    <motion.div
      className="relative text-left"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-lg overflow-hidden shadow-2xl shadow-violet-950/20">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/90" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/90" />
            <div className="w-3 h-3 rounded-full bg-green-500/90" />
          </div>
          <div className="flex-1 text-center text-sm text-zinc-500 font-mono">
            fib.js — CodeJam
          </div>
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono border border-zinc-700 rounded px-2 py-0.5">
            Run
          </span>
        </div>

        <div className="p-5 md:p-6 font-mono text-xs sm:text-sm relative">
          <pre className="text-zinc-300 whitespace-pre-wrap break-all">
            <code>
              {lines.map((line, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-zinc-600 select-none w-5 shrink-0 text-right tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="min-w-0">{line}</span>
                </div>
              ))}
            </code>
          </pre>

          {(outputLines > 0 || codeChars >= FIB_CODE.length) && (
            <motion.div
              className="mt-4 pt-4 border-t border-zinc-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                Output
              </div>
              <pre className="text-emerald-400/95 text-xs sm:text-sm">
                <code>
                  {FIB_OUTPUT_LINES.slice(0, outputLines).map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </code>
              </pre>
            </motion.div>
          )}
        </div>
      </div>
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/15 via-pink-600/15 to-cyan-500/10 blur-3xl -z-10 rounded-3xl" />
    </motion.div>
  )
}

export function FeatureCard({
  feature,
  index,
}: {
  feature: LiveFeature
  index: number
}) {
  const Icon = feature.icon

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
    >
      <motion.div
        className="p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl relative overflow-hidden h-full"
        whileHover={{ y: -4, borderColor: 'rgba(139, 92, 246, 0.45)' }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-300`}
        />

        <motion.div
          className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-6 shadow-lg shadow-black/20`}
          whileHover={{ rotate: 4, scale: 1.06 }}
        >
          <Icon className="w-full h-full text-white" strokeWidth={1.75} />
        </motion.div>

        <h3 className="text-xl font-bold mb-3 font-sans">{feature.title}</h3>
        <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
          {feature.description}
        </p>

        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(236, 72, 153, 0.18))',
            filter: 'blur(24px)',
            zIndex: -1,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

export function HonestStatsSection() {
  return (
    <motion.section
      className="px-6 py-20 md:py-24 bg-zinc-900/30 border-y border-zinc-800/80"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 md:gap-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0 }}
        >
          <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent font-sans">
            7+
          </div>
          <div className="text-zinc-400 text-base md:text-lg">Languages</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent font-sans tracking-tight">
            Docker Sandboxed
          </div>
          <div className="text-zinc-400 text-base md:text-lg">
            Isolated execution per run
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-2xl md:text-3xl font-bold mb-2 font-sans bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Open Source
          </div>
          <div className="text-zinc-400 text-base md:text-lg">
            <a
              href="https://github.com/codejam-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 hover:text-zinc-200 transition-colors underline-offset-2 hover:underline"
            >
              <Github className="w-5 h-5 text-cyan-400 shrink-0" />
              codejam-dev on GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export function MagneticButton({
  label,
  onNavigate,
}: {
  label: string
  onNavigate: () => void
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={onNavigate}
      className="relative px-10 md:px-12 py-4 md:py-5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg font-semibold text-lg md:text-xl overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{label}</span>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </motion.button>
  )
}

export function ParticlesBackground() {
  const [particles, setParticles] = useState<
    Array<{ left: number; top: number; duration: number; delay: number }>
  >([])

  useEffect(() => {
    setParticles(
      [...Array(20)].map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      }))
    )
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-violet-500/30 rounded-full"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  )
}
