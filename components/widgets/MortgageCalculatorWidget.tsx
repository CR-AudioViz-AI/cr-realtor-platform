// Mortgage Calculator - Lead Generation Widget
// Shows true cost, not just monthly payment

'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Percent, Calendar, TrendingUp, ArrowRight, Info } from 'lucide-react'

export default function MortgageCalculatorWidget() {
  const [homePrice, setHomePrice] = useState(400000)
  const [downPayment, setDownPayment] = useState(80000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState(30)
  const [propertyTax, setPropertyTax] = useState(1.2)
  const [insurance, setInsurance] = useState(1200)
  const [hoa, setHoa] = useState(0)
  const [showLeadCapture, setShowLeadCapture] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  // Calculate mortgage
  const loanAmount = homePrice - downPayment
  const monthlyRate = interestRate / 100 / 12
  const numPayments = loanTerm * 12
  
  const monthlyPrincipalInterest = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  const monthlyPropertyTax = (homePrice * (propertyTax / 100)) / 12
  const monthlyInsurance = insurance / 12
  const monthlyPMI = downPaymentPercent < 20 ? (loanAmount * 0.005) / 12 : 0
  
  const totalMonthlyPayment = monthlyPrincipalInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI + hoa
  
  const totalInterest = (monthlyPrincipalInterest * numPayments) - loanAmount
  const totalCost = homePrice + totalInterest + (monthlyPropertyTax * numPayments) + (monthlyInsurance * numPayments) + (monthlyPMI * numPayments)

  // Update down payment when price changes
  useEffect(() => {
    setDownPayment(Math.round(homePrice * (downPaymentPercent / 100)))
  }, [homePrice, downPaymentPercent])

  const handleDownPaymentChange = (value: number) => {
    setDownPayment(value)
    setDownPaymentPercent(Math.round((value / homePrice) * 100))
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num)
  }

  const handleGetPreApproved = async () => {
    if (!email || !name) {
      setShowLeadCapture(true)
      return
    }
    
    // Capture lead
    try {
      await fetch('/api/leads/mortgage-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, homePrice, downPayment, loanAmount,
          monthlyPayment: totalMonthlyPayment, interestRate,
          source: 'mortgage-calculator-widget'
        })
      })
    } catch (e) {
      console.error('Lead capture failed:', e)
    }
    
    // Redirect to pre-approval
    window.location.href = `https://rateunlock.com/pre-qualify?amount=${loanAmount}&rate=${interestRate}`
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Mortgage Calculator</h2>
        </div>
        <p className="text-white/90">See what you'll REALLY pay, not just the monthly</p>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <label className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Home Price</span>
                <span className="font-semibold text-gray-900">{formatCurrency(homePrice)}</span>
              </label>
              <input
                type="range"
                min="100000"
                max="2000000"
                step="5000"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <label className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Down Payment ({downPaymentPercent}%)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(downPayment)}</span>
              </label>
              <input
                type="range"
                min="0"
                max={homePrice * 0.5}
                step="5000"
                value={downPayment}
                onChange={(e) => handleDownPaymentChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              {downPaymentPercent < 20 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" /> PMI required below 20% down
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Interest Rate</span>
                <span className="font-semibold text-gray-900">{interestRate}%</span>
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Loan Term</label>
              <div className="flex gap-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => setLoanTerm(term)}
                    className={`flex-1 py-2 rounded-lg font-medium transition ${
                      loanTerm === term 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {term} yr
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Property Tax (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Insurance ($/yr)</label>
                <input
                  type="number"
                  value={insurance}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">HOA ($/month)</label>
              <input
                type="number"
                value={hoa}
                onChange={(e) => setHoa(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-4">
              <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
              <p className="text-4xl font-bold text-amber-600">{formatCurrency(totalMonthlyPayment)}</p>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal & Interest</span>
                  <span className="font-medium">{formatCurrency(monthlyPrincipalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Tax</span>
                  <span className="font-medium">{formatCurrency(monthlyPropertyTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance</span>
                  <span className="font-medium">{formatCurrency(monthlyInsurance)}</span>
                </div>
                {monthlyPMI > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>PMI</span>
                    <span className="font-medium">{formatCurrency(monthlyPMI)}</span>
                  </div>
                )}
                {hoa > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">HOA</span>
                    <span className="font-medium">{formatCurrency(hoa)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* True Cost Breakdown */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-red-800 mb-2">💡 What They Don't Tell You</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest Paid</span>
                  <span className="font-semibold text-red-600">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">True Total Cost</span>
                  <span className="font-semibold text-red-600">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            </div>

            {/* Lead Capture */}
            {showLeadCapture ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={handleGetPreApproved}
                  disabled={!name || !email}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  Get Pre-Approved <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLeadCapture(true)}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                Get Pre-Approved Today <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-500 text-center">
          Powered by <a href="https://rateunlock.com" className="text-amber-600 hover:underline">RateUnlock</a> | 
          Part of the <a href="https://javariproperty.com" className="text-amber-600 hover:underline">Javari Property</a> Ecosystem
        </p>
      </div>
    </div>
  )
}
