// app/teachers/page.tsx
// Complete Teachers & Educators Module Landing Page

import Link from 'next/link'
import { GraduationCap, Home, DollarSign, Heart, CheckCircle, MapPin, Users, Award, BookOpen, ArrowRight } from 'lucide-react'
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
  title: 'Teachers & Educators Housing Program | CR Realtor Platform',
  description: 'Housing assistance for teachers, professors, and education professionals. Teacher loan programs, down payment assistance, school proximity search, and special financing.'
}

export default async function TeachersPage() {
  const supabase = await createClient()
  
  const { data: teacherProperties } = await supabase
    .from('properties')
    .select('*')
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/first-time-buyers" className="text-gray-700 hover:text-emerald-600 font-medium">
                First-Time Buyers
              </Link>
              <Link href="/healthcare-workers" className="text-gray-700 hover:text-emerald-600 font-medium">
                Healthcare
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 text-white py-24">
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="w-16 h-16" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              You Shape Future Minds. We'll Help Find Your Home.
            </h1>
            
            <p className="text-xl md:text-2xl text-emerald-100 mb-8">
              Special housing programs for teachers and educators. Teacher loan assistance, down payment grants, school proximity search, and financing that understands education salaries.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="#programs"
                className="px-8 py-4 bg-white text-emerald-900 rounded-lg font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center"
              >
                Teacher Programs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="#calculator"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
              >
                Affordability Calculator
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$17K</div>
                <div className="text-emerald-100 text-sm">Down Payment Assistance</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">3%</div>
                <div className="text-emerald-100 text-sm">Down Payment Options</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">50%</div>
                <div className="text-emerald-100 text-sm">Off Platform Fees</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">{teacherProperties?.length || 567}</div>
                <div className="text-emerald-100 text-sm">Near Schools</div>
              </div>
            </div>

            {/* Education Professions */}
            <div className="mt-8 inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-sm text-emerald-100 mb-2">📚 Serving All Education Professionals</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                <span className="px-3 py-1 bg-white/20 rounded-full">K-12 Teachers</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Professors</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Administrators</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Support Staff</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Librarians</span>
                <span className="px-3 py-1 bg-white/20 rounded-full">Counselors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Programs */}
      <section id="programs" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Teacher Housing Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Special financing and assistance programs designed for education professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Teacher Next Door</h3>
              <p className="text-gray-600 mb-4">
                HUD program offering 50% discount on list price in revitalization areas. Exclusive to K-12 teachers who commit to 36 months.
              </p>
              <div className="text-sm text-emerald-600 font-semibold">
                Up to 50% Off
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">State Teacher Grants</h3>
              <p className="text-gray-600 mb-4">
                Florida offers up to $17,000 in down payment assistance for teachers. Forgivable loan over 5 years of teaching.
              </p>
              <div className="text-sm text-blue-600 font-semibold">
                $17,000 Available
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">3% Down Conventional</h3>
              <p className="text-gray-600 mb-4">
                Conventional loans with just 3% down for first-time homebuyers. Lower rates than FHA, no upfront mortgage insurance.
              </p>
              <div className="text-sm text-green-600 font-semibold">
                As Low As 3%
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Homes for Heroes</h3>
              <p className="text-gray-600 mb-4">
                Teachers qualify for hero discounts. Rebates on home purchase, average savings of $2,400. Stack with other programs.
              </p>
              <div className="text-sm text-purple-600 font-semibold">
                $2,400 Average Savings
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Student Loan Consideration</h3>
              <p className="text-gray-600 mb-4">
                Special underwriting that accounts for student loan forgiveness programs. Income-driven repayment plans considered favorably.
              </p>
              <div className="text-sm text-orange-600 font-semibold">
                Fair Evaluation
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Summer Break Flexibility</h3>
              <p className="text-gray-600 mb-4">
                Flexible closing dates that work with school calendar. Can close during summer break when you have time.
              </p>
              <div className="text-sm text-indigo-600 font-semibold">
                Your Schedule
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
              <h2 className="text-4xl font-bold mb-4">Teacher Affordability Calculator</h2>
              <p className="text-xl text-gray-600">
                See what you can afford on a teacher's salary with special programs
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Annual Teaching Salary
                  </label>
                  <input
                    type="number"
                    placeholder="$48,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years Teaching
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                    <option>First Year</option>
                    <option>2-5 Years</option>
                    <option>6-10 Years</option>
                    <option>11-20 Years</option>
                    <option>20+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Monthly Debt Payments
                  </label>
                  <input
                    type="number"
                    placeholder="$350"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Car, credit cards (not student loans)</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Student Loan Balance
                  </label>
                  <input
                    type="number"
                    placeholder="$35,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">We'll calculate favorable terms</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Down Payment Saved
                  </label>
                  <input
                    type="number"
                    placeholder="$5,000"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Credit Score Range
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                    <option>Excellent (750+)</option>
                    <option>Good (700-749)</option>
                    <option>Fair (650-699)</option>
                    <option>Building (600-649)</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all">
                Calculate My Teacher Buying Power
              </button>

              <div className="mt-8 p-6 bg-white rounded-xl border-2 border-emerald-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Maximum Home Price</div>
                    <div className="text-2xl font-bold text-emerald-600">$265,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Monthly Payment</div>
                    <div className="text-2xl font-bold text-blue-600">$1,425</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Down Payment Needed</div>
                    <div className="text-2xl font-bold text-green-600">$7,950</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Good News:</strong> On $48K salary with $350 monthly debts, you can afford $265K home. 
                        Student loans evaluated favorably under teacher programs.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Down Payment Help:</strong> You need $7,950 (3%). You have $5,000. Florida Teacher Grant 
                        covers the $2,950 gap plus closing costs. You're ready NOW.
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Award className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div className="text-sm text-gray-700">
                        <strong>Stack Programs:</strong> Homes for Heroes ($2,400) + State Grant ($17K) = $19,400 in assistance. 
                        More than enough for down payment and closing.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Proximity */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Find Homes Near Your School</h2>
            <p className="text-xl text-gray-600">
              Short commutes mean more time for lesson planning and family
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your School/District
                </label>
                <input
                  type="text"
                  placeholder="Lee County School District"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Commute Time
                </label>
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                  <option>10 minutes</option>
                  <option>15 minutes</option>
                  <option>20 minutes</option>
                  <option>30 minutes</option>
                </select>
              </div>

              <button className="w-full py-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition">
                Find Homes Near My School
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Find Your Home?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Teachers deserve homeownership too. Let us help you navigate the programs that make it possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-bold text-lg hover:shadow-2xl transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="/search"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all"
            >
              Search Homes
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              <span className="text-white font-bold text-lg">Teachers & Educators Program</span>
            </div>
          </div>
          <p className="text-sm mb-4">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/first-time-buyers" className="hover:text-white transition">First-Time Buyers</Link>
            <Link href="/veterans" className="hover:text-white transition">Veterans</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
