'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, HandCoins, Gift, Heart, Shield, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  description?: string
  disabled?: boolean
}

const navItems: NavItem[] = [
  { label: 'Beranda', href: '/', icon: <Home className="w-5 h-5" />, description: 'Kembali ke halaman utama' },
  { label: 'Request Dana', href: '/request', icon: <HandCoins className="w-5 h-5" />, description: 'Ajukan permohonan bantuan' },
  { label: 'Claim Dana', href: '/claim', icon: <Gift className="w-5 h-5" />, description: 'Klaim Dana Kaget atau Gift Card' },
  { label: 'My Donation', href: '/donate', icon: <Heart className="w-5 h-5" />, description: 'Buat program donasi' },
  { label: 'Admin', href: '/admin', icon: <Shield className="w-5 h-5" />, description: 'Verifikasi pengguna' },
]

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Hamburger Button - Fixed position */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed top-4 left-4 z-[60] p-3 rounded-xl',
          'bg-card/80 backdrop-blur-xl border border-border',
          'hover:bg-muted active:scale-95 transition-all',
          'touch-manipulation min-h-[48px] min-w-[48px]',
          'flex items-center justify-center'
        )}
        aria-label="Menu"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6 text-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="w-6 h-6 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 left-0 z-[58] h-full w-80 max-w-[85vw]',
              'bg-card border-r border-border shadow-2xl',
              'flex flex-col safe-area-top safe-area-bottom'
            )}
          >
            {/* Header */}
            <div className="p-6 pt-20 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Menu</h2>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.disabled ? '#' : item.href}
                  onClick={() => !item.disabled && setIsOpen(false)}
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl',
                    'hover:bg-muted active:bg-muted/80 transition-colors',
                    'touch-manipulation min-h-[60px]',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Footer - Theme Toggle */}
            <div className="p-4 border-t border-border">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl',
                    'bg-muted hover:bg-muted/80 transition-colors',
                    'touch-manipulation min-h-[60px]'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </div>
                  <span className="font-medium text-foreground">
                    {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                  </span>
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
