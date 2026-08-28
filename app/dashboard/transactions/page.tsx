'use client'

import { useState, useEffect, DragEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Briefcase, Plus, Search, DollarSign, User, Home, CheckCircle, FileText,
  X, Check, Loader2, Building2, MapPin, TrendingUp, Edit, Trash2, GripVertical,
  Calendar, Phone, Mail, Clock
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface Transaction {
  id: string
  property_id?: string
  property_address: string
  property_city: string
  property_state: string
  property_price: number
  client_name: string
  client_email?: string
  client_phone?: string
  client_type: 'buyer' | 'seller'
  status: string
  stage: string
  closing_date?: string
  commission_rate: number
  created_at: string
  notes?: string
  checklist: { item: string; completed: boolean }[]
}

const STAGES = [
  { id: 'lead', label: 'New Lead', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50' },
  { id: 'contract', label: 'Under Contract', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { id: 'inspection', label: 'Inspection', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  { id: 'appraisal', label: 'Appraisal', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgLight: 'bg-indigo-50' },
  { id: 'title', label: 'Title & Escrow', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
  { id: 'final_walkthrough', label: 'Final Walkthrough', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50' },
  { id: 'closing', label: 'Closing', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50' },
  { id: 'closed', label: 'Closed', color: 'bg-green-600', textColor: 'text-green-700', bgLight: 'bg-green-50' },
]

const DEFAULT_CHECKLIST = [
  { item: 'Contract signed', completed: false },
  { item: 'Earnest money deposited', completed: false },
  { item: 'Inspection scheduled', completed: false },
  { item: 'Inspection completed', completed: false },
  { item: 'Appraisal ordered', completed: false },
  { item: 'Appraisal completed', completed: false },
  { item: 'Title search completed', completed: false },
  { item: 'Loan approved', completed: false },
  { item: 'Final walkthrough', completed: false },
  { item: 'Closing documents signed', completed: false },
  { item: 'Keys transferred', completed: false },
]

export default function PipelineKanbanPage() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<Transaction | null>(null)
  const [dragOverStage, setDragOverStage] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    property_address: '', property_city: '', property_state: 'FL', property_price: '',
    client_name: '', client_email: '', client_phone: '', client_type: 'buyer' as 'buyer' | 'seller',
    stage: 'lead', closing_date: '', commission_rate: '3', notes: ''
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('agent_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTransactions(data.map(t => ({
        ...t,
        checklist: t.checklist || DEFAULT_CHECKLIST
      })))
    }
    setLoading(false)
  }

  const handleDragStart = (e: DragEvent, transaction: Transaction) => {
    setDraggedItem(transaction)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', transaction.id)
  }

  const handleDragOver = (e: DragEvent, stageId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stageId)
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = async (e: DragEvent, newStage: string) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggedItem || draggedItem.stage === newStage) {
      setDraggedItem(null)
      return
    }

    // Optimistic update
    setTransactions(prev => prev.map(t => 
      t.id === draggedItem.id ? { ...t, stage: newStage } : t
    ))

    // Update in database
    const { error } = await supabase
      .from('transactions')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', draggedItem.id)

    if (error) {
      // Revert on error
      setTransactions(prev => prev.map(t => 
        t.id === draggedItem.id ? { ...t, stage: draggedItem.stage } : t
      ))
    }

    setDraggedItem(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      agent_id: user.id,
      property_address: formData.property_address,
      property_city: formData.property_city,
      property_state: formData.property_state,
      property_price: parseFloat(formData.property_price) || 0,
      client_name: formData.client_name,
      client_email: formData.client_email || null,
      client_phone: formData.client_phone || null,
      client_type: formData.client_type,
      stage: formData.stage,
      status: 'active',
      closing_date: formData.closing_date || null,
      commission_rate: parseFloat(formData.commission_rate) || 3,
      notes: formData.notes || null,
      checklist: DEFAULT_CHECKLIST,
    }

    if (editingTransaction) {
      await supabase.from('transactions').update(payload).eq('id', editingTransaction.id)
    } else {
      await supabase.from('transactions').insert(payload)
    }

    setShowModal(false)
    setEditingTransaction(null)
    resetForm()
    loadTransactions()
  }

  const resetForm = () => {
    setFormData({
      property_address: '', property_city: '', property_state: 'FL', property_price: '',
      client_name: '', client_email: '', client_phone: '', client_type: 'buyer',
      stage: 'lead', closing_date: '', commission_rate: '3', notes: ''
    })
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      property_address: transaction.property_address,
      property_city: transaction.property_city,
      property_state: transaction.property_state || 'FL',
      property_price: transaction.property_price?.toString() || '',
      client_name: transaction.client_name,
      client_email: transaction.client_email || '',
      client_phone: transaction.client_phone || '',
      client_type: transaction.client_type,
      stage: transaction.stage,
      closing_date: transaction.closing_date || '',
      commission_rate: transaction.commission_rate?.toString() || '3',
      notes: transaction.notes || ''
    })
    setShowModal(true)
  }

  const deleteTransaction = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    await supabase.from('transactions').delete().eq('id', id)
    loadTransactions()
  }

  const getTransactionsByStage = (stageId: string) => {
    return transactions.filter(t => 
      t.stage === stageId && 
      (searchTerm === '' || 
        t.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  const totalPipelineValue = transactions.reduce((sum, t) => sum + (t.property_price || 0), 0)
  const totalCommission = transactions.reduce((sum, t) => sum + ((t.property_price || 0) * (t.commission_rate || 3) / 100), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="text-blue-600" /> Transaction Pipeline
          </h1>
          <p className="text-gray-600">Drag and drop transactions between stages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white'}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} /> New Transaction
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Active Transactions</p>
          <p className="text-2xl font-bold">{transactions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Pipeline Value</p>
          <p className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Est. Commission</p>
          <p className="text-2xl font-bold text-green-600">${totalCommission.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <p className="text-sm text-gray-500">Closing This Month</p>
          <p className="text-2xl font-bold">{transactions.filter(t => {
            if (!t.closing_date) return false
            const closing = new Date(t.closing_date)
            const now = new Date()
            return closing.getMonth() === now.getMonth() && closing.getFullYear() === now.getFullYear()
          }).length}</p>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const stageTransactions = getTransactionsByStage(stage.id)
            const isDropTarget = dragOverStage === stage.id
            
            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-72 rounded-lg ${stage.bgLight} ${isDropTarget ? 'ring-2 ring-blue-400' : ''}`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className={`${stage.color} text-white px-4 py-2 rounded-t-lg flex justify-between items-center`}>
                  <span className="font-medium">{stage.label}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{stageTransactions.length}</span>
                </div>
                
                <div className="p-2 space-y-2 min-h-[200px]">
                  {stageTransactions.map(transaction => (
                    <div
                      key={transaction.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, transaction)}
                      className={`bg-white rounded-lg shadow p-3 cursor-grab active:cursor-grabbing border hover:shadow-md transition-shadow ${
                        draggedItem?.id === transaction.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="text-gray-300 mt-1 flex-shrink-0" size={16} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{transaction.property_address}</p>
                          <p className="text-xs text-gray-500">{transaction.property_city}, {transaction.property_state}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-600">
                              ${transaction.property_price?.toLocaleString()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              transaction.client_type === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {transaction.client_type}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <User size={12} />
                            <span className="truncate">{transaction.client_name}</span>
                          </div>
                          {transaction.closing_date && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              {new Date(transaction.closing_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t flex justify-end gap-1">
                        <button onClick={() => openEditModal(transaction)} className="p-1 hover:bg-gray-100 rounded">
                          <Edit size={14} className="text-gray-500" />
                        </button>
                        <button onClick={() => deleteTransaction(transaction.id)} className="p-1 hover:bg-red-50 rounded">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {stageTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Property</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stage</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Closing</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.property_address}</p>
                    <p className="text-sm text-gray-500">{t.property_city}, {t.property_state}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{t.client_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      t.client_type === 'buyer' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>{t.client_type}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">${t.property_price?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      STAGES.find(s => s.id === t.stage)?.textColor
                    } ${STAGES.find(s => s.id === t.stage)?.bgLight}`}>
                      {STAGES.find(s => s.id === t.stage)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {t.closing_date ? new Date(t.closing_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditModal(t)} className="p-1 hover:bg-gray-100 rounded">
                      <Edit size={16} className="text-gray-500" />
                    </button>
                    <button onClick={() => deleteTransaction(t.id)} className="p-1 hover:bg-red-50 rounded ml-1">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingTransaction ? 'Edit Transaction' : 'New Transaction'}</h2>
              <button onClick={() => { setShowModal(false); setEditingTransaction(null); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Property Address *</label>
                  <input
                    type="text"
                    value={formData.property_address}
                    onChange={(e) => setFormData({...formData, property_address: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.property_city}
                    onChange={(e) => setFormData({...formData, property_city: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price *</label>
                  <input
                    type="number"
                    value={formData.property_price}
                    onChange={(e) => setFormData({...formData, property_price: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="450000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client Name *</label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client Type</label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({...formData, client_type: e.target.value as 'buyer' | 'seller'})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client Email</label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Client Phone</label>
                  <input
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Closing Date</label>
                  <input
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({...formData, closing_date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Commission %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData({...formData, commission_rate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => { setShowModal(false); setEditingTransaction(null); }} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingTransaction ? 'Update' : 'Create'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
