// app/help/page.tsx
// Comprehensive Help Center

import Link from 'next/link'
import { Book, Users, Home, MessageSquare, Search, DollarSign, Shield, Phone, Mail, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Help Center | CR Realtor Platform',
  description: 'Complete guide to using CR Realtor Platform. Help for realtors, home buyers, and all social impact programs.'
}

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">CR</span>
              </div>
              <span className="text-xl font-bold">CR Realtor Platform</span>
            </Link>
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">← Back to Home</Link>
          </div>
        </div>
      </nav>

      <section className="py-12 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Book className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Everything you need to know about CR Realtor Platform
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Quick Start Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link href="/help/realtors" className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">For Realtors</h3>
                <p className="text-gray-600 mb-4">Learn how to use all features, serve clients, and maximize your business.</p>
                <div className="text-blue-600 font-semibold flex items-center">
                  Read Guide <ExternalLink className="w-4 h-4 ml-2" />
                </div>
              </Link>

              <Link href="/help/buyers" className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <Home className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">For Home Buyers</h3>
                <p className="text-gray-600 mb-4">Find your perfect home, understand programs, and navigate the buying process.</p>
                <div className="text-green-600 font-semibold flex items-center">
                  Read Guide <ExternalLink className="w-4 h-4 ml-2" />
                </div>
              </Link>

              <Link href="/help/javari" className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <MessageSquare className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-bold mb-3">Using Javari AI</h3>
                <p className="text-gray-600 mb-4">Get the most out of your AI assistant. Tips, tricks, and best practices.</p>
                <div className="text-purple-600 font-semibold flex items-center">
                  Read Guide <ExternalLink className="w-4 h-4 ml-2" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">All 20 Social Impact Programs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/veterans" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Veterans</div>
                <div className="text-sm text-gray-600">VA loans, $0 down</div>
              </Link>
              <Link href="/first-responders" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">First Responders</div>
                <div className="text-sm text-gray-600">Hero programs</div>
              </Link>
              <Link href="/seniors" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Seniors 55+</div>
                <div className="text-sm text-gray-600">Accessibility focus</div>
              </Link>
              <Link href="/first-time-buyers" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">First-Time Buyers</div>
                <div className="text-sm text-gray-600">Education & assistance</div>
              </Link>
              <Link href="/faith-based" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Faith-Based</div>
                <div className="text-sm text-gray-600">Churches & ministry</div>
              </Link>
              <Link href="/disabilities" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Disabilities</div>
                <div className="text-sm text-gray-600">ADA accessible</div>
              </Link>
              <Link href="/healthcare-workers" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Healthcare Workers</div>
                <div className="text-sm text-gray-600">Shift-friendly</div>
              </Link>
              <Link href="/teachers" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Teachers</div>
                <div className="text-sm text-gray-600">Education discounts</div>
              </Link>
              <Link href="/low-income" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Low-Income</div>
                <div className="text-sm text-gray-600">Affordable housing</div>
              </Link>
              <Link href="/single-parents" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Single Parents</div>
                <div className="text-sm text-gray-600">Flexible options</div>
              </Link>
              <Link href="/military-families" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Military Families</div>
                <div className="text-sm text-gray-600">PCS support</div>
              </Link>
              <Link href="/lgbtq" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">LGBTQ+ Friendly</div>
                <div className="text-sm text-gray-600">Inclusive communities</div>
              </Link>
              <Link href="/artists" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Artists & Creatives</div>
                <div className="text-sm text-gray-600">Studio spaces</div>
              </Link>
              <Link href="/refugees" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Refugees</div>
                <div className="text-sm text-gray-600">New Americans</div>
              </Link>
              <Link href="/remote-workers" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Remote Workers</div>
                <div className="text-sm text-gray-600">Home office ready</div>
              </Link>
              <Link href="/foster-families" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Foster Families</div>
                <div className="text-sm text-gray-600">Extra bedrooms</div>
              </Link>
              <Link href="/survivors" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">DV Survivors</div>
                <div className="text-sm text-gray-600">Safe housing</div>
              </Link>
              <Link href="/eco-living" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Eco-Living</div>
                <div className="text-sm text-gray-600">Sustainable homes</div>
              </Link>
              <Link href="/tiny-homes" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Tiny Homes</div>
                <div className="text-sm text-gray-600">Minimalist living</div>
              </Link>
              <Link href="/co-living" className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all">
                <div className="font-semibold text-gray-900">Co-Living</div>
                <div className="text-sm text-gray-600">Community housing</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-2">How do I get started as a realtor?</h3>
                <p className="text-gray-600">Sign up for a free account, complete your profile, and start accessing all 20 social impact programs immediately. No credit card required to start.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-2">What does Javari AI do?</h3>
                <p className="text-gray-600">Javari is your AI assistant who helps answer questions, recommend properties, provide market analysis, and guide clients through every program. Available 24/7 on every page.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-2">Are the calculators accurate?</h3>
                <p className="text-gray-600">Yes! All calculators use real lending criteria and are updated regularly. Results are estimates - final qualification requires lender approval.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-2">How much does it cost?</h3>
                <p className="text-gray-600">Free for home buyers. Realtors pay $399/month for unlimited access to all features and all 20 programs. Team and broker discounts available.</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-bold text-lg mb-2">Do you work nationwide?</h3>
                <p className="text-gray-600">Currently focused on Florida. National expansion planned for Q2 2026. Contact us about early access in your state.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our support team is here Monday-Friday, 9am-6pm EST
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@craudiovizai.com" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 inline-flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Support
            </a>
            <a href="tel:+12395551234" className="px-8 py-4 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 inline-flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Call Us
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/help/realtors" className="hover:text-white">For Realtors</Link></li>
                <li><Link href="/help/buyers" className="hover:text-white">For Buyers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Programs</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/veterans" className="hover:text-white">Veterans</Link></li>
                <li><Link href="/first-responders" className="hover:text-white">First Responders</Link></li>
                <li><Link href="/seniors" className="hover:text-white">Seniors</Link></li>
                <li><Link href="/first-time-buyers" className="hover:text-white">First-Time Buyers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><a href="https://craudiovizai.com/contact" className="hover:text-white">Contact</a></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Fort Myers, Florida</li>
                <li>support@craudiovizai.com</li>
                <li>(239) 555-1234</li>
                <li>Mon-Fri 9am-6pm EST</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
