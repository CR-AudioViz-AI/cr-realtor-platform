import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Phone, Mail, MapPin, Award, Home, Users, Star } from 'lucide-react'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

export const revalidate = 60

export const metadata = {
  title: 'Our Team | CR Realtor Platform',
  description: 'Meet our experienced real estate professionals serving Southwest Florida'
}

export default async function TeamPage() {
  const supabase = await createClient()
  
  const { data: agents } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'agent')
    .eq('active', true)
    .order('experience_years', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CR Realtor Platform</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/properties" className="text-gray-600 hover:text-blue-600 transition">
              Properties
            </Link>
            <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold mb-4">Meet Our Team</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Experienced real estate professionals dedicated to helping you find your perfect property in Southwest Florida.
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto px-4 py-16">
        {agents && agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agents.map((agent) => {
              const specialties = agent.specialties as string[] | null
              const displayName = [agent.first_name, agent.last_name].filter(Boolean).join(' ')
              const initials = `${agent.first_name?.[0] || ''}${agent.last_name?.[0] || ''}`
              
              return (
                <div
                  key={agent.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Agent Photo/Avatar */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {agent.avatar_url ? (
                      <img
                        src={agent.avatar_url}
                        alt={displayName}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-4xl font-bold border-4 border-white/30">
                        {initials}
                      </div>
                    )}
                  </div>
                  
                  {/* Agent Info */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{displayName}</h2>
                    <p className="text-blue-600 font-medium mb-3">Real Estate Professional</p>
                    
                    {agent.license_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Award className="w-4 h-4" />
                        <span>License: {agent.license_number}</span>
                      </div>
                    )}
                    
                    {agent.experience_years && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{agent.experience_years}+ years experience</span>
                      </div>
                    )}
                    
                    {agent.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{agent.bio}</p>
                    )}
                    
                    {/* Specialties */}
                    {specialties && specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {specialties.slice(0, 3).map((specialty, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Contact */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      {agent.phone && (
                        <a
                          href={`tel:${agent.phone}`}
                          className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{agent.phone}</span>
                        </a>
                      )}
                      {agent.email && (
                        <a
                          href={`mailto:${agent.email}`}
                          className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition text-sm"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{agent.email}</span>
                        </a>
                      )}
                    </div>
                    
                    {/* CTA */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <a
                        href={`tel:${agent.phone || ''}`}
                        className="py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition text-center"
                      >
                        Call
                      </a>
                      <a
                        href={`mailto:${agent.email || ''}`}
                        className="py-2 px-4 border border-blue-600 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition text-center"
                      >
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Agents Yet</h2>
            <p className="text-gray-600">Check back soon to meet our team.</p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Our experienced team is here to help you every step of the way.
          </p>
          <Link
            href="/properties"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Browse Properties
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} CR AudioViz AI, LLC. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
