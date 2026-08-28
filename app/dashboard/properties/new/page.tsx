'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Save, Loader2, DollarSign, Home, Factory, Store, Plus, Minus, MapPin } from 'lucide-react'
import Link from 'next/link'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

const ROOM_TYPES = [
  'Living Room', 'Family Room', 'Den', 'Office', 'Dining Room', 'Kitchen',
  'Master Bedroom', 'Bedroom 2', 'Bedroom 3', 'Bedroom 4', 'Bedroom 5',
  'Master Bath', 'Full Bath', 'Half Bath', 'Laundry Room', 'Garage',
  'Bonus Room', 'Loft', 'Basement', 'Attic', 'Sunroom', 'Florida Room'
]

const EXTERIOR_FEATURES = [
  'Pool', 'Pool Cage', 'Heated Pool', 'Spa/Hot Tub', 'Lanai', 'Screened Lanai',
  'Patio', 'Deck', 'Dock', 'Boat Lift', 'Fence', 'Sprinkler System',
  'Outdoor Kitchen', 'Fire Pit', 'Gazebo', 'Shed', 'Workshop', 'RV Hookup'
]

const INTERIOR_FEATURES = [
  'Hardwood Floors', 'Tile Floors', 'Carpet', 'Crown Molding', 'Tray Ceiling',
  'Vaulted Ceiling', 'Fireplace', 'Wet Bar', 'Walk-in Closet', 'Built-in Shelving',
  'Smart Home', 'Security System', 'Central Vacuum', 'Intercom', 'Elevator'
]

const APPLIANCES = [
  'Refrigerator', 'Dishwasher', 'Microwave', 'Oven/Range', 'Washer', 'Dryer',
  'Disposal', 'Trash Compactor', 'Wine Cooler', 'Ice Maker', 'Water Softener'
]

const COMMUNITY_FEATURES = [
  'HOA', 'Gated Community', 'Golf Course', 'Tennis Courts', 'Community Pool',
  'Clubhouse', 'Fitness Center', 'Playground', 'Dog Park', 'Walking Trails'
]

interface Room { type: string; dimensions: string; features: string }

export default function NewPropertyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('basic')
  
  const [formData, setFormData] = useState({
    title: '', address: '', city: '', state: 'FL', zip_code: '', county: '',
    category: 'residential', property_type: 'single_family', listing_type: 'for_sale',
    price: '', rent_amount: '', rent_frequency: 'monthly', security_deposit: '',
    lease_term_months: '', bedrooms: '', bathrooms: '', sqft: '', lot_size: '',
    year_built: '', available_date: '', pets_allowed: false, furnished: false,
    status: 'active', description: '', mls_id: '',
    garage_spaces: '', stories: '', construction: '', roof_type: '', cooling: '', heating: '',
    water_source: '', sewer: '', hoa_fee: '', hoa_frequency: 'monthly'
  })

  const [rooms, setRooms] = useState<Room[]>([])
  const [exteriorFeatures, setExteriorFeatures] = useState<string[]>([])
  const [interiorFeatures, setInteriorFeatures] = useState<string[]>([])
  const [appliances, setAppliances] = useState<string[]>([])
  const [communityFeatures, setCommunityFeatures] = useState<string[]>([])

  const propertyCategories = [
    { value: 'residential', label: 'Residential', icon: Home },
    { value: 'commercial', label: 'Commercial', icon: Store },
    { value: 'industrial', label: 'Industrial', icon: Factory },
    { value: 'land', label: 'Land', icon: Building2 },
  ]

  const propertyTypes: Record<string, { value: string; label: string }[]> = {
    residential: [
      { value: 'single_family', label: 'Single Family' },
      { value: 'condo', label: 'Condo' },
      { value: 'townhouse', label: 'Townhouse' },
      { value: 'villa', label: 'Villa' },
      { value: 'mobile_home', label: 'Mobile Home' },
      { value: 'multi_family', label: 'Multi-Family' },
    ],
    commercial: [
      { value: 'office', label: 'Office' },
      { value: 'retail', label: 'Retail' },
      { value: 'restaurant', label: 'Restaurant' },
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'mixed_use', label: 'Mixed Use' },
    ],
    industrial: [
      { value: 'warehouse', label: 'Warehouse' },
      { value: 'manufacturing', label: 'Manufacturing' },
      { value: 'flex_space', label: 'Flex Space' },
    ],
    land: [
      { value: 'residential_lot', label: 'Residential Lot' },
      { value: 'commercial_lot', label: 'Commercial Lot' },
      { value: 'agricultural', label: 'Agricultural' },
    ],
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const toggleFeature = (feature: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(feature)) {
      setList(list.filter(f => f !== feature))
    } else {
      setList([...list, feature])
    }
  }

  const addRoom = () => {
    setRooms([...rooms, { type: '', dimensions: '', features: '' }])
  }

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index))
  }

  const updateRoom = (index: number, field: keyof Room, value: string) => {
    const updated = [...rooms]
    updated[index][field] = value
    setRooms(updated)
  }

  const generateDescription = () => {
    let desc = `Beautiful ${formData.property_type.replace('_', ' ')} `
    if (formData.bedrooms) desc += `with ${formData.bedrooms} bedrooms `
    if (formData.bathrooms) desc += `and ${formData.bathrooms} bathrooms. `
    if (formData.sqft) desc += `${parseInt(formData.sqft).toLocaleString()} sq ft of living space. `
    if (exteriorFeatures.length > 0) {
      desc += `Features include: ${exteriorFeatures.slice(0, 5).join(', ')}. `
    }
    if (interiorFeatures.length > 0) {
      desc += `Interior highlights: ${interiorFeatures.slice(0, 5).join(', ')}. `
    }
    setFormData(prev => ({ ...prev, description: desc }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const propertyData = {
        ...formData,
        agent_id: user.id,
        listing_agent_id: user.id,
        price: formData.price ? parseFloat(formData.price) : null,
        rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms) : null,
        sqft: formData.sqft ? parseInt(formData.sqft) : null,
        lot_size: formData.lot_size ? parseFloat(formData.lot_size) : null,
        year_built: formData.year_built ? parseInt(formData.year_built) : null,
        garage_spaces: formData.garage_spaces ? parseInt(formData.garage_spaces) : null,
        stories: formData.stories ? parseInt(formData.stories) : null,
        hoa_fee: formData.hoa_fee ? parseFloat(formData.hoa_fee) : null,
        rooms: rooms.length > 0 ? rooms : null,
        exterior_features: exteriorFeatures.length > 0 ? exteriorFeatures : null,
        interior_features: interiorFeatures.length > 0 ? interiorFeatures : null,
        appliances: appliances.length > 0 ? appliances : null,
        community_features: communityFeatures.length > 0 ? communityFeatures : null,
      }

      const { error: insertError } = await supabase.from('properties').insert(propertyData)
      if (insertError) throw insertError

      router.push('/dashboard/properties')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'details', label: 'Property Details' },
    { id: 'rooms', label: 'Rooms' },
    { id: 'features', label: 'Features' },
    { id: 'description', label: 'Description' },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/properties" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft size={20} /> Back to Properties
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="text-blue-600" /> Add New Property
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'basic' && (
          <div className="bg-white rounded-lg shadow border p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {propertyCategories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value, property_type: propertyTypes[cat.value][0].value }))}
                  className={`p-4 rounded-lg border text-center ${formData.category === cat.value ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                >
                  <cat.icon className={`mx-auto mb-2 ${formData.category === cat.value ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property Type *</label>
                <select name="property_type" value={formData.property_type} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                  {propertyTypes[formData.category]?.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Listing Type *</label>
                <select name="listing_type" value={formData.listing_type} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg">
                  <option value="for_sale">For Sale</option>
                  <option value="for_rent">For Rent</option>
                  <option value="for_lease">For Lease</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">MLS ID</label>
                <input type="text" name="mls_id" value={formData.mls_id} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="MLS#" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" placeholder="Beautiful Waterfront Home" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder="123 Main Street" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP *</label>
                  <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.listing_type === 'for_sale' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border rounded-lg" placeholder="450000" />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rent Amount *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input type="number" name="rent_amount" value={formData.rent_amount} onChange={handleChange} required className="w-full pl-10 pr-3 py-2 border rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Security Deposit</label>
                    <input type="number" name="security_deposit" value={formData.security_deposit} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow border p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bathrooms</label>
                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} step="0.5" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sq Ft</label>
                <input type="number" name="sqft" value={formData.sqft} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lot Size (acres)</label>
                <input type="number" name="lot_size" value={formData.lot_size} onChange={handleChange} step="0.01" className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Year Built</label>
                <input type="number" name="year_built" value={formData.year_built} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Garage Spaces</label>
                <input type="number" name="garage_spaces" value={formData.garage_spaces} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stories</label>
                <input type="number" name="stories" value={formData.stories} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Construction</label>
                <select name="construction" value={formData.construction} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="block">Block/CBS</option>
                  <option value="frame">Frame</option>
                  <option value="stucco">Stucco</option>
                  <option value="brick">Brick</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Roof Type</label>
                <select name="roof_type" value={formData.roof_type} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="shingle">Shingle</option>
                  <option value="tile">Tile</option>
                  <option value="metal">Metal</option>
                  <option value="flat">Flat</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cooling</label>
                <select name="cooling" value={formData.cooling} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="central">Central A/C</option>
                  <option value="split">Split System</option>
                  <option value="window">Window Units</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heating</label>
                <select name="heating" value={formData.heating} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="central">Central</option>
                  <option value="heat_pump">Heat Pump</option>
                  <option value="electric">Electric</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Water Source</label>
                <select name="water_source" value={formData.water_source} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select...</option>
                  <option value="public">Public/City</option>
                  <option value="well">Well</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">HOA Fee</label>
                <input type="number" name="hoa_fee" value={formData.hoa_fee} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">HOA Frequency</label>
                <select name="hoa_frequency" value={formData.hoa_frequency} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="pets_allowed" checked={formData.pets_allowed} onChange={handleChange} className="w-4 h-4" />
                <span>Pets Allowed</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange} className="w-4 h-4" />
                <span>Furnished</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="bg-white rounded-lg shadow border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Room Details</h3>
              <button type="button" onClick={addRoom} className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                <Plus size={18} /> Add Room
              </button>
            </div>
            
            {rooms.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Click "Add Room" to add room details with dimensions</p>
            ) : (
              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Room Type</label>
                        <select
                          value={room.type}
                          onChange={(e) => updateRoom(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="">Select...</option>
                          {ROOM_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Dimensions</label>
                        <input
                          type="text"
                          value={room.dimensions}
                          onChange={(e) => updateRoom(index, 'dimensions', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="12x14"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Features</label>
                        <input
                          type="text"
                          value={room.features}
                          onChange={(e) => updateRoom(index, 'features', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Walk-in closet, bay window"
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeRoom(index)} className="text-red-500 hover:text-red-700 mt-6">
                      <Minus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="bg-white rounded-lg shadow border p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Exterior Features</h3>
              <div className="flex flex-wrap gap-2">
                {EXTERIOR_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature, exteriorFeatures, setExteriorFeatures)}
                    className={`px-3 py-1 rounded-full text-sm ${exteriorFeatures.includes(feature) ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Interior Features</h3>
              <div className="flex flex-wrap gap-2">
                {INTERIOR_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature, interiorFeatures, setInteriorFeatures)}
                    className={`px-3 py-1 rounded-full text-sm ${interiorFeatures.includes(feature) ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Appliances Included</h3>
              <div className="flex flex-wrap gap-2">
                {APPLIANCES.map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleFeature(item, appliances, setAppliances)}
                    className={`px-3 py-1 rounded-full text-sm ${appliances.includes(item) ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Community Features</h3>
              <div className="flex flex-wrap gap-2">
                {COMMUNITY_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature, communityFeatures, setCommunityFeatures)}
                    className={`px-3 py-1 rounded-full text-sm ${communityFeatures.includes(feature) ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'description' && (
          <div className="bg-white rounded-lg shadow border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Property Description</h3>
              <button type="button" onClick={generateDescription} className="text-blue-600 hover:text-blue-800 text-sm">
                Auto-Generate from Features
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Describe this property in detail..."
            />
            <p className="text-sm text-gray-500">Tip: Use the auto-generate button to create a description based on the features you selected, then customize it.</p>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Saving...' : 'Save Property'}
          </button>
          <Link href="/dashboard/properties">
            <button type="button" className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
          </Link>
        </div>
      </form>
    </div>
  )
}
