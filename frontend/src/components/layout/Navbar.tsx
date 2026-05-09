'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const links = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#methodology' },
  { label: 'Demo', href: '#demo' },
  { label: 'Fairness', href: '#fairness' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinkClass = 'text-sm font-semibold text-ink-muted transition-colors hover:text-brand-600'

  return (
    <header className={`sticky top-0 z-50 h-16 transition-all duration-300 ${scrolled ? 'border-b border-surface-border bg-white/85 shadow-sm backdrop-blur-xl' : 'bg-white/70 backdrop-blur-md'}`}>
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🏥</span>
          <span>
            <span className="block text-lg font-extrabold leading-5 text-brand-600">CareTarget</span>
            <span className="hidden text-xs font-semibold text-ink-subtle sm:block">Readmission Intelligence</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map(link => (
            <a key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink md:hidden"
          aria-label="Open navigation"
          onClick={() => setOpen(value => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-b border-surface-border bg-white p-4 shadow-card md:hidden"
          >
            <div className="grid gap-2">
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-4 py-3 text-sm font-bold text-ink-muted hover:bg-brand-50 hover:text-brand-600"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
