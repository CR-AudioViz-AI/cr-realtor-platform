// lib/apis/real-estate-news.ts
// NewsAPI + GNews integration for real estate news
// Primary: NewsAPI (<NEWSAPI_KEY — from the vault, never in source>)
// Backup: GNews (<GNEWS_API_KEY — from the vault, never in source>)

export interface NewsArticle {
  id: string
  title: string
  description: string
  content: string
  url: string
  image: string | null
  publishedAt: string
  source: {
    name: string
    url: string
  }
  category: string
}

export interface NewsResponse {
  articles: NewsArticle[]
  totalResults: number
  lastUpdated: string
  source: 'newsapi' | 'gnews' | 'cache'
}

const NEWS_API_KEY = process.env.NEWSAPI_API_KEY || (process.env.NEWSAPI_KEY ?? '')
const GNEWS_API_KEY = process.env.GNEWS_API_KEY || (process.env.GNEWS_API_KEY ?? '')

// Real estate related search terms
const RE_KEYWORDS = [
  'real estate market',
  'housing market',
  'mortgage rates',
  'home prices',
  'housing inventory',
  'home sales',
  'real estate investment',
  'rental market'
]

// Florida-specific terms for local news
const FL_KEYWORDS = [
  'Florida housing',
  'Florida real estate',
  'Southwest Florida homes',
  'Naples real estate',
  'Fort Myers housing',
  'Cape Coral homes'
]

async function fetchFromNewsAPI(
  query: string,
  pageSize: number = 10
): Promise<NewsArticle[]> {
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`
    
    const response = await fetch(url, {
      next: { revalidate: 1800 } // Cache for 30 minutes
    })
    
    if (!response.ok) {
      console.error('NewsAPI error:', response.status)
      return []
    }
    
    const data = await response.json()
    
    if (data.status !== 'ok' || !data.articles) {
      return []
    }
    
    return data.articles.map((article: any, idx: number) => ({
      id: `newsapi-${idx}-${Date.now()}`,
      title: article.title || '',
      description: article.description || '',
      content: article.content || '',
      url: article.url || '',
      image: article.urlToImage || null,
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown',
        url: article.url?.split('/').slice(0, 3).join('/') || ''
      },
      category: determineCategory(article.title, article.description)
    }))
  } catch (error) {
    console.error('NewsAPI fetch error:', error)
    return []
  }
}

async function fetchFromGNews(
  query: string,
  maxResults: number = 10
): Promise<NewsArticle[]> {
  try {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${maxResults}&apikey=${GNEWS_API_KEY}`
    
    const response = await fetch(url, {
      next: { revalidate: 1800 }
    })
    
    if (!response.ok) {
      console.error('GNews error:', response.status)
      return []
    }
    
    const data = await response.json()
    
    if (!data.articles) {
      return []
    }
    
    return data.articles.map((article: any, idx: number) => ({
      id: `gnews-${idx}-${Date.now()}`,
      title: article.title || '',
      description: article.description || '',
      content: article.content || '',
      url: article.url || '',
      image: article.image || null,
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        name: article.source?.name || 'Unknown',
        url: article.source?.url || ''
      },
      category: determineCategory(article.title, article.description)
    }))
  } catch (error) {
    console.error('GNews fetch error:', error)
    return []
  }
}

function determineCategory(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()
  
  if (text.includes('mortgage') || text.includes('interest rate') || text.includes('lending')) {
    return 'Mortgage & Rates'
  }
  if (text.includes('price') || text.includes('appreciation') || text.includes('home value')) {
    return 'Home Prices'
  }
  if (text.includes('investment') || text.includes('investor') || text.includes('rental')) {
    return 'Investment'
  }
  if (text.includes('inventory') || text.includes('shortage') || text.includes('supply')) {
    return 'Inventory'
  }
  if (text.includes('florida') || text.includes('naples') || text.includes('miami') || text.includes('tampa')) {
    return 'Florida Market'
  }
  if (text.includes('commercial') || text.includes('office') || text.includes('retail')) {
    return 'Commercial'
  }
  return 'Market News'
}

export async function getRealEstateNews(
  category: 'all' | 'national' | 'florida' | 'mortgage' | 'investment' = 'all',
  limit: number = 20
): Promise<NewsResponse> {
  try {
    let query: string
    
    switch (category) {
      case 'florida':
        query = FL_KEYWORDS[Math.floor(Math.random() * FL_KEYWORDS.length)]
        break
      case 'mortgage':
        query = 'mortgage rates OR home loan OR interest rates housing'
        break
      case 'investment':
        query = 'real estate investment OR rental property OR REITs'
        break
      case 'national':
        query = 'US housing market OR national home prices OR housing trends'
        break
      default:
        query = RE_KEYWORDS[Math.floor(Math.random() * RE_KEYWORDS.length)]
    }
    
    // Try NewsAPI first
    let articles = await fetchFromNewsAPI(query, limit)
    let source: 'newsapi' | 'gnews' | 'cache' = 'newsapi'
    
    // Fallback to GNews if NewsAPI fails or returns empty
    if (articles.length === 0) {
      articles = await fetchFromGNews(query, limit)
      source = 'gnews'
    }
    
    // Filter out articles without titles or descriptions
    articles = articles.filter(a => a.title && a.description)
    
    // Remove duplicates by title similarity
    const seen = new Set<string>()
    articles = articles.filter(article => {
      const normalized = article.title.toLowerCase().slice(0, 50)
      if (seen.has(normalized)) return false
      seen.add(normalized)
      return true
    })
    
    return {
      articles: articles.slice(0, limit),
      totalResults: articles.length,
      lastUpdated: new Date().toISOString(),
      source
    }
  } catch (error) {
    console.error('Real estate news fetch error:', error)
    return {
      articles: [],
      totalResults: 0,
      lastUpdated: new Date().toISOString(),
      source: 'cache'
    }
  }
}

// Get headlines for a quick widget
export async function getMarketHeadlines(limit: number = 5): Promise<NewsArticle[]> {
  const result = await getRealEstateNews('all', limit)
  return result.articles
}

// Get Florida-specific news
export async function getFloridaMarketNews(limit: number = 10): Promise<NewsArticle[]> {
  const result = await getRealEstateNews('florida', limit)
  return result.articles
}

// Get mortgage rate news
export async function getMortgageNews(limit: number = 10): Promise<NewsArticle[]> {
  const result = await getRealEstateNews('mortgage', limit)
  return result.articles
}
