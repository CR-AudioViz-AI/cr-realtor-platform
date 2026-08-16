// lib/apis/stock-photos.ts
// Unsplash + Pexels integration for property photos
// Unsplash: RGhtUK7SaxoO-H1TbR2Eq1DDya2-VORV1HfcL3wdFWI
// Pexels: <PEXELS_API_KEY — from the vault, never in source>

export interface StockPhoto {
  id: string
  url: string
  thumbnailUrl: string
  width: number
  height: number
  alt: string
  photographer: string
  photographerUrl: string
  source: 'unsplash' | 'pexels'
  downloadUrl: string
  color: string
}

export interface PhotoSearchResult {
  photos: StockPhoto[]
  totalResults: number
  page: number
  perPage: number
  source: 'unsplash' | 'pexels' | 'both'
}

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'RGhtUK7SaxoO-H1TbR2Eq1DDya2-VORV1HfcL3wdFWI'
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || (process.env.PEXELS_API_KEY ?? '')

// Real estate search queries for curated results
export const RE_PHOTO_QUERIES = {
  exterior: ['modern house exterior', 'home facade', 'residential property', 'house front view'],
  interior: ['home interior', 'living room design', 'modern kitchen', 'bedroom interior'],
  kitchen: ['modern kitchen', 'kitchen design', 'kitchen island', 'gourmet kitchen'],
  bathroom: ['modern bathroom', 'bathroom design', 'spa bathroom', 'bathroom interior'],
  bedroom: ['master bedroom', 'bedroom design', 'bedroom interior', 'cozy bedroom'],
  livingRoom: ['living room', 'family room', 'living space', 'lounge interior'],
  backyard: ['backyard patio', 'outdoor living', 'swimming pool', 'garden design'],
  florida: ['florida home', 'palm trees house', 'beach house', 'tropical home'],
  luxury: ['luxury home', 'mansion', 'upscale property', 'high-end residence'],
  condo: ['condo interior', 'apartment', 'high rise living', 'urban apartment']
}

async function searchUnsplash(
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<StockPhoto[]> {
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error('Unsplash error:', response.status)
      return []
    }
    
    const data = await response.json()
    
    if (!data.results) return []
    
    return data.results.map((photo: any) => ({
      id: `unsplash-${photo.id}`,
      url: photo.urls?.regular || photo.urls?.small,
      thumbnailUrl: photo.urls?.thumb || photo.urls?.small,
      width: photo.width,
      height: photo.height,
      alt: photo.alt_description || photo.description || query,
      photographer: photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || '',
      source: 'unsplash' as const,
      downloadUrl: photo.links?.download || photo.urls?.full,
      color: photo.color || '#cccccc'
    }))
  } catch (error) {
    console.error('Unsplash fetch error:', error)
    return []
  }
}

async function searchPexels(
  query: string,
  page: number = 1,
  perPage: number = 10
): Promise<StockPhoto[]> {
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      },
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      console.error('Pexels error:', response.status)
      return []
    }
    
    const data = await response.json()
    
    if (!data.photos) return []
    
    return data.photos.map((photo: any) => ({
      id: `pexels-${photo.id}`,
      url: photo.src?.large || photo.src?.medium,
      thumbnailUrl: photo.src?.tiny || photo.src?.small,
      width: photo.width,
      height: photo.height,
      alt: photo.alt || query,
      photographer: photo.photographer || 'Unknown',
      photographerUrl: photo.photographer_url || '',
      source: 'pexels' as const,
      downloadUrl: photo.src?.original,
      color: photo.avg_color || '#cccccc'
    }))
  } catch (error) {
    console.error('Pexels fetch error:', error)
    return []
  }
}

export async function searchPropertyPhotos(
  query: string,
  options: {
    page?: number
    perPage?: number
    source?: 'unsplash' | 'pexels' | 'both'
  } = {}
): Promise<PhotoSearchResult> {
  const { page = 1, perPage = 10, source = 'both' } = options
  
  let photos: StockPhoto[] = []
  
  if (source === 'unsplash' || source === 'both') {
    const unsplashPhotos = await searchUnsplash(query, page, perPage)
    photos = [...photos, ...unsplashPhotos]
  }
  
  if (source === 'pexels' || source === 'both') {
    const pexelsPhotos = await searchPexels(query, page, perPage)
    photos = [...photos, ...pexelsPhotos]
  }
  
  // Interleave results from both sources
  if (source === 'both') {
    const interleaved: StockPhoto[] = []
    const unsplash = photos.filter(p => p.source === 'unsplash')
    const pexels = photos.filter(p => p.source === 'pexels')
    const maxLen = Math.max(unsplash.length, pexels.length)
    
    for (let i = 0; i < maxLen; i++) {
      if (unsplash[i]) interleaved.push(unsplash[i])
      if (pexels[i]) interleaved.push(pexels[i])
    }
    photos = interleaved
  }
  
  return {
    photos: photos.slice(0, perPage * 2), // Return up to 2x perPage when using both
    totalResults: photos.length,
    page,
    perPage,
    source
  }
}

// Get photos by room type
export async function getPropertyPhotosByType(
  type: keyof typeof RE_PHOTO_QUERIES,
  count: number = 10
): Promise<StockPhoto[]> {
  const queries = RE_PHOTO_QUERIES[type]
  const randomQuery = queries[Math.floor(Math.random() * queries.length)]
  const result = await searchPropertyPhotos(randomQuery, { perPage: count })
  return result.photos
}

// Get a random hero image for property listings
export async function getHeroPropertyImage(): Promise<StockPhoto | null> {
  const types: (keyof typeof RE_PHOTO_QUERIES)[] = ['exterior', 'florida', 'luxury']
  const randomType = types[Math.floor(Math.random() * types.length)]
  const photos = await getPropertyPhotosByType(randomType, 1)
  return photos[0] || null
}

// Get collection of photos for a property listing
export async function getPropertyPhotoCollection(
  propertyType: 'house' | 'condo' | 'luxury' = 'house'
): Promise<{ [key: string]: StockPhoto[] }> {
  const roomTypes: (keyof typeof RE_PHOTO_QUERIES)[] = 
    propertyType === 'condo' 
      ? ['condo', 'kitchen', 'bathroom', 'bedroom', 'livingRoom']
      : propertyType === 'luxury'
        ? ['luxury', 'kitchen', 'bathroom', 'bedroom', 'backyard']
        : ['exterior', 'kitchen', 'bathroom', 'bedroom', 'backyard']
  
  const collection: { [key: string]: StockPhoto[] } = {}
  
  for (const type of roomTypes) {
    collection[type] = await getPropertyPhotosByType(type, 3)
  }
  
  return collection
}

// Search for neighborhood/location photos
export async function getLocationPhotos(
  location: string,
  count: number = 10
): Promise<StockPhoto[]> {
  const query = `${location} neighborhood homes`
  const result = await searchPropertyPhotos(query, { perPage: count })
  return result.photos
}
