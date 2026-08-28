'use client'

import { useState, useEffect, DragEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin,
  User, Home, Phone, Video, Users, X, Check, Trash2, Edit, Loader2, GripVertical,
  Building2, DoorOpen
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}


interface CalendarEvent {
  id: string
  title: string
  event_type: string
  start_time: string
  end_time: string
  location?: string
  contact_name?: string
  contact_phone?: string
  notes?: string
  property_id?: string
  property?: { title: string; address: string }
}

interface Property {
  id: string
  title: string
  address: string
  city: string
}

const EVENT_TYPES = [
  { value: 'showing', label: 'Showing', icon: Home, color: 'bg-blue-500' },
  { value: 'open_house', label: 'Open House', icon: DoorOpen, color: 'bg-purple-500' },
  { value: 'meeting', label: 'Client Meeting', icon: Users, color: 'bg-green-500' },
  { value: 'inspection', label: 'Inspection', icon: Building2, color: 'bg-orange-500' },
  { value: 'closing', label: 'Closing', icon: Check, color: 'bg-emerald-500' },
  { value: 'call', label: 'Phone Call', icon: Phone, color: 'bg-yellow-500' },
  { value: 'video', label: 'Video Call', icon: Video, color: 'bg-red-500' },
  { value: 'other', label: 'Other', icon: CalendarIcon, color: 'bg-gray-500' },
]

export default function CalendarPage() {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')

  const [formData, setFormData] = useState({
    title: '', event_type: 'showing', date: '', start_time: '10:00', end_time: '11:00',
    location: '', contact_name: '', contact_phone: '', notes: '', property_id: ''
  })

  useEffect(() => {
    loadEvents()
    loadProperties()
  }, [currentDate])

  async function loadEvents() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*, property:properties(title, address)')
      .eq('agent_id', user.id)
      .gte('start_time', startOfMonth.toISOString())
      .lte('start_time', endOfMonth.toISOString())
      .order('start_time')

    if (!error && data) setEvents(data)
    setLoading(false)
  }

  async function loadProperties() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('properties')
      .select('id, title, address, city')
      .eq('agent_id', user.id)
      .eq('status', 'active')

    if (data) setProperties(data)
  }

  const handleDragStart = (e: DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: DragEvent, dateStr: string) => {
    e.preventDefault()
    setDragOverDate(dateStr)
  }

  const handleDrop = async (e: DragEvent, newDate: Date) => {
    e.preventDefault()
    setDragOverDate(null)

    if (!draggedEvent) return

    const oldStart = new Date(draggedEvent.start_time)
    const oldEnd = new Date(draggedEvent.end_time)
    const duration = oldEnd.getTime() - oldStart.getTime()

    const newStart = new Date(newDate)
    newStart.setHours(oldStart.getHours(), oldStart.getMinutes())
    const newEnd = new Date(newStart.getTime() + duration)

    // Optimistic update
    setEvents(prev => prev.map(evt =>
      evt.id === draggedEvent.id
        ? { ...evt, start_time: newStart.toISOString(), end_time: newEnd.toISOString() }
        : evt
    ))

    // Update database
    const { error } = await supabase
      .from('calendar_events')
      .update({ start_time: newStart.toISOString(), end_time: newEnd.toISOString() })
      .eq('id', draggedEvent.id)

    if (error) loadEvents() // Revert on error
    setDraggedEvent(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startDateTime = new Date(`${formData.date}T${formData.start_time}`)
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`)

    const payload = {
      agent_id: user.id,
      title: formData.title,
      event_type: formData.event_type,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      location: formData.location || null,
      contact_name: formData.contact_name || null,
      contact_phone: formData.contact_phone || null,
      notes: formData.notes || null,
      property_id: formData.property_id || null,
    }

    if (editingEvent) {
      await supabase.from('calendar_events').update(payload).eq('id', editingEvent.id)
    } else {
      await supabase.from('calendar_events').insert(payload)
    }

    setSaving(false)
    setShowModal(false)
    setEditingEvent(null)
    resetForm()
    loadEvents()
  }

  const resetForm = () => {
    setFormData({
      title: '', event_type: 'showing', date: '', start_time: '10:00', end_time: '11:00',
      location: '', contact_name: '', contact_phone: '', notes: '', property_id: ''
    })
  }

  const openNewEventModal = (date: Date) => {
    resetForm()
    setFormData(prev => ({ ...prev, date: date.toISOString().split('T')[0] }))
    setSelectedDate(date)
    setShowModal(true)
  }

  const openEditModal = (event: CalendarEvent) => {
    const start = new Date(event.start_time)
    const end = new Date(event.end_time)
    setEditingEvent(event)
    setFormData({
      title: event.title,
      event_type: event.event_type,
      date: start.toISOString().split('T')[0],
      start_time: start.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      location: event.location || '',
      contact_name: event.contact_name || '',
      contact_phone: event.contact_phone || '',
      notes: event.notes || '',
      property_id: event.property_id || ''
    })
    setShowModal(true)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('calendar_events').delete().eq('id', id)
    loadEvents()
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    
    const days: (Date | null)[] = []
    for (let i = 0; i < startPadding; i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => e.start_time.split('T')[0] === dateStr)
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const getEventTypeConfig = (type: string) => {
    return EVENT_TYPES.find(t => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1]
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const openHouseEvents = events.filter(e => e.event_type === 'open_house')
  const upcomingShowings = events.filter(e => e.event_type === 'showing' && new Date(e.start_time) > new Date())

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-blue-600" /> Calendar & Open Houses
          </h1>
          <p className="text-gray-600">Drag events to reschedule them</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('month')} className={`px-3 py-2 ${viewMode === 'month' ? 'bg-blue-600 text-white' : ''}`}>
              Month
            </button>
            <button onClick={() => setViewMode('week')} className={`px-3 py-2 ${viewMode === 'week' ? 'bg-blue-600 text-white' : ''}`}>
              Week
            </button>
          </div>
          <button onClick={() => openNewEventModal(new Date())} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={18} /> New Event
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DoorOpen className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Houses</p>
              <p className="text-2xl font-bold">{openHouseEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Upcoming Showings</p>
              <p className="text-2xl font-bold">{upcomingShowings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarIcon className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-lg shadow border mb-6">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-b">{day}</div>
          ))}
          
          {getDaysInMonth().map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="p-2 bg-gray-50 min-h-[100px]" />
            
            const dateStr = date.toISOString().split('T')[0]
            const dayEvents = getEventsForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isDropTarget = dragOverDate === dateStr

            return (
              <div
                key={dateStr}
                className={`p-2 border-b border-r min-h-[100px] ${isToday ? 'bg-blue-50' : ''} ${isDropTarget ? 'bg-green-100' : ''}`}
                onDragOver={(e) => handleDragOver(e, dateStr)}
                onDragLeave={() => setDragOverDate(null)}
                onDrop={(e) => handleDrop(e, date)}
                onClick={() => openNewEventModal(date)}
              >
                <div className={`text-sm mb-1 ${isToday ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const typeConfig = getEventTypeConfig(event.event_type)
                    return (
                      <div
                        key={event.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                        onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                        className={`${typeConfig.color} text-white text-xs p-1 rounded cursor-grab active:cursor-grabbing truncate flex items-center gap-1`}
                      >
                        <GripVertical size={10} className="flex-shrink-0 opacity-60" />
                        <span className="truncate">{formatTime(event.start_time)} {event.title}</span>
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Open Houses List */}
      {openHouseEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <DoorOpen className="text-purple-600" size={20} /> Upcoming Open Houses
          </h3>
          <div className="space-y-2">
            {openHouseEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.start_time).toLocaleDateString()} • {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </p>
                  {event.property && <p className="text-sm text-gray-500">{event.property.address}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(event)} className="p-1 hover:bg-purple-100 rounded">
                    <Edit size={16} className="text-gray-500" />
                  </button>
                  <button onClick={() => deleteEvent(event.id)} className="p-1 hover:bg-red-100 rounded">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">{editingEvent ? 'Edit Event' : 'New Event'}</h2>
              <button onClick={() => { setShowModal(false); setEditingEvent(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {EVENT_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, event_type: type.value})}
                      className={`p-2 rounded-lg border text-center ${formData.event_type === type.value ? 'border-blue-500 bg-blue-50' : ''}`}
                    >
                      <type.icon size={20} className="mx-auto mb-1" />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Open House at 123 Main St"
                />
              </div>
              {properties.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">Property (Optional)</label>
                  <select
                    value={formData.property_id}
                    onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select a property...</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.address}, {p.city}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start *</label>
                  <input type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End *</label>
                  <input type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="Address or meeting link" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Name</label>
                  <input type="text" value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Phone</label>
                  <input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-between pt-4">
                {editingEvent && (
                  <button type="button" onClick={() => deleteEvent(editingEvent.id)} className="text-red-600 hover:text-red-800">
                    Delete Event
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button type="button" onClick={() => { setShowModal(false); setEditingEvent(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    {saving ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
