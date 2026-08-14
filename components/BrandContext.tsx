'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface BrandConfig {
  brand: string
  name: string
  tagline: string
  primaryColor: string
  logoText: string
  isConsumer: boolean
}

const defaultBrand: BrandConfig = {
  brand: 'javarikeys',
  name: 'Javari Keys',
  tagline: 'AI-Powered Realtor Platform',
  primaryColor: '#10B981',
  logoText: 'Javari Keys',
  isConsumer: false,
}

const BrandContext = createContext<BrandConfig>(defaultBrand)

export function useBrand() {
  return useContext(BrandContext)
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandConfig>(defaultBrand)
  
  useEffect(() => {
    // Read brand from cookies
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    // Detect brand from hostname as fallback
    const hostname = window.location.hostname
    
    if (hostname.includes('zoyzy')) {
      setBrand({
        brand: 'zoyzy',
        name: 'Zoyzy',
        tagline: 'Find Your Perfect Home',
        primaryColor: '#06B6D4',
        logoText: 'Zoyzy',
        isConsumer: true,
      })
    } else {
      setBrand({
        brand: cookies.brand || 'javarikeys',
        name: cookies.brandName || 'Javari Keys',
        tagline: 'AI-Powered Realtor Platform',
        primaryColor: '#10B981',
        logoText: 'Javari Keys',
        isConsumer: cookies.isConsumer === 'true',
      })
    }
  }, [])
  
  return (
    <BrandContext.Provider value={brand}>
      {children}
    </BrandContext.Provider>
  )
}
