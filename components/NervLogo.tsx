'use client';

import { motion } from 'framer-motion';

export default function NervLogo({ compact = false }: { compact?: boolean }) {
  return (
    <motion.span
      className="nerv-logo"
      aria-label="НЕРВ"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18 }}
    >
      <motion.span
        className="nerv-logo-mark"
        style={{ ['--nerv-logo-size' as string]: compact ? '38px' : '46px' }}
        animate={{
          boxShadow: [
            '0 0 22px rgba(139,92,246,.42), inset 0 1px 0 rgba(255,255,255,.28)',
            '0 0 34px rgba(139,92,246,.68), 0 0 72px rgba(109,40,217,.28), inset 0 1px 0 rgba(255,255,255,.28)',
            '0 0 22px rgba(139,92,246,.42), inset 0 1px 0 rgba(255,255,255,.28)',
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        <span className="nerv-logo-letter">Н</span>
      </motion.span>
      {!compact && <span className="nerv-logo-word">НЕРВ</span>}
    </motion.span>
  );
}