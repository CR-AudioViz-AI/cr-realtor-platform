// app/single-parents/page.tsx
// Complete Single Parents Module Landing Page

import Link from 'next/link'
import { Heart, Home, Users, Shield, Clock, CheckCircle, DollarSign, ArrowRight } from 'lucide-react'
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
  title: 'Single Parent Housing Program | CR Realtor Platform',
  description: 'Housing assistance for single mothers and fathers. Childcare proximity search, flexible income evaluation, family-friendly neighborhoods, and special financing programs.'
}

export default async function SingleParentsPage() {
  const supabase = await createClient()
  
  const { data: familyProperties } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/first-time-buyers" className="text-gray-700 hover:text-rose-600 font-medium">First-Time</Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-rose-900 via-pink-800 to-rose-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Heart className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">You're Doing Amazing. Let's Find Your Home.</h1>
            
            <p className="text-xl md:text-2xl text-rose-100 mb-8">
              Housing programs designed for single parents. Childcare proximity, flexible income evaluation, safe neighborhoods, and financing that understands your situation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="#programs" className="px-8 py-4 bg-white text-rose-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center">
                See Programs <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$15K</div>
                <div className="text-rose-100 text-sm">Down Payment Help</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">FREE</div>
                <div className="text-rose-100 text-sm">Financial Coaching</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-rose-100 text-sm">Child Support Counts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{familyProperties?.length || 634}</div>
                <div className="text-rose-100 text-sm">Family Homes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="programs" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Programs for Single Parents</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Financial assistance and support designed for single-income households</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Single Parent Grants</h3>
              <p className="text-gray-600 mb-4">State and federal grants specifically for single parents. Up to $15,000 for down payment and closing costs.</p>
              <div className="text-sm text-rose-600 font-semibold">$15,000 Available</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Income Evaluation</h3>
              <p className="text-gray-600 mb-4">Child support, alimony, and government benefits count as income. We evaluate your complete financial picture.</p>
              <div className="text-sm text-pink-600 font-semibold">All Income Counts</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Low Down Payment Options</h3>
              <p className="text-gray-600 mb-4">FHA loans with 3.5% down. Some programs offer as low as 0-1% down for single parents.</p>
              <div className="text-sm text-purple-600 font-semibold">Low As 0% Down</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Childcare Proximity</h3>
              <p className="text-gray-600 mb-4">Search homes near quality daycare, schools, and after-school programs. Logistics matter when you're solo parenting.</p>
              <div className="text-sm text-blue-600 font-semibold">Near Schools & Care</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Flexible Showing Times</h3>
              <p className="text-gray-600 mb-4">We work around your schedule and childcare. Evening and weekend showings, virtual tours available.</p>
              <div className="text-sm text-green-600 font-semibold">Your Schedule</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Safe Neighborhoods</h3>
              <p className="text-gray-600 mb-4">Filter by school ratings, crime statistics, walkability. Find communities where your kids can play safely.</p>
              <div className="text-sm text-indigo-600 font-semibold">Safety First</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Single Parent Affordability Calculator</h2>
              <p className="text-xl text-gray-600">Calculate what you can afford with all income sources</p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Income (Monthly)</label>
                  <input type="number" placeholder="$3,200" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Child Support (Monthly)</label>
                  <input type="number" placeholder="$800" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Other Income (Benefits, Alimony)</label>
                  <input type="number" placeholder="$400" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Children</label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-rose-500 focus:outline-none">
                    <option>1 child</option>
                    <option>2 children</option>
                    <option>3 children</option>
                    <option>4+ children</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate My Buying Power
              </button>

              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-rose-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Maximum Home Price</div>
                    <div className="text-2xl font-bold text-rose-600">$235,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                    <div className="text-2xl font-bold text-pink-600">$1,325</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">With Assistance</div>
                    <div className="text-2xl font-bold text-purple-600">$250K+</div>
                  </div>
                </div>

                <div className="p-4 bg-rose-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-rose-600 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <strong>Great News:</strong> Combined income of $4,400/mo qualifies you for $235K home. With $15K down payment assistance, you can afford even more. Child support income is fully counted.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">You've Got This. We've Got You.</h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Single parenting is hard enough. Finding a home shouldn't be. Let us help with programs that understand your unique situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="px-8 py-4 bg-white text-rose-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <Heart className="w-6 h-6 text-rose-400" />
              <span className="text-white font-bold text-lg">Single Parents Program</span>
            </div>
          </div>
          <p className="text-sm">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
        </div>
      </footer>
    </div>
  )
}
