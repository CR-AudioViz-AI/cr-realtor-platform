'use client'

import Link from 'next/link'
import { useBrand } from './BrandContext'
import { Building2, Home, Search, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function DynamicHeader() {
  const brand = useBrand()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Different navigation based on brand
  const navigation = brand.isConsumer 
    ? [
        { name: 'Search Homes', href: '/search' },
        { name: 'Rent', href: '/rent' },
        { name: 'Buy', href: '/buy' },
        { name: 'Saved', href: '/saved' },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Leads', href: '/leads' },
        { name: 'Listings', href: '/listings' },
        { name: 'Pricing', href: '/pricing' },
      ]
  
  const Icon = brand.isConsumer ? Home : Building2
  
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">{brand.logoText}</span>
              {!brand.isConsumer && (
                <span className="block text-xs text-slate-400">{brand.tagline}</span>
              )}
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                className="text-slate-300 hover:text-white transition"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a 
              href="https://craudiovizai.com/auth/login"
              className="text-slate-300 hover:text-white transition px-4 py-2"
            >
              Log In
            </a>
            <a 
              href="https://craudiovizai.com/auth/signup"
              className="text-white font-semibold px-4 py-2 rounded-lg transition"
              style={{ backgroundColor: brand.primaryColor }}
            >
              {brand.isConsumer ? 'Sign Up Free' : 'Start Free Trial'}
            </a>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-slate-800 mt-4">
            {navigation.map((item) => (
              <Link 
                key={item.name}
                href={item.href}
                className="block py-2 text-slate-300 hover:text-white transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-2 mt-4">
              <a 
                href="https://craudiovizai.com/auth/login"
                className="flex-1 text-center text-slate-300 border border-slate-700 py-2 rounded-lg"
              >
                Log In
              </a>
              <a 
                href="https://craudiovizai.com/auth/signup"
                className="flex-1 text-center text-white py-2 rounded-lg"
                style={{ backgroundColor: brand.primaryColor }}
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
