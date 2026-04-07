'use client'

import { motion } from 'framer-motion'
import { Github, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import NavBar from '@/components/NavBar'
import ComingSoonFeatures from '@/components/ComingSoonFeatures'
import {
  FibonacciCodeMockup,
  FeatureCard,
  HonestStatsSection,
  LIVE_FEATURES,
  MagneticButton,
  ParticlesBackground,
} from '@/components/LandingSections'

export default function Home() {
  const router = useRouter()
  const { authState } = useAuth()

  const primaryHref = authState.isAuthenticated ? '/playground' : '/auth/register'
  const primaryLabel = authState.isAuthenticated
    ? 'Open Playground'
    : 'Start Coding Free'

  const secondaryHref = authState.isAuthenticated
    ? '/dashboard'
    : '/auth/login'
  const secondaryLabel = authState.isAuthenticated ? 'Dashboard' : 'Sign In'

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-pink-900/20"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 0%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      <NavBar />

      <section className="relative min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-2 md:mb-4 font-sans tracking-tight">
              {(['Code.', 'Execute.', 'Collaborate.'] as const).map(
                (word, i) => (
                  <motion.span
                    key={word}
                    className="inline-block bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mr-[0.2em] last:mr-0"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.15,
                    }}
                    style={{ backgroundSize: '200% auto' }}
                  >
                    {word}
                  </motion.span>
                )
              )}
            </h1>

            <motion.div
              className="h-1 bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-400 rounded-full mx-auto mb-8 max-w-[min(280px,80vw)]"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '100%', opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          </motion.div>

          <motion.p
            className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto font-sans leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            A developer playground today. A real-time coding platform tomorrow.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
          >
            <motion.button
              type="button"
              onClick={() => router.push(primaryHref)}
              className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg font-semibold text-lg overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-violet-600"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">{primaryLabel}</span>
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-lg pointer-events-none"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.button>

            <motion.button
              type="button"
              onClick={() => router.push(secondaryHref)}
              className="px-8 py-4 border-2 border-violet-500/50 rounded-lg font-semibold text-lg backdrop-blur-sm hover:bg-violet-500/10 transition cursor-pointer"
              whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 1)' }}
              whileTap={{ scale: 0.95 }}
            >
              {secondaryLabel}
            </motion.button>
          </motion.div>

          <motion.div
            className="mt-16 md:mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <FibonacciCodeMockup />
          </motion.div>

          <motion.div
            className="mt-10 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-full text-sm text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 font-mono text-xs font-medium">
              JavaScript
            </span>
            <span className="text-zinc-500">·</span>
            <span>
              Built with{' '}
              <span className="text-violet-400">Spring Boot</span> ·{' '}
              <span className="text-pink-400">React</span> ·{' '}
              <span className="text-cyan-400">Docker</span>
            </span>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-6 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            className="text-3xl md:text-5xl font-bold text-center mb-4 font-sans"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Live{' '}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              now
            </span>
          </motion.h2>
          <motion.p
            className="text-center text-zinc-500 mb-14 md:mb-16 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            What you can use in CodeJam today — no roadmap fiction.
          </motion.p>

          <div className="grid md:grid-cols-3 gap-8">
            {LIVE_FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <HonestStatsSection />

      <ComingSoonFeatures />

      <section className="px-6 py-32 relative">
        <ParticlesBackground />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-8 font-sans"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Start Coding?
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-zinc-400 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Open the playground and run real code in the sandbox.
          </motion.p>

          <MagneticButton
            label={
              authState.isAuthenticated
                ? 'Open Playground'
                : 'Start Coding Free'
            }
            onNavigate={() =>
              router.push(
                authState.isAuthenticated ? '/playground' : '/auth/register'
              )
            }
          />
        </div>
      </section>

      <footer className="border-t border-zinc-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                CodeJam
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                Execute code in the browser-backed sandbox. Collaboration is on
                the roadmap.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <motion.a
                href="https://github.com/codejam-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
              >
                <Github className="w-5 h-5" />
                GitHub
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </motion.a>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-zinc-800">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} CodeJam. Built with care by{' '}
              <a
                href="https://github.com/TonyStark0801"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors underline-offset-2 hover:underline"
              >
                Shubham Mishra
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
