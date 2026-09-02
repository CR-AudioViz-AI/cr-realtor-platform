// components/ModuleFooter.tsx
// Reusable footer with help links for all social impact modules

import Link from 'next/link'
import { HelpCircle, BookOpen, Phone, Mail, MessageSquare } from 'lucide-react'

interface ModuleFooterProps {
  moduleName: string
  moduleIcon?: React.ReactNode
}

export default function ModuleFooter({ moduleName, moduleIcon }: ModuleFooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Help Section */}
      <section className="bg-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <h3 className="text-2xl font-bold text-white mb-2">Need Help With {moduleName}?</h3>
              <p className="text-gray-400">We're here to answer your questions</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Link href="/help" className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <div className="font-semibold text-white mb-1">Help Center</div>
                <div className="text-sm text-gray-400">Complete guides</div>
              </Link>
              
              <Link href="/help/realtors" className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors">
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-green-400" />
                <div className="font-semibold text-white mb-1">For Realtors</div>
                <div className="text-sm text-gray-400">Professional resources</div>
              </Link>
              
              <a href="mailto:support@craudiovizai.com" className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors">
                <Mail className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <div className="font-semibold text-white mb-1">Email Support</div>
                <div className="text-sm text-gray-400">support@craudiovizai.com</div>
              </a>
              
              <a href="tel:+12395551234" className="bg-gray-700 hover:bg-gray-600 rounded-lg p-6 text-center transition-colors">
                <Phone className="w-8 h-8 mx-auto mb-3 text-orange-400" />
                <div className="font-semibold text-white mb-1">Call Us</div>
                <div className="text-sm text-gray-400">(239) 555-1234</div>
              </a>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center space-x-2 bg-purple-900/30 px-6 py-3 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold">Javari AI is available 24/7</span>
                <span className="text-gray-400">- Click the chat button anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Company */}
          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><a href="https://craudiovizai.com/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Top Programs */}
          <div>
            <h4 className="text-white font-bold mb-4">Top Programs</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/veterans" className="hover:text-white transition-colors">Veterans</Link></li>
              <li><Link href="/seniors" className="hover:text-white transition-colors">Seniors 55+</Link></li>
              <li><Link href="/first-time-buyers" className="hover:text-white transition-colors">First-Time Buyers</Link></li>
              <li><Link href="/remote-workers" className="hover:text-white transition-colors">Remote Workers</Link></li>
            </ul>
          </div>

          {/* More Programs */}
          <div>
            <h4 className="text-white font-bold mb-4">More Programs</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/first-responders" className="hover:text-white transition-colors">First Responders</Link></li>
              <li><Link href="/healthcare-workers" className="hover:text-white transition-colors">Healthcare Workers</Link></li>
              <li><Link href="/teachers" className="hover:text-white transition-colors">Teachers</Link></li>
              <li><Link href="/disabilities" className="hover:text-white transition-colors">Accessibility</Link></li>
            </ul>
          </div>

          {/* All Programs */}
          <div>
            <h4 className="text-white font-bold mb-4">All Programs</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/lgbtq" className="hover:text-white transition-colors">LGBTQ+ Friendly</Link></li>
              <li><Link href="/eco-living" className="hover:text-white transition-colors">Eco-Living</Link></li>
              <li><Link href="/tiny-homes" className="hover:text-white transition-colors">Tiny Homes</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">View All 20 →</Link></li>
            </ul>
          </div>

          {/* For Realtors */}
          <div>
            <h4 className="text-white font-bold mb-4">For Realtors</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help/realtors" className="hover:text-white transition-colors">Realtor Guide</Link></li>
              <li><Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/help/javari" className="hover:text-white transition-colors">Using Javari AI</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {moduleIcon}
            <span className="text-white font-bold text-lg">{moduleName} Program</span>
          </div>
          <p className="text-sm mb-2">Part of CR AudioViz AI, LLC | Fort Myers, Florida</p>
          <p className="text-sm">© 2025 CR AudioViz AI, LLC. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
