// lib/apis/fred-mortgage.ts
// Federal Reserve Economic Data (FRED) API - FREE
// Live mortgage rates updated weekly
// API Key: <FRED_API_KEY — from the vault, never in source>

export interface MortgageRate {
  date: string
  rate: number
  change: number
  changePercent: number
}

export interface MortgageRatesData {
  thirtyYear: MortgageRate
  fifteenYear: MortgageRate
  fiveOneArm: MortgageRate | null
  lastUpdated: string
  historicalData: {
    thirtyYear: { date: string; value: number }[]
    fifteenYear: { date: string; value: number }[]
  }
  marketTrend: 'rising' | 'falling' | 'stable'
  prediction: string
  sourceUrl: string
}

const FRED_API_KEY = process.env.FRED_API_KEY || (process.env.FRED_API_KEY ?? '')
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred'

// FRED Series IDs for mortgage rates
const SERIES = {
  MORTGAGE30US: 'MORTGAGE30US', // 30-Year Fixed Rate
  MORTGAGE15US: 'MORTGAGE15US', // 15-Year Fixed Rate
  MORTGAGE5US: 'MORTGAGE5US',   // 5/1 ARM (may not always be available)
}

async function fetchFredSeries(
  seriesId: string,
  limit: number = 52 // 1 year of weekly data
): Promise<{ date: string; value: number }[]> {
  try {
    const url = `${FRED_BASE_URL}/series/observations?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&sort_order=desc&limit=${limit}`
    
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}:`, response.status)
      return []
    }
    
    const data = await response.json()
    
    if (!data.observations || !Array.isArray(data.observations)) {
      return []
    }
    
    return data.observations
      .filter((obs: any) => obs.value !== '.')
      .map((obs: any) => ({
        date: obs.date,
        value: parseFloat(obs.value)
      }))
  } catch (error) {
    console.error(`FRED fetch error for ${seriesId}:`, error)
    return []
  }
}

function calculateChange(data: { date: string; value: number }[]): { change: number; changePercent: number } {
  if (data.length < 2) return { change: 0, changePercent: 0 }
  
  const current = data[0].value
  const previous = data[1].value
  const change = current - previous
  const changePercent = (change / previous) * 100
  
  return {
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100
  }
}

function determineMarketTrend(data: { date: string; value: number }[]): 'rising' | 'falling' | 'stable' {
  if (data.length < 4) return 'stable'
  
  // Compare last 4 weeks trend
  const recent = data.slice(0, 4)
  let risings = 0
  let fallings = 0
  
  for (let i = 0; i < recent.length - 1; i++) {
    if (recent[i].value > recent[i + 1].value) risings++
    else if (recent[i].value < recent[i + 1].value) fallings++
  }
  
  if (risings >= 2 && risings > fallings) return 'rising'
  if (fallings >= 2 && fallings > risings) return 'falling'
  return 'stable'
}

function generatePrediction(trend: string, currentRate: number): string {
  if (trend === 'rising') {
    return `Rates have been trending upward. Current 30-year rate of ${currentRate}% may continue to rise. Consider locking in soon if you're close to purchasing.`
  } else if (trend === 'falling') {
    return `Rates have been trending downward. Current 30-year rate of ${currentRate}% may have room to drop further. Monitor closely for optimal timing.`
  }
  return `Rates have been relatively stable around ${currentRate}%. This could be a good time to lock in if the rate fits your budget.`
}

export async function getLiveMortgageRates(): Promise<MortgageRatesData> {
  try {
    // Fetch all series in parallel
    const [thirtyYearData, fifteenYearData, fiveOneArmData] = await Promise.all([
      fetchFredSeries(SERIES.MORTGAGE30US, 52),
      fetchFredSeries(SERIES.MORTGAGE15US, 52),
      fetchFredSeries(SERIES.MORTGAGE5US, 12)
    ])
    
    // Calculate current rates and changes
    const thirtyYearChange = calculateChange(thirtyYearData)
    const fifteenYearChange = calculateChange(fifteenYearData)
    const fiveOneArmChange = fiveOneArmData.length >= 2 ? calculateChange(fiveOneArmData) : null
    
    // Determine market trend
    const marketTrend = determineMarketTrend(thirtyYearData)
    
    const currentThirtyYear = thirtyYearData[0]?.value || 0
    
    return {
      thirtyYear: {
        date: thirtyYearData[0]?.date || '',
        rate: currentThirtyYear,
        change: thirtyYearChange.change,
        changePercent: thirtyYearChange.changePercent
      },
      fifteenYear: {
        date: fifteenYearData[0]?.date || '',
        rate: fifteenYearData[0]?.value || 0,
        change: fifteenYearChange.change,
        changePercent: fifteenYearChange.changePercent
      },
      fiveOneArm: fiveOneArmData.length > 0 ? {
        date: fiveOneArmData[0].date,
        rate: fiveOneArmData[0].value,
        change: fiveOneArmChange?.change || 0,
        changePercent: fiveOneArmChange?.changePercent || 0
      } : null,
      lastUpdated: new Date().toISOString(),
      historicalData: {
        thirtyYear: thirtyYearData.slice(0, 52).reverse(),
        fifteenYear: fifteenYearData.slice(0, 52).reverse()
      },
      marketTrend,
      prediction: generatePrediction(marketTrend, currentThirtyYear),
      sourceUrl: 'https://fred.stlouisfed.org/series/MORTGAGE30US'
    }
  } catch (error) {
    console.error('Error fetching mortgage rates:', error)
    // Return fallback data
    return {
      thirtyYear: { date: '', rate: 6.85, change: 0, changePercent: 0 },
      fifteenYear: { date: '', rate: 6.10, change: 0, changePercent: 0 },
      fiveOneArm: null,
      lastUpdated: new Date().toISOString(),
      historicalData: { thirtyYear: [], fifteenYear: [] },
      marketTrend: 'stable',
      prediction: 'Unable to fetch live data. Showing estimated rates.',
      sourceUrl: 'https://fred.stlouisfed.org/series/MORTGAGE30US'
    }
  }
}

// Calculate monthly payment
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12
  const numPayments = termYears * 12
  
  if (monthlyRate === 0) return principal / numPayments
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  return Math.round(payment * 100) / 100
}

// Calculate total interest paid
export function calculateTotalInterest(
  principal: number,
  monthlyPayment: number,
  termYears: number
): number {
  return Math.round((monthlyPayment * termYears * 12 - principal) * 100) / 100
}

// Calculate affordability
export function calculateAffordability(
  monthlyIncome: number,
  monthlyDebts: number,
  downPayment: number,
  annualRate: number,
  termYears: number = 30,
  maxDTI: number = 0.43 // 43% max debt-to-income
): { maxHomePrice: number; maxMonthlyPayment: number; dti: number } {
  const maxTotalDebt = monthlyIncome * maxDTI
  const maxMortgagePayment = maxTotalDebt - monthlyDebts
  
  const monthlyRate = annualRate / 100 / 12
  const numPayments = termYears * 12
  
  let maxLoan: number
  if (monthlyRate === 0) {
    maxLoan = maxMortgagePayment * numPayments
  } else {
    maxLoan = maxMortgagePayment * (Math.pow(1 + monthlyRate, numPayments) - 1) / 
              (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
  }
  
  const maxHomePrice = maxLoan + downPayment
  
  return {
    maxHomePrice: Math.round(maxHomePrice),
    maxMonthlyPayment: Math.round(maxMortgagePayment * 100) / 100,
    dti: maxDTI * 100
  }
}

// Amortization schedule
export interface AmortizationEntry {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termYears: number
): AmortizationEntry[] {
  const monthlyRate = annualRate / 100 / 12
  const numPayments = termYears * 12
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears)
  
  const schedule: AmortizationEntry[] = []
  let balance = principal
  
  for (let month = 1; month <= numPayments; month++) {
    const interest = balance * monthlyRate
    const principalPaid = monthlyPayment - interest
    balance -= principalPaid
    
    schedule.push({
      month,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.max(0, Math.round(balance * 100) / 100)
    })
  }
  
  return schedule
}

// Compare loan scenarios
export interface LoanScenario {
  name: string
  rate: number
  termYears: number
  monthlyPayment: number
  totalInterest: number
  totalCost: number
}

export function compareLoanScenarios(
  principal: number,
  scenarios: { name: string; rate: number; termYears: number }[]
): LoanScenario[] {
  return scenarios.map(scenario => {
    const monthlyPayment = calculateMonthlyPayment(principal, scenario.rate, scenario.termYears)
    const totalInterest = calculateTotalInterest(principal, monthlyPayment, scenario.termYears)
    
    return {
      name: scenario.name,
      rate: scenario.rate,
      termYears: scenario.termYears,
      monthlyPayment,
      totalInterest,
      totalCost: principal + totalInterest
    }
  })
}
