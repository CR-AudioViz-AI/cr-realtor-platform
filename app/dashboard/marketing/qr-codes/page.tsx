'use client'

import { useState, useRef } from 'react'
import {
  QrCode, Download, Copy, Check, Printer, Home, 
  MapPin, DollarSign, Bed, Bath, Square, Image,
  Palette, Settings, Eye, Share2, FileText, Zap
} from 'lucide-react'

interface PropertyInfo {
  address: string
  price: number
  beds: number
  baths: number
  sqft: number
  mls?: string
  agentName: string
  agentPhone: string
  agentEmail: string
  agentPhoto?: string
  companyName: string
  companyLogo?: string
}

const QR_STYLES = [
  { id: 'default', name: 'Standard', preview: '■■■' },
  { id: 'dots', name: 'Dots', preview: '●●●' },
  { id: 'rounded', name: 'Rounded', preview: '▢▢▢' },
]

const QR_COLORS = [
  { id: 'black', name: 'Black', color: '#000000' },
  { id: 'navy', name: 'Navy', color: '#1e3a5f' },
  { id: 'green', name: 'Forest', color: '#1a5f4a' },
  { id: 'maroon', name: 'Maroon', color: '#5f1a1a' },
  { id: 'purple', name: 'Purple', color: '#4a1a5f' },
]

export default function QRCodeGeneratorPage() {
  const [property, setProperty] = useState<PropertyInfo>({
    address: '2850 Winkler Ave, Fort Myers, FL 33916',
    price: 425000,
    beds: 4,
    baths: 3,
    sqft: 2400,
    mls: 'MLS123456',
    agentName: 'Your Name',
    agentPhone: '(239) 555-0100',
    agentEmail: 'you@example.com',
    companyName: 'List or Buy Real Estate',
  })
  
  const [qrType, setQrType] = useState<'listing' | 'contact' | 'custom'>('listing')
  const [customUrl, setCustomUrl] = useState('')
  const [qrColor, setQrColor] = useState('#000000')
  const [qrSize, setQrSize] = useState(200)
  const [showFlyer, setShowFlyer] = useState(false)
  const [copied, setCopied] = useState(false)
  const flyerRef = useRef<HTMLDivElement>(null)

  const getQRUrl = () => {
    switch (qrType) {
      case 'listing':
        return `https://realtor.craudiovizai.com/listing/${encodeURIComponent(property.address)}?agent=${encodeURIComponent(property.agentName)}`
      case 'contact':
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${property.agentName}
TEL:${property.agentPhone}
EMAIL:${property.agentEmail}
ORG:${property.companyName}
END:VCARD`
        return `data:text/vcard,${encodeURIComponent(vcard)}`
      case 'custom':
        return customUrl
      default:
        return ''
    }
  }

  const generateQRImage = () => {
    const url = getQRUrl()
    const colorHex = qrColor.replace('#', '')
    return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}&color=${colorHex}&bgcolor=ffffff&margin=10`
  }

  const downloadQR = async () => {
    const response = await fetch(generateQRImage())
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${property.address.replace(/[^a-z0-9]/gi, '-')}.png`
    a.click()
  }

  const copyQRLink = () => {
    navigator.clipboard.writeText(generateQRImage())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const printFlyer = () => {
    const content = flyerRef.current
    if (!content) return
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Property Flyer - ${property.address}</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
              .flyer { max-width: 8.5in; margin: 0 auto; }
            </style>
          </head>
          <body>${content.outerHTML}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <QrCode className="text-blue-600" /> QR Code Generator
        </h1>
        <p className="text-gray-600 mt-1">Create QR codes for listings, contact cards, and flyers</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          {/* QR Type Selection */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold mb-4">1. QR Code Type</h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setQrType('listing')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  qrType === 'listing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Home className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="text-sm font-medium">Listing Page</p>
              </button>
              <button
                onClick={() => setQrType('contact')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  qrType === 'contact' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <FileText className="mx-auto mb-2 text-green-600" size={24} />
                <p className="text-sm font-medium">Contact Card</p>
              </button>
              <button
                onClick={() => setQrType('custom')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  qrType === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <Settings className="mx-auto mb-2 text-purple-600" size={24} />
                <p className="text-sm font-medium">Custom URL</p>
              </button>
            </div>
          </div>

          {/* Property/Custom Details */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold mb-4">2. Details</h2>
            
            {qrType === 'custom' ? (
              <div>
                <label className="block text-sm font-medium mb-1">Custom URL</label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://example.com/your-page"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {qrType === 'listing' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Property Address</label>
                      <input
                        type="text"
                        value={property.address}
                        onChange={(e) => setProperty({ ...property, address: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="number"
                          value={property.price}
                          onChange={(e) => setProperty({ ...property, price: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">MLS #</label>
                        <input
                          type="text"
                          value={property.mls}
                          onChange={(e) => setProperty({ ...property, mls: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Beds</label>
                        <input
                          type="number"
                          value={property.beds}
                          onChange={(e) => setProperty({ ...property, beds: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Baths</label>
                        <input
                          type="number"
                          value={property.baths}
                          onChange={(e) => setProperty({ ...property, baths: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Sq Ft</label>
                        <input
                          type="number"
                          value={property.sqft}
                          onChange={(e) => setProperty({ ...property, sqft: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Agent Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        value={property.agentName}
                        onChange={(e) => setProperty({ ...property, agentName: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="tel"
                        value={property.agentPhone}
                        onChange={(e) => setProperty({ ...property, agentPhone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={property.agentEmail}
                      onChange={(e) => setProperty({ ...property, agentEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <input
                      type="text"
                      value={property.companyName}
                      onChange={(e) => setProperty({ ...property, companyName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customization */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold mb-4">3. Customize</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">QR Code Color</label>
                <div className="flex gap-2">
                  {QR_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setQrColor(c.color)}
                      className={`w-10 h-10 rounded-lg border-2 ${
                        qrColor === c.color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Size: {qrSize}px</label>
                <input
                  type="range"
                  min="100"
                  max="400"
                  step="50"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* QR Preview */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Eye size={18} /> Preview
            </h2>
            
            <div className="flex justify-center p-8 bg-gray-50 rounded-xl mb-4">
              <img 
                src={generateQRImage()} 
                alt="Generated QR Code"
                className="rounded-lg shadow-lg"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadQR}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Download size={18} /> Download PNG
              </button>
              <button
                onClick={copyQRLink}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* Flyer Preview */}
          {qrType === 'listing' && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold flex items-center gap-2">
                  <FileText size={18} /> Property Flyer
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFlyer(!showFlyer)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    {showFlyer ? 'Hide' : 'Preview'}
                  </button>
                  <button
                    onClick={printFlyer}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 flex items-center gap-1"
                  >
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>

              {showFlyer && (
                <div 
                  ref={flyerRef}
                  className="bg-white border-2 border-gray-300 p-6 rounded-lg"
                  style={{ aspectRatio: '8.5/11' }}
                >
                  {/* Flyer Header */}
                  <div className="text-center border-b pb-4 mb-4">
                    <h3 className="text-2xl font-bold text-blue-600">FOR SALE</h3>
                    <p className="text-gray-600">{property.companyName}</p>
                  </div>

                  {/* Property Info */}
                  <div className="text-center mb-6">
                    <p className="text-xl font-bold">{property.address}</p>
                    <p className="text-3xl font-bold text-green-600 my-2">
                      ${property.price.toLocaleString()}
                    </p>
                    <div className="flex justify-center gap-6 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Bed size={16} /> {property.beds} Beds
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath size={16} /> {property.baths} Baths
                      </span>
                      <span className="flex items-center gap-1">
                        <Square size={16} /> {property.sqft.toLocaleString()} Sq Ft
                      </span>
                    </div>
                    {property.mls && (
                      <p className="text-sm text-gray-400 mt-1">{property.mls}</p>
                    )}
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-4">
                    <div className="text-center">
                      <img 
                        src={generateQRImage()} 
                        alt="QR Code"
                        className="mx-auto w-32 h-32"
                      />
                      <p className="text-xs text-gray-500 mt-1">Scan for more info</p>
                    </div>
                  </div>

                  {/* Agent Info */}
                  <div className="border-t pt-4 text-center">
                    <p className="font-bold text-lg">{property.agentName}</p>
                    <p className="text-gray-600">{property.agentPhone}</p>
                    <p className="text-gray-600">{property.agentEmail}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Use Cases */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Zap className="text-amber-500" /> Pro Tips
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Place QR codes on yard signs for instant property details
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Add to business cards for easy contact saving
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Include in flyers and mailers for trackable engagement
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                Display at open houses for digital sign-in
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
