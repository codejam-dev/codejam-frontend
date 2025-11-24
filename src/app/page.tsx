'use client'

import { motion, useScroll } from 'framer-motion'
import { GithubIcon, Zap, Users, Link as LinkIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const { scrollYProgress } = useScroll()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-pink-900/20"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
            ]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 px-6 py-4 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            CodeJam
          </motion.div>

          <div className="flex gap-6 items-center">
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Docs
            </motion.a>
            <motion.a
              href="https://github.com"
              target="_blank"
              className="text-gray-400 hover:text-white transition"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <GithubIcon className="w-5 h-5" />
            </motion.a>
            <motion.button
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg font-semibold"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-6xl mx-auto text-center">
          {/* Headline with stagger animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4">
              <motion.span
                className="inline-block bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: '200% auto' }}
              >
                Code Together.
              </motion.span>
            </h1>
            <h1 className="text-6xl md:text-8xl font-bold mb-8">
              <motion.span
                className="inline-block bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear", delay: 0.2 }}
                style={{ backgroundSize: '200% auto' }}
              >
                Ship Faster.
              </motion.span>
            </h1>

            {/* Animated underline */}
            <motion.div
              className="h-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full mx-auto mb-8"
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            Real-time collaborative coding for developers who move fast.
            Share code, sync edits, build together.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.button
              className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg font-semibold text-lg overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-violet-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Start Coding Free</span>

              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>

            <motion.button
              className="px-8 py-4 border-2 border-violet-500/50 rounded-lg font-semibold text-lg backdrop-blur-sm hover:bg-violet-500/10 transition"
              whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 1)' }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Floating Code Mockup */}
          <motion.div
            className="mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <FloatingCodeMockup />
          </motion.div>

          {/* Tech Stack Badge */}
          <motion.div
            className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-full text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Built with <span className="text-violet-400">Spring Boot</span> ·
            <span className="text-pink-400">React</span> ·
            <span className="text-cyan-400">WebSocket</span>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Features That Make You
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent"> Productive</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Create a coding room in seconds. No setup, no friction. Just code.',
                color: 'from-yellow-400 to-orange-500'
              },
              {
                icon: Users,
                title: 'Real-Time Sync',
                description: 'See every edit instantly. <100ms latency. Multiple cursors. Pure magic.',
                color: 'from-violet-400 to-purple-500'
              },
              {
                icon: LinkIcon,
                title: 'Simple Sharing',
                description: 'Share a link. Start coding. That\'s it. No accounts required to join.',
                color: 'from-cyan-400 to-blue-500'
              }
            ].map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <section className="px-6 py-32 relative">
        <ParticlesBackground />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            className="text-5xl md:text-6xl font-bold mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Code Together?
          </motion.h2>

          <motion.p
            className="text-xl text-gray-400 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join developers building the future, together.
          </motion.p>

          <MagneticButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                CodeJam
              </h3>
              <p className="text-sm text-gray-500">
                Real-time collaborative coding for developers.
              </p>
            </div>

            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Docs', 'Changelog']
              },
              {
                title: 'Company',
                links: ['About', 'Blog', 'Careers', 'Contact']
              },
              {
                title: 'Legal',
                links: ['Privacy', 'Terms', 'Security']
              }
            ].map((column) => (
              <div key={column.title}>
                <h4 className="font-semibold mb-4 text-gray-300">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <motion.a
                        href="#"
                        className="text-sm text-gray-500 hover:text-white transition"
                        whileHover={{ x: 3 }}
                      >
                        {link}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 CodeJam. Built with ❤️ by developers
            </p>

            <div className="flex gap-6">
              {['GitHub', 'Twitter', 'Discord'].map((social) => (
                <motion.a
                  key={social}
                  href="#"
                  className="text-gray-500 hover:text-white transition text-sm"
                  whileHover={{ y: -2 }}
                >
                  {social}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component: Floating Code Mockup
function FloatingCodeMockup() {
  const [code, setCode] = useState('')
  const fullCode = `function collaborateInRealTime() {\n  const session = createSession();\n  session.invite(teammates);\n  return magic();\n}`

  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < fullCode.length) {
        setCode(fullCode.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="relative"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
        {/* Browser Chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex-1 text-center text-sm text-gray-500">
            main.js — CodeJam Session
          </div>
        </div>

        {/* Code Editor */}
        <div className="p-6 font-mono text-sm">
          <pre className="text-gray-300">
            <code>
              {code.split('\n').map((line, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-gray-600 select-none">{i + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </code>
          </pre>

          {/* Animated Cursors */}
          <motion.div
            className="absolute top-24 left-32 w-0.5 h-5 bg-violet-500"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-32 left-48 w-0.5 h-5 bg-pink-500"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-pink-600/20 blur-3xl -z-10" />
    </motion.div>
  )
}

// Component: Feature Card
function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const Icon = feature.icon

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
    >
      <motion.div
        className="p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl relative overflow-hidden"
        whileHover={{ y: -5, borderColor: 'rgba(139, 92, 246, 0.5)' }}
        transition={{ duration: 0.3 }}
      >
        {/* Gradient Glow on Hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
        />

        {/* Icon */}
        <motion.div
          className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-6`}
          whileHover={{ rotate: 5, scale: 1.1 }}
        >
          <Icon className="w-full h-full text-white" />
        </motion.div>

        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
        <p className="text-gray-400 leading-relaxed">{feature.description}</p>

        {/* Hover Border Glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
             style={{
               background: `linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))`,
               filter: 'blur(20px)',
               zIndex: -1
             }}
        />
      </motion.div>
    </motion.div>
  )
}

// Component: Stats Section with Count-Up
function StatsSection() {
  const [inView, setInView] = useState(false)

  return (
    <motion.section
      className="px-6 py-24 bg-zinc-900/30"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      onViewportEnter={() => setInView(true)}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
        {[
          { value: 1000, suffix: '+', label: 'Coding Sessions' },
          { value: 50, suffix: '+', label: 'Languages Supported' },
          { value: 100, suffix: 'ms', label: 'Average Latency' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              {inView && <CountUp end={stat.value} duration={2} />}{stat.suffix}
            </div>
            <div className="text-gray-400 text-lg">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

// Component: Count Up Animation
function CountUp({ end, duration }: { end: number; duration: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [end, duration])

  return <span>{count}</span>
}

// Component: Magnetic Button
function MagneticButton() {
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
      className="relative px-12 py-5 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg font-semibold text-xl overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">Start Your First Session</span>

      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </motion.button>
  )
}

// Component: Particles Background
function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-violet-500/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}
