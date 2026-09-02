'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Percent, Calendar, TrendingDown, Info, RefreshCw } from 'lucide-react'

interface MortgageResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  principalAndInterest: number
  propertyTax: number
  insurance: number
  pmi: number
}

export default function MortgageCalculator({ 
  initialPrice = 0,
  compact = false 
}: { 
  initialPrice?: number
  compact?: boolean 
}) {
  const [homePrice, setHomePrice] = useState(initialPrice || 400000)
  const [downPayment, setDownPayment] = useState(80000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6.75)
  const [loanTerm, setLoanTerm] = useState(30)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.1) // Florida average
  const [insuranceRate, setInsuranceRate] = useState(0.5)
  const [includePMI, setIncludePMI] = useState(false)
  const [result, setResult] = useState<MortgageResult | null>(null)
  const [currentRates, setCurrentRates] = useState<{rate30: number, rate15: number} | null>(null)
  const [loadingRates, setLoadingRates] = useState(false)

  // Sync down payment with percentage
  useEffect(() => {
    const newDownPayment = Math.round(homePrice * (downPaymentPercent / 100))
    setDownPayment(newDownPayment)
    setIncludePMI(downPaymentPercent < 20)
  }, [homePrice, downPaymentPercent])

  // Calculate mortgage
  useEffect(() => {
    calculateMortgage()
  }, [homePrice, downPayment, interestRate, loanTerm, propertyTaxRate, insuranceRate, includePMI])

  // Fetch current rates from FRED API
  const fetchCurrentRates = async () => {
    setLoadingRates(true)
    try {
      const res = await fetch('/api/mortgage-rates')
      if (res.ok) {
        const data = await res.json()
        setCurrentRates(data)
        if (data.rate30) {
          setInterestRate(data.rate30)
        }
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error)
    }
    setLoadingRates(false)
  }

  const calculateMortgage = () => {
    const principal = homePrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const numPayments = loanTerm * 12

    // Principal & Interest (P&I)
    let monthlyPI = 0
    if (monthlyRate > 0) {
      monthlyPI = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    } else {
      monthlyPI = principal / numPayments
    }

    // Property Tax (monthly)
    const monthlyTax = (homePrice * (propertyTaxRate / 100)) / 12

    // Insurance (monthly)
    const monthlyInsurance = (homePrice * (insuranceRate / 100)) / 12

    // PMI (if down payment < 20%)
    let monthlyPMI = 0
    if (includePMI && downPaymentPercent < 20) {
      monthlyPMI = (principal * 0.005) / 12 // Approximately 0.5% of loan annually
    }

    const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI
    const totalPayment = totalMonthly * numPayments
    const totalInterest = (monthlyPI * numPayments) - principal

    setResult({
      monthlyPayment: totalMonthly,
      totalPayment,
      totalInterest,
      principalAndInterest: monthlyPI,
      propertyTax: monthlyTax,
      insurance: monthlyInsurance,
      pmi: monthlyPMI,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Quick Calculator</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Home Price</label>
            <input
              type="number"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Down (%)</label>
              <input
                type="number"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Rate (%)</label>
              <input
                type="number"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-xs text-gray-500">Est. Monthly Payment</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(result.monthlyPayment)}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mortgage Calculator</h2>
              <p className="text-blue-100 text-sm">Estimate your monthly payments</p>
            </div>
          </div>
          <button
            onClick={fetchCurrentRates}
            disabled={loadingRates}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loadingRates ? 'animate-spin' : ''}`} />
            Get Current Rates
          </button>
        </div>
        
        {currentRates && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-blue-100 text-xs">30-Year Fixed</p>
              <p className="text-2xl font-bold">{currentRates.rate30}%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-blue-100 text-xs">15-Year Fixed</p>
              <p className="text-2xl font-bold">{currentRates.rate15}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Home Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                Home Price
              </label>
              <input
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="range"
                min="100000"
                max="5000000"
                step="10000"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>

            {/* Down Payment */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <TrendingDown className="w-4 h-4 text-gray-400" />
                Down Payment
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setDownPayment(val)
                      setDownPaymentPercent(Math.round((val / homePrice) * 100))
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
              </div>
              {downPaymentPercent < 20 && (
                <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  PMI typically required below 20% down
                </p>
              )}
            </div>

            {/* Interest Rate */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Percent className="w-4 h-4 text-gray-400" />
                Interest Rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.125"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Loan Term
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => setLoanTerm(term)}
                    className={`py-3 rounded-xl font-medium transition ${
                      loanTerm === term
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {term} Years
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
                Advanced Options
              </summary>
              <div className="mt-4 space-y-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Property Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={propertyTaxRate}
                      onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Insurance Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={insuranceRate}
                      onChange={(e) => setInsuranceRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {/* Monthly Payment */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center">
                <p className="text-sm text-gray-600 mb-1">Estimated Monthly Payment</p>
                <p className="text-4xl font-bold text-blue-600">
                  {formatCurrency(result.monthlyPayment)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Loan Amount: {formatCurrency(homePrice - downPayment)}
                </p>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Principal & Interest</span>
                    <span className="font-medium">{formatCurrency(result.principalAndInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Property Tax</span>
                    <span className="font-medium">{formatCurrency(result.propertyTax)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Home Insurance</span>
                    <span className="font-medium">{formatCurrency(result.insurance)}</span>
                  </div>
                  {result.pmi > 0 && (
                    <div className="flex justify-between items-center text-amber-600">
                      <span>PMI</span>
                      <span className="font-medium">{formatCurrency(result.pmi)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Monthly</span>
                    <span className="font-bold text-blue-600">{formatCurrency(result.monthlyPayment)}</span>
                  </div>
                </div>
              </div>

              {/* Loan Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Total Interest</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(result.totalInterest)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Total Cost</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(result.totalPayment)}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-blue-600 rounded-2xl p-6 text-white text-center">
                <p className="font-semibold mb-2">Ready to get pre-approved?</p>
                <p className="text-sm text-blue-100 mb-4">
                  Tony Harvey can connect you with trusted lenders
                </p>
                <a
                  href="https://craudiovizai.com/contact"
                  className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition"
                >
                  Contact Tony
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
