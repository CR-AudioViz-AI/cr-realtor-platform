'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Building2,
  FileText,
  Upload,
  Search,
  Plus,
  Trash2,
  Eye,
  Edit,
  Save,
  X,
  Loader2,
  Check,
  Camera,
  Video,
  Folder,
  ChevronDown,
  Share2,
  MessageSquare,
  Star,
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

interface PropertyNote {
  id: string
  property_id: string
  title: string
  content: string
  category: string
  is_private: boolean
  created_at: string
  updated_at: string
}

interface PropertyDoc {
  id: string
  property_id: string
  file_url: string
  file_name: string
  file_type: string
  category: string
  share_with_customer: boolean
  created_at: string
}

interface Property {
  id: string
  address: string
  city: string
  state: string
  price: number
  photos: string[]
  status: string
}

const NOTE_CATEGORIES = ['Showing Notes', 'Client Feedback', 'Pricing Analysis', 'Negotiation Strategy', 'Follow-up Tasks', 'Private Notes']
const DOC_CATEGORIES = ['Photos', 'Videos', 'Inspection', 'Disclosures', 'Contracts', 'Comps', 'Marketing', 'Other']

export default function AgentPropertyNotesPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [properties, setProperties] = useState<Property[]>([])
  const [notes, setNotes] = useState<PropertyNote[]>([])
  const [documents, setDocuments] = useState<PropertyDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [agentId, setAgentId] = useState<string | null>(null)
  
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'notes' | 'documents'>('notes')
  
  // Note editing
  const [editingNote, setEditingNote] = useState<PropertyNote | null>(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteForm, setNoteForm] = useState({ property_id: '', title: '', content: '', category: 'Showing Notes', is_private: false })
  
  // Doc upload
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadProperty, setUploadProperty] = useState('')
  const [uploadCategory, setUploadCategory] = useState('Other')
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [shareWithCustomer, setShareWithCustomer] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [notification, setNotification] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setAgentId(user.id)

      // Load properties (agent's listings)
      const { data: props } = await supabase
        .from('properties')
        .select('*')
        .eq('listing_agent_id', user.id)
        .order('created_at', { ascending: false })

      setProperties((props || []) as Property[])

      // Load notes
      const { data: notesData } = await supabase
        .from('agent_property_notes')
        .select('*')
        .eq('agent_id', user.id)
        .order('updated_at', { ascending: false })

      setNotes((notesData || []) as PropertyNote[])

      // Load documents
      const { data: docsData } = await supabase
        .from('property_documents')
        .select('*')
        .eq('agent_id', user.id)
        .eq('owner_type', 'agent')
        .order('created_at', { ascending: false })

      setDocuments((docsData || []) as PropertyDoc[])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveNote() {
    if (!agentId || !noteForm.property_id || !noteForm.title) return
    setSaving(true)

    try {
      if (editingNote) {
        await supabase
          .from('agent_property_notes')
          .update({
            title: noteForm.title,
            content: noteForm.content,
            category: noteForm.category,
            is_private: noteForm.is_private,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingNote.id)
      } else {
        await supabase
          .from('agent_property_notes')
          .insert({
            agent_id: agentId,
            property_id: noteForm.property_id,
            title: noteForm.title,
            content: noteForm.content,
            category: noteForm.category,
            is_private: noteForm.is_private,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }

      setNotification(editingNote ? 'Note updated!' : 'Note saved!')
      setShowNoteModal(false)
      setEditingNote(null)
      setNoteForm({ property_id: '', title: '', content: '', category: 'Showing Notes', is_private: false })
      loadData()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  async function deleteNote(id: string) {
    if (!confirm('Delete this note?')) return
    await supabase.from('agent_property_notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
    setNotification('Note deleted')
  }

  async function uploadDocuments() {
    if (!agentId || !uploadProperty || !uploadFiles.length) return
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
            agent_id: agentId,
            uploaded_by: agentId,
            owner_type: 'agent',
            file_url: url,
            file_name: file.name,
            file_type: fileType,
            file_size: file.size,
            mime_type: file.type,
            category: uploadCategory.toLowerCase().replace(' ', '_'),
            share_with_customer: shareWithCustomer,
            visible_to_all_agents: true,
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

  const filteredNotes = notes.filter(n => {
    if (selectedProperty !== 'all' && n.property_id !== selectedProperty) return false
    if (searchTerm && !n.title.toLowerCase().includes(searchTerm.toLowerCase()) && !n.content?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const filteredDocs = documents.filter(d => {
    if (selectedProperty !== 'all' && d.property_id !== selectedProperty) return false
    if (searchTerm && !d.file_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getPropertyAddress = (id: string) => properties.find(p => p.id === id)?.address || 'Unknown'
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>

  return (
    <div className="space-y-6">
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-5 h-5" />{notification}
          <button onClick={() => setNotification(null)} className="ml-2"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Notes & Documents</h1>
          <p className="text-gray-500">Your private notes and files for each property</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowNoteModal(true); setEditingNote(null); setNoteForm({ property_id: selectedProperty !== 'all' ? selectedProperty : '', title: '', content: '', category: 'Showing Notes', is_private: false }) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
            <Plus className="w-4 h-4" />Add Note
          </button>
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />Upload
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search notes and documents..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)} className="px-4 py-2 border rounded-lg bg-white">
          <option value="all">All Properties ({properties.length})</option>
          {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
        </select>
        <div className="flex rounded-lg border overflow-hidden">
          <button onClick={() => setActiveTab('notes')} className={`px-4 py-2 ${activeTab === 'notes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            Notes ({filteredNotes.length})
          </button>
          <button onClick={() => setActiveTab('documents')} className={`px-4 py-2 ${activeTab === 'documents' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            Documents ({filteredDocs.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'notes' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.length > 0 ? filteredNotes.map(note => (
            <div key={note.id} className="bg-white rounded-xl border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{note.category}</span>
                  {note.is_private && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full ml-1">Private</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditingNote(note); setNoteForm({ property_id: note.property_id, title: note.title, content: note.content, category: note.category, is_private: note.is_private }); setShowNoteModal(true) }} className="p-1 text-gray-400 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{note.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-3 mb-2">{note.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="truncate">{getPropertyAddress(note.property_id)}</span>
                <span>{formatDate(note.updated_at)}</span>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white rounded-xl border p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No notes found</p>
              <button onClick={() => setShowNoteModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Add Your First Note</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDocs.length > 0 ? filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border overflow-hidden">
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {doc.file_type === 'image' ? (
                  <img src={doc.file_url} alt="" className="w-full h-full object-cover" />
                ) : doc.file_type === 'video' ? (
                  <Video className="w-12 h-12 text-red-400" />
                ) : (
                  <FileText className="w-12 h-12 text-blue-400" />
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-gray-900 truncate text-sm">{doc.file_name}</p>
                <p className="text-xs text-gray-500 truncate">{getPropertyAddress(doc.property_id)}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{doc.category}</span>
                  <div className="flex gap-1">
                    {doc.share_with_customer && <Share2 className="w-4 h-4 text-green-500" />}
                    <a href={doc.file_url} target="_blank" className="p-1 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></a>
                    <button onClick={() => deleteDocument(doc.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full bg-white rounded-xl border p-12 text-center">
              <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No documents found</p>
              <button onClick={() => setShowUploadModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Upload Documents</button>
            </div>
          )}
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">{editingNote ? 'Edit Note' : 'Add Note'}</h2>
              <button onClick={() => { setShowNoteModal(false); setEditingNote(null) }}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select value={noteForm.property_id} onChange={(e) => setNoteForm(f => ({ ...f, property_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" disabled={!!editingNote}>
                  <option value="">Select Property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={noteForm.category} onChange={(e) => setNoteForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                  {NOTE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={noteForm.title} onChange={(e) => setNoteForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" placeholder="Note title..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={noteForm.content} onChange={(e) => setNoteForm(f => ({ ...f, content: e.target.value }))} rows={6} className="w-full px-3 py-2 border rounded-lg" placeholder="Your notes..." />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={noteForm.is_private} onChange={(e) => setNoteForm(f => ({ ...f, is_private: e.target.checked }))} className="w-5 h-5 rounded" />
                <span className="text-sm">Private (only visible to me)</span>
              </label>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => { setShowNoteModal(false); setEditingNote(null) }} className="flex-1 py-2 border rounded-lg">Cancel</button>
              <button onClick={saveNote} disabled={!noteForm.property_id || !noteForm.title || saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Upload Documents</h2>
              <button onClick={() => setShowUploadModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 space-y-4">
              <input ref={fileInputRef} type="file" multiple onChange={(e) => setUploadFiles(Array.from(e.target.files || []))} className="hidden" />
              
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 flex flex-col items-center gap-2 text-blue-600">
                <Upload className="w-8 h-8" />
                <span className="font-medium">Select Files</span>
              </button>

              {uploadFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <span className="flex-1 truncate text-sm">{file.name}</span>
                      <button onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-red-500" /></button>
                    </div>
                  ))}
                </div>
              )}

              <select value={uploadProperty} onChange={(e) => setUploadProperty(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select Property *</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.address}</option>)}
              </select>

              <select value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={shareWithCustomer} onChange={(e) => setShareWithCustomer(e.target.checked)} className="w-5 h-5 rounded" />
                <span className="text-sm">Share with customer</span>
              </label>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => setShowUploadModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
              <button onClick={uploadDocuments} disabled={!uploadProperty || !uploadFiles.length || uploading} className="flex-1 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
