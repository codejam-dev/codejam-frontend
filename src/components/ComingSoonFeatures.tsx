'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Trophy,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    description: 'Code together in shared rooms with live cursors, synchronized edits, and instant execution.',
    gradient: 'from-violet-500 to-purple-600',
    iconColor: '#8b5cf6',
  },
  {
    icon: BookOpen,
    title: 'Problem Library',
    description: 'Curated coding challenges across difficulty levels and topics to sharpen your skills.',
    gradient: 'from-cyan-500 to-blue-600',
    iconColor: '#06b6d4',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Compete with developers worldwide. Track progress and climb the ranks.',
    gradient: 'from-yellow-500 to-orange-600',
    iconColor: '#f59e0b',
  },
];

export default function ComingSoonFeatures() {
  return (
    <motion.section
      className="relative px-6 py-32 overflow-hidden bg-gradient-to-b from-[#0a0a0f] to-[#0f0f1a]"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-400">What's Next</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Coming Soon
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              {' '}Features
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Exciting new capabilities on the horizon. Stay tuned for these game-changing additions.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <p className="text-gray-400 mb-4">
            Follow development and feature announcements on GitHub.
          </p>
          <motion.a
            href="https://github.com/codejam-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/80 border border-zinc-700/60 rounded-lg font-semibold text-zinc-200 hover:bg-zinc-700/80 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Star on GitHub
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      {/* Card */}
      <motion.div
        className="relative h-full p-6 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated gradient background on hover */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
          animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />

        {/* Glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${feature.iconColor}20, transparent 70%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="flex items-start justify-between mb-4">
            <motion.div
              className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg`}
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>

            {/* Coming Soon Badge */}
            <motion.div
              className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 rounded-full"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200 }}
            >
              <span className="text-xs font-semibold text-violet-400">Coming Soon</span>
            </motion.div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors">
            {feature.description}
          </p>
        </div>

        {/* Hover border effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${feature.iconColor}40, transparent, ${feature.iconColor}40)`,
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />
      </motion.div>

      {/* Decorative corner accent */}
      <motion.div
        className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ rotate: 0 }}
        animate={isHovered ? { rotate: 360 } : {}}
        transition={{ duration: 20, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-violet-500/20 rounded-2xl"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
        />
      </motion.div>
    </motion.div>
  );
}
