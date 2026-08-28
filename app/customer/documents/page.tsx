'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, Folder, Upload, Search, Trash2, Eye, Share2, Home,
  Building2, Video, Loader2, Plus, X, Check, FolderOpen, Image as ImageIcon,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}

interface Document {
  id: string
  property_id: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  category: string
  title: string
  share_with_agent: boolean
  created_at: string
}

interface Property {
  id: string
  address: string
  city: string
  state: string
  price: number
  photos: string[]
}

const CATEGORIES = [
  { id: 'inspection', label: 'Inspection Reports', icon: '🔍' },
  { id: 'hoa', label: 'HOA Documents', icon: '🏘️' },
  { id: 'title', label: 'Title & Deed', icon: '📜' },
  { id: 'mortgage', label: 'Mortgage Docs', icon: '🏦' },
  { id: 'appraisal', label: 'Appraisals', icon: '💰' },
  { id: 'insurance', label: 'Insurance', icon: '🛡️' },
  { id: 'utility_bills', label: 'Utility Bills', icon: '💡' },
  { id: 'contract', label: 'Contracts', icon: '📝' },
  { id: 'disclosure', label: 'Disclosures', icon: '📋' },
  { id: 'photos', label: 'Photos', icon: '📷' },
  { id: 'videos', label: 'Videos', icon: '🎥' },
  { id: 'notes', label: 'Notes', icon: '📒' },
  { id: 'other', label: 'Other', icon: '📁' },
]

export default function CustomerDocumentsPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [documents, setDocuments] = useState<Document[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [agentId, setAgentId] = useState<string | null>(null)
  
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadProperty, setUploadProperty] = useState<string>('')
  const [uploadCategory, setUploadCategory] = useState<string>('other')
  const [uploadShareWithAgent, setUploadShareWithAgent] = useState(true)
  
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/customer/login'); return }

      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('id, assigned_agent_id')
        .eq('id', session.user.id)
        .single()

      if (!customer) { router.push('/customer/login'); return }

      const c = customer as { id: string; assigned_agent_id?: string }
      setCustomerId(c.id)
      setAgentId(c.assigned_agent_id || null)

      const { data: docs } = await supabase
        .from('property_documents')
        .select('*')
        .eq('customer_id', c.id)
        .order('created_at', { ascending: false })

      setDocuments((docs || []) as Document[])

      const { data: saved } = await supabase
        .from('saved_properties')
        .select('property_id, properties(*)')
        .eq('customer_id', c.id)

      // Fixed: properly handle the joined data
      const props: Property[] = []
      if (saved) {
        for (const item of saved) {
          const p = item.properties as unknown as Property | null
          if (p) props.push(p)
        }
      }
      setProperties(props)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!uploadFiles.length || !uploadProperty || !customerId) return
    setUploading(true)

    try {
      for (const file of uploadFiles) {
        const url = URL.createObjectURL(file)
        let fileType = 'document'
        if (file.type.startsWith('image/')) fileType = 'image'
        if (file.type.startsWith('video/')) fileType = 'video'

        await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: uploadProperty,
            customer_id: customerId,
            agent_id: agentId,
            uploaded_by: customerId,
            owner_type: 'customer',
            file_url: url,
            file_name: file.name,
            file_type: fileType,
            file_size: file.size,
            mime_type: file.type,
            category: uploadCategory,
            title: file.name,
            share_with_agent: uploadShareWithAgent,
          })
        })
      }

      setNotification(`${uploadFiles.length} file(s) uploaded!`)
      setShowUploadModal(false)
      setUploadFiles([])
      loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setUploading(false)
    }
  }

  async function deleteDocument(id: string) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/documents?id=${id}`, { method: 'DELETE' })
    setDocuments(prev => prev.filter(d => d.id !== id))
    setNotification('Document deleted')
  }

  async function toggleShare(doc: Document) {
    await fetch('/api/documents', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id, share_with_agent: !doc.share_with_agent })
    })
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, share_with_agent: !d.share_with_agent } : d))
    setNotification(doc.share_with_agent ? 'Sharing disabled' : 'Shared with agent')
  }

  const filtered = documents.filter(d => {
    if (selectedProperty !== 'all' && d.property_id !== selectedProperty) return false
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false
    if (searchTerm && !d.file_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const groupedByProperty = properties.map(p => ({
    property: p,
    documents: filtered.filter(d => d.property_id === p.id)
  })).filter(g => selectedProperty === 'all' || g.property.id === selectedProperty)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-5 h-5 text-green-500" />
    if (type === 'video') return <Video className="w-5 h-5 text-red-500" />
    return <FileText className="w-5 h-5 text-blue-500" />
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {notification && (
        <div className="fixed top-4 left-4 right-4 z-50 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />{notification}
          <button onClick={() => setNotification(null)} className="ml-auto"><X className="w-5 h-5" /></button>
        </div>
      )}

      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/customer/dashboard" className="p-2 -ml-2"><Home className="w-6 h-6" /></Link>
          <h1 className="font-bold text-lg text-gray-900">My Documents</h1>
          <button onClick={() => setShowUploadModal(true)} className="p-2 bg-blue-600 text-white rounded-lg"><Plus className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="bg-white border-b p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)} className="px-3 py-2 border rounded-lg bg-white text-sm">
            <option value="all">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
          </select>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 border rounded-lg bg-white text-sm">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 mx-4 mt-4 rounded-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-2xl font-bold">{documents.length}</p><p className="text-xs text-blue-100">Files</p></div>
          <div><p className="text-2xl font-bold">{properties.length}</p><p className="text-xs text-blue-100">Properties</p></div>
          <div><p className="text-2xl font-bold">{documents.filter(d => d.share_with_agent).length}</p><p className="text-xs text-blue-100">Shared</p></div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {groupedByProperty.length > 0 ? groupedByProperty.map(group => (
          <div key={group.property.id} className="bg-white rounded-xl border overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                {group.property.photos?.[0] ? <img src={group.property.photos[0]} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6 m-3 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{group.property.address}</p>
                <p className="text-sm text-gray-500">{group.property.city}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{group.documents.length} files</span>
            </div>
            {group.documents.length > 0 ? (
              <div className="divide-y">
                {group.documents.map(doc => (
                  <div key={doc.id} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">{getFileIcon(doc.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.title || doc.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{CATEGORIES.find(c => c.id === doc.category)?.label || 'Other'}</span>
                        <span>•</span>
                        <span>{formatSize(doc.file_size || 0)}</span>
                        {doc.share_with_agent && <><span>•</span><span className="text-green-600">Shared</span></>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleShare(doc)} className={`p-2 rounded-lg ${doc.share_with_agent ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}><Share2 className="w-4 h-4" /></button>
                      <a href={doc.file_url} target="_blank" className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Eye className="w-4 h-4" /></a>
                      <button onClick={() => deleteDocument(doc.id)} className="p-2 bg-red-100 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500"><FolderOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" /><p>No documents</p></div>
            )}
          </div>
        )) : (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-900 mb-2">No Documents Yet</h3>
            <p className="text-sm text-gray-500 mb-4">Upload inspection reports, HOA docs, and more</p>
            <button onClick={() => setShowUploadModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><Upload className="w-5 h-5" />Upload</button>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-semibold text-lg">Upload Documents</h2>
              <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 space-y-4">
              <input ref={fileInputRef} type="file" multiple onChange={(e) => setUploadFiles(Array.from(e.target.files || []))} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 flex flex-col items-center gap-2 text-blue-600">
                <Upload className="w-8 h-8" /><span className="font-medium">Select Files</span>
              </button>
              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="flex-1 truncate text-sm">{file.name}</span>
                      <button onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select value={uploadProperty} onChange={(e) => setUploadProperty(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select Property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" checked={uploadShareWithAgent} onChange={(e) => setUploadShareWithAgent(e.target.checked)} className="w-5 h-5 rounded" />
                <div>
                  <p className="font-medium text-gray-900">Share with my agent</p>
                  <p className="text-xs text-gray-500">Your agent can view these documents</p>
                </div>
              </label>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 border rounded-xl font-medium">Cancel</button>
              <button onClick={handleUpload} disabled={!uploadFiles.length || !uploadProperty || uploading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {uploading && <Loader2 className="w-5 h-5 animate-spin" />}Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
