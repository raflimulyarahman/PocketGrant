'use client'

import { Construction } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface UnderConstructionProps {
  title?: string
  description?: string
  className?: string
}

export function UnderConstruction({
  title = 'Dalam Pengembangan',
  description = 'Fitur ini sedang dalam tahap pengembangan. Nantikan update selanjutnya!',
  className,
}: UnderConstructionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6">
        <Construction className="w-10 h-10 text-orange-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <Link
        href="/"
        className={cn(
          'px-6 py-3 rounded-xl font-medium',
          'bg-muted hover:bg-muted/80 text-foreground',
          'transition-colors touch-manipulation'
        )}
      >
        Kembali ke Beranda
      </Link>
    </motion.div>
  )
}
