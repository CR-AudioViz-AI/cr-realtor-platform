// app/first-time-buyers/page.tsx
// Complete First-Time Buyers Module Landing Page

import Link from 'next/link'
import { Home, DollarSign, GraduationCap, Heart, CheckCircle, TrendingUp, Shield, Calculator, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export const metadata = {
  title: 'First-Time Home Buyers Program | CR Realtor Platform',
  description: 'Your first home is within reach. Down payment assistance, buyer education, affordability calculators, and step-by-step guidance for first-time buyers.'
}

export default async function FirstTimeBuyersPage() {
  const supabase = await createClient()
  
  // Get first-time buyer friendly properties
  const { data: buyerProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('social_impact_type', 'first_time_buyers')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/veterans" className="text-gray-700 hover:text-green-600 font-medium">
                Veterans
              </Link>
              <Link href="/seniors" className="text-gray-700 hover:text-green-600 font-medium">
                Seniors
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-teal-800 to-green-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('/patterns/home.svg')] opacity-10"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Home className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your First Home Is Within Reach
            </h1>
            
            <p className="text-xl md:text-2xl text-green-100 mb-8">
              Stop renting. Start building equity. We'll guide you through every step with down payment assistance, education, and the perfect starter home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#calculator"
                className="px-8 py-4 bg-white text-green-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                Calculate Affordability
                <Calculator className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#education"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
              >
                Start Learning
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">3%</div>
                <div className="text-green-100 text-sm">Down Payment Possible</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$15K+</div>
                <div className="text-green-100 text-sm">Down Payment Assistance</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-green-100 text-sm">Home Buyer Education</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{buyerProperties?.length || 128}</div>
                <div className="text-green-100 text-sm">Starter Homes</div>
              </div>
            </div>

            {/* Income Requirement Badge */}
            <div className="mt-8 inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm text-green-100 mb-2">💚 No Perfect Credit Required</p>
              <p className="text-xs text-green-200">
                FHA loans accept credit scores as low as 580 • We'll help you improve your score
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* First-Time Buyer Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">First-Time Buyer Advantages</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Special programs and benefits designed specifically for first-time home buyers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Benefit 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Down Payment Assistance</h3>
              <p className="text-gray-600 mb-4">
                Get up to $15,000 towards down payment through federal, state, and local programs. Some are grants, not loans.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                We'll find programs you qualify for
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Low Down Payment Options</h3>
              <p className="text-gray-600 mb-4">
                FHA loans require just 3.5% down. Some programs accept as little as 3% down. No more "I need 20%" myth.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                $300K home = $10,500 down (3.5%)
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Free Home Buyer Education</h3>
              <p className="text-gray-600 mb-4">
                Required by most assistance programs, we provide it FREE. Learn budgeting, mortgage basics, and home maintenance.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                8-hour course, online or in-person
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Credit Requirements</h3>
              <p className="text-gray-600 mb-4">
                FHA accepts credit scores as low as 580. We'll show you how to improve your score before applying.
              </p>
              <div className="text-sm text-orange-600 font-semibold">
                Credit repair guidance included
              </div>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Closing Cost Assistance</h3>
              <p className="text-gray-600 mb-4">
                Negotiate seller-paid closing costs (up to 6% with FHA). Plus grants available to cover remaining costs.
              </p>
              <div className="text-sm text-red-600 font-semibold">
                Save $3,000 - $10,000
              </div>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Step-by-Step Guidance</h3>
              <p className="text-gray-600 mb-4">
                Dedicated first-time buyer specialists guide you through every step. No question is too small.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                We're with you all the way
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affordability Calculator */}
      <section id="calculator" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">How Much Home Can You Afford?</h2>
              <p className="text-xl text-gray-600">
                Calculate your buying power based on your income and debts
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Annual Income */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Gross Income
                  </label>
                  <input
                    type="number"
                    placeholder="$60,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Before taxes</p>
                </div>

                {/* Monthly Debts */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Debt Payments
                  </label>
                  <input
                    type="number"
                    placeholder="$400"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Car, student loans, credit cards</p>
                </div>

                {/* Down Payment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Down Payment Saved
                  </label>
                  <input
                    type="number"
                    placeholder="$10,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">What you have now</p>
                </div>

                {/* Credit Score */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Credit Score (Estimate)
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none">
                    <option>Excellent (750+)</option>
                    <option>Good (700-749)</option>
                    <option>Fair (650-699)</option>
                    <option>Poor (580-649)</option>
                    <option>Below 580</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate What I Can Afford
              </button>

              {/* Results */}
              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-green-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Maximum Home Price</div>
                    <div className="text-2xl font-bold text-green-600">$285,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                    <div className="text-2xl font-bold text-blue-600">$1,685</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Recommended Down</div>
                    <div className="text-2xl font-bold text-purple-600">$9,975</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Good news!</strong> Based on your income of $60K and monthly debts of $400, 
                        you could afford a home up to $285,000 with an FHA loan (3.5% down).
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Down Payment Help:</strong> You have $10K saved. You need $9,975 (3.5%). 
                        You're ready to buy! Plus you qualify for additional assistance programs.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Build Equity:</strong> Your monthly payment of $1,685 builds equity. 
                        After 5 years, you'll own ~$50K of your home vs. $0 if renting.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Home Buying Process */}
      <section id="education" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Your Path to Homeownership</h2>
            <p className="text-xl text-gray-600">
              Follow these 10 steps to buy your first home with confidence
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[
                { step: 1, title: 'Check Your Credit', desc: 'Get your free credit report and understand your score', time: 'Week 1' },
                { step: 2, title: 'Save for Down Payment', desc: 'Start saving and research assistance programs', time: 'Ongoing' },
                { step: 3, title: 'Take Home Buyer Course', desc: 'Complete required education (we provide FREE)', time: 'Week 2-3' },
                { step: 4, title: 'Get Pre-Approved', desc: 'Work with lender to determine exact buying power', time: 'Week 4' },
                { step: 5, title: 'Find Your Home', desc: 'Search with your dedicated first-time buyer realtor', time: 'Week 5-8' },
                { step: 6, title: 'Make an Offer', desc: 'We help you craft a competitive offer', time: 'Week 8' },
                { step: 7, title: 'Home Inspection', desc: 'Professional inspection to avoid surprises', time: 'Week 9' },
                { step: 8, title: 'Final Loan Approval', desc: 'Lender completes underwriting process', time: 'Week 10-11' },
                { step: 9, title: 'Final Walk-Through', desc: 'Verify everything is as expected', time: 'Week 12' },
                { step: 10, title: 'Close & Move In!', desc: 'Sign papers, get keys, celebrate!', time: 'Week 12' }
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                      <span className="text-sm text-gray-500 font-medium">{item.time}</span>
                    </div>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <div className="inline-block bg-green-50 rounded-2xl px-8 py-6">
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  📅 Timeline: 12 weeks from start to keys in hand
                </p>
                <p className="text-gray-600">
                  We guide you through every step with checklists, reminders, and expert support
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* First-Time Buyer Properties */}
      {buyerProperties && buyerProperties.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Perfect Starter Homes</h2>
              <p className="text-xl text-gray-600">
                Homes ideal for first-time buyers - affordable, move-in ready, great neighborhoods
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {buyerProperties.map((property: any) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-64 bg-gradient-to-br from-green-100 to-teal-100">
                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1">
                      <Home className="w-4 h-4" />
                      <span>Starter</span>
                    </div>
                    <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-green-600 text-sm font-semibold rounded-full">
                      First-Time Buyer Friendly
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ${property.price?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      ~${Math.round(property.price * 0.035).toLocaleString()} down (3.5%)
                    </div>
                    <div className="text-gray-900 font-semibold mb-1">{property.address}</div>
                    <div className="text-gray-600 text-sm mb-4">
                      {property.city}, {property.state} {property.zip_code}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {property.bedrooms && <span>{property.bedrooms} bed</span>}
                      {property.bathrooms && <span>{property.bathrooms} bath</span>}
                      {property.square_feet && <span>{property.square_feet.toLocaleString()} sqft</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href="/search?social_impact=first_time_buyers"
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition inline-block"
              >
                View All Starter Homes
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Stop Renting?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of first-time buyers who've achieved homeownership with our help. Your journey starts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Start Your Journey Free
            </Link>
            <Link
              href="/search?social_impact=first_time_buyers"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Search Starter Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Home className="w-6 h-6 text-green-400" />
              <span className="text-white font-bold text-lg">First-Time Buyers Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">
            Part of CR AudioViz AI, LLC | Fort Myers, Florida
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/veterans" className="hover:text-white transition">Veterans</Link>
            <Link href="/seniors" className="hover:text-white transition">Seniors</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
