// =====================================================
// CR REALTOR PLATFORM - CUSTOMER DOCUMENTS PAGE
// Path: app/customer/dashboard/documents/page.tsx
// Timestamp: 2025-12-01 11:50 AM EST
// Purpose: Customer views shared documents (multi-tenant)
// =====================================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Download,
  Eye,
  Calendar,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  Search,
  Filter,
  Home,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
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
  customer_id: string
  agent_id: string
  name: string
  description?: string
  file_url: string
  file_type: string
  file_size: number
  category: string
  property_id?: string
  is_signed?: boolean
  requires_signature?: boolean
  created_at: string
  properties?: {
    id: string
    address: string
    city: string
  }
}

export default function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const supabase = createClient()

  // Load documents
  const loadDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get customer record
      const { data: customer } = await supabase
        .from('realtor_customers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!customer) return

      // Get shared documents
      const { data, error } = await supabase
        .from('customer_documents')
        .select(`
          *,
          properties (
            id,
            address,
            city
          )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return FileImage
    if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) return FileSpreadsheet
    if (fileType.includes('pdf')) return FileText
    return File
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get unique categories
  const categories = [...new Set(documents.map(d => d.category).filter(Boolean))]

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!doc.name.toLowerCase().includes(query) &&
          !doc.description?.toLowerCase().includes(query)) {
        return false
      }
    }
    if (categoryFilter && doc.category !== categoryFilter) {
      return false
    }
    return true
  })

  // Group by category
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    const category = doc.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  // Count requiring signature
  const needsSignatureCount = documents.filter(d => d.requires_signature && !d.is_signed).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <span className="bg-green-100 text-green-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {documents.length}
        </span>
      </div>

      {/* Signature Alert */}
      {needsSignatureCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Action Required</p>
            <p className="text-sm text-yellow-700 mt-1">
              You have {needsSignatureCount} document{needsSignatureCount > 1 ? 's' : ''} awaiting your signature.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[180px]"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents yet</h3>
          <p className="text-gray-500">
            Your agent hasn't shared any documents with you yet.
          </p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
          <p className="text-gray-500">No documents match your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <div key={category}>
              {/* Category Header */}
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-gray-400" />
                {category}
                <span className="text-sm font-normal text-gray-500">({docs.length})</span>
              </h2>

              {/* Documents Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {docs.map((doc) => {
                  const FileIcon = getFileIcon(doc.file_type)
                  
                  return (
                    <div
                      key={doc.id}
                      className={`bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition-shadow ${
                        doc.requires_signature && !doc.is_signed
                          ? 'border-yellow-300'
                          : 'border-gray-200'
                      }`}
                    >
                      {/* Document Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <FileIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate" title={doc.name}>
                            {doc.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.file_size)}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {doc.description}
                        </p>
                      )}

                      {/* Property Reference */}
                      {doc.properties && (
                        <div className="text-xs text-gray-500 mb-3 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                          <Home className="h-3 w-3" />
                          {doc.properties.address}, {doc.properties.city}
                        </div>
                      )}

                      {/* Signature Status */}
                      {doc.requires_signature && (
                        <div className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded mb-3 ${
                          doc.is_signed
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {doc.is_signed ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5" />
                              Signed
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3.5 w-3.5" />
                              Signature Required
                            </>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(doc.created_at)}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </a>
                        <a
                          href={doc.file_url}
                          download={doc.name}
                          className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      {documents.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p>
            <strong>Need help?</strong> Contact your agent if you have questions about any document 
            or need to request additional paperwork.
          </p>
        </div>
      )}
    </div>
  )
}
