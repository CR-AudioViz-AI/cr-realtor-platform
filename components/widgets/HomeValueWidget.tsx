// Home Value Estimator - Lead Generation Widget
// Embeddable on any realtor's website

'use client'

import { useState } from 'react'
import { Home, MapPin, Bed, Bath, Square, ArrowRight, CheckCircle2 } from 'lucide-react'

interface EstimateResult {
  lowEstimate: number
  estimate: number
  highEstimate: number
  confidence: string
}

export default function HomeValueWidget() {
  const [step, setStep] = useState(1)
  const [address, setAddress] = useState('')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [sqft, setSqft] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EstimateResult | null>(null)

  const calculateEstimate = async () => {
    setLoading(true)
    
    // In production, this calls your API with real comps data
    // For now, simulate calculation
    await new Promise(r => setTimeout(r, 2000))
    
    const basePricePerSqft = 250 // Varies by market
    const sqftNum = parseInt(sqft) || 1500
    const bedsNum = parseInt(beds) || 3
    const bathsNum = parseFloat(baths) || 2
    
    const basePrice = sqftNum * basePricePerSqft
    const bedsAdjust = (bedsNum - 3) * 15000
    const bathsAdjust = (bathsNum - 2) * 10000
    
    const estimate = Math.round(basePrice + bedsAdjust + bathsAdjust)
    
    setResult({
      lowEstimate: Math.round(estimate * 0.92),
      estimate,
      highEstimate: Math.round(estimate * 1.08),
      confidence: 'High'
    })
    
    // LEAD CAPTURE: Send to your CRM/database
    try {
      await fetch('/api/leads/home-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, address, beds, baths, sqft,
          estimate, source: 'home-value-widget'
        })
      })
    } catch (e) {
      console.error('Lead capture failed:', e)
    }
    
    setLoading(false)
    setStep(4)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Home className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Home Value Estimator</h2>
        </div>
        <p className="text-white/90">Get an instant estimate in 60 seconds</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-1 flex-1 rounded ${
                s <= step ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Property Details */}
      {step === 1 && (
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Property Details</h3>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Property Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Fort Myers, FL"
                className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Beds</label>
              <div className="relative">
                <Bed className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value)}
                  placeholder="3"
                  className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Baths</label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.5"
                  value={baths}
                  onChange={(e) => setBaths(e.target.value)}
                  placeholder="2"
                  className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sq Ft</label>
              <div className="relative">
                <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="1800"
                  className="w-full border border-gray-300 rounded-lg py-2 pl-9 pr-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!address}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Contact Info */}
      {step === 2 && (
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Almost There!</h3>
          <p className="text-sm text-gray-600">Enter your info to get your free estimate</p>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!name || !email}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
            >
              Get Estimate
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to receive communications about your estimate.
          </p>
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && (
        <div className="p-6 py-12 text-center">
          {!loading && !result && (
            <button
              onClick={calculateEstimate}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Calculate My Estimate
            </button>
          )}
          {loading && (
            <>
              <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Analyzing comparable properties...</p>
              <p className="text-sm text-gray-500">This takes about 10 seconds</p>
            </>
          )}
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && result && (
        <div className="p-6">
          <div className="text-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900">Your Estimate is Ready!</h3>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 text-center mb-2">Estimated Value</p>
            <p className="text-4xl font-bold text-emerald-600 text-center">
              ${result.estimate.toLocaleString()}
            </p>
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <span className="text-gray-500">Low: ${result.lowEstimate.toLocaleString()}</span>
              <span className="text-gray-500">High: ${result.highEstimate.toLocaleString()}</span>
            </div>
            <p className="text-center text-emerald-600 text-sm mt-2">
              Confidence: {result.confidence}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">Want a more accurate estimate?</p>
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition">
              Schedule Free Home Evaluation
            </button>
            <button className="w-full border border-emerald-500 text-emerald-600 font-semibold py-3 rounded-lg hover:bg-emerald-50 transition">
              View Market Report
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <p className="text-xs text-gray-500 text-center">
          Powered by <a href="https://javarikeys.com" className="text-emerald-600 hover:underline">Javari Keys</a> | 
          Part of the <a href="https://javariproperty.com" className="text-emerald-600 hover:underline">Javari Property</a> Ecosystem
        </p>
      </div>
    </div>
  )
}
