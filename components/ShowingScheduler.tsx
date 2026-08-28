'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Calendar, Clock, MapPin, User, Phone, Mail, 
  ChevronLeft, ChevronRight, Check, X, AlertCircle,
  Home, CalendarDays, MessageSquare
} from 'lucide-react';
import { secretKey, supabaseUrl } from "@craudioviz/platform-sdk";

function getSupabase() {
  var sb = require('@supabase/supabase-js')
  var url = supabaseUrl()
  var key = secretKey()
  if (!url || !key) return null
  return sb.createClient(url, key, { auth: { persistSession: false } })
}
;

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ShowingRequest {
  id?: string;
  property_id: string;
  property_address: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  preferred_date: string;
  preferred_time: string;
  alternate_date?: string;
  alternate_time?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface AgentAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '10:00 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '12:00 PM', available: true },
  { time: '01:00 PM', available: true },
  { time: '02:00 PM', available: true },
  { time: '03:00 PM', available: true },
  { time: '04:00 PM', available: true },
  { time: '05:00 PM', available: true },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

interface ShowingSchedulerProps {
  propertyId: string;
  propertyAddress: string;
  agentId: string;
  agentName: string;
  agentPhone?: string;
  agentEmail?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShowingScheduler({
  propertyId,
  propertyAddress,
  agentId,
  agentName,
  agentPhone,
  agentEmail,
  onSuccess,
  onCancel,
}: ShowingSchedulerProps) {
  const supabase = createClient();
  const [step, setStep] = useState<'date' | 'time' | 'info' | 'confirm' | 'success'>('date');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [alternateDate, setAlternateDate] = useState<Date | null>(null);
  const [alternateTime, setAlternateTime] = useState<string | null>(null);
  const [showAlternate, setShowAlternate] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Fetch booked slots for the selected date
  useEffect(() => {
    if (selectedDate) {
      fetchBookedSlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchBookedSlots = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const { data } = await supabase
        .from('showings')
        .select('showing_time')
        .eq('property_id', propertyId)
        .eq('showing_date', dateStr)
        .in('status', ['pending', 'confirmed']);

      const booked = new Set((data || []).map(s => s.showing_time));
      setBookedSlots(booked);
      
      // Update available slots
      setTimeSlots(DEFAULT_TIME_SLOTS.map(slot => ({
        ...slot,
        available: !booked.has(slot.time),
      })));
    } catch (err) {
      console.error('Error fetching booked slots:', err);
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Empty slots before first day
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Can't book in the past
    if (date < today) return true;
    
    // Can't book more than 30 days out
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    if (date > maxDate) return true;
    
    // Can't book on Sundays (optional - agent can configure)
    // if (date.getDay() === 0) return true;
    
    return false;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const showingData = {
        property_id: propertyId,
        agent_id: agentId,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        showing_date: selectedDate.toISOString().split('T')[0],
        showing_time: selectedTime,
        alternate_date: alternateDate?.toISOString().split('T')[0] || null,
        alternate_time: alternateTime || null,
        notes: formData.message || null,
        status: 'pending',
        source: 'self_service',
      };

      const { error: insertError } = await supabase
        .from('showings')
        .insert(showingData);

      if (insertError) throw insertError;

      // Send email notifications
      await fetch('/api/showings/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...showingData,
          property_address: propertyAddress,
          agent_name: agentName,
          agent_email: agentEmail,
        }),
      });

      setStep('success');
      onSuccess?.();
    } catch (err) {
      console.error('Error scheduling showing:', err);
      setError('Failed to schedule showing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <h2 className="text-xl font-bold">Schedule a Showing</h2>
        <p className="text-blue-100 text-sm mt-1 truncate">{propertyAddress}</p>
      </div>

      {/* Progress Steps */}
      <div className="flex border-b">
        {['date', 'time', 'info', 'confirm'].map((s, i) => (
          <div
            key={s}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              step === s
                ? 'text-blue-600 border-b-2 border-blue-600'
                : step === 'success' || 
                  (s === 'date' && ['time', 'info', 'confirm', 'success'].includes(step)) ||
                  (s === 'time' && ['info', 'confirm', 'success'].includes(step)) ||
                  (s === 'info' && ['confirm', 'success'].includes(step))
                ? 'text-green-600'
                : 'text-gray-400'
            }`}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      <div className="p-6">
        {/* Step 1: Select Date */}
        {step === 'date' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => {
                  const prev = new Date(currentMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCurrentMonth(prev);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={() => {
                  const next = new Date(currentMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCurrentMonth(next);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((date, i) => (
                <button
                  key={i}
                  onClick={() => date && !isDateDisabled(date) && setSelectedDate(date)}
                  disabled={!date || isDateDisabled(date)}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg
                    ${!date ? '' : isDateDisabled(date)
                      ? 'text-gray-300 cursor-not-allowed'
                      : selectedDate?.toDateString() === date.toDateString()
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'hover:bg-blue-50 text-gray-700'
                    }
                  `}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep('time')}
                disabled={!selectedDate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === 'time' && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span>{selectedDate && formatDate(selectedDate)}</span>
              <button
                onClick={() => setStep('date')}
                className="text-blue-600 text-sm hover:underline ml-auto"
              >
                Change
              </button>
            </div>

            <h3 className="font-medium mb-3">Select a time:</h3>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                  className={`
                    py-3 px-2 text-sm rounded-lg border font-medium
                    ${!slot.available
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                      : selectedTime === slot.time
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:border-blue-300 hover:bg-blue-50'
                    }
                  `}
                >
                  {slot.time}
                </button>
              ))}
            </div>

            {/* Alternate Time Option */}
            <div className="mt-4">
              <button
                onClick={() => setShowAlternate(!showAlternate)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showAlternate ? '- Remove alternate time' : '+ Add alternate time'}
              </button>
              
              {showAlternate && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Select an alternate date/time if preferred time is unavailable:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={alternateDate?.toISOString().split('T')[0] || ''}
                      onChange={(e) => setAlternateDate(e.target.value ? new Date(e.target.value) : null)}
                      className="px-3 py-2 border rounded-lg text-sm"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <select
                      value={alternateTime || ''}
                      onChange={(e) => setAlternateTime(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">Select time</option>
                      {DEFAULT_TIME_SLOTS.map(slot => (
                        <option key={slot.time} value={slot.time}>{slot.time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep('date')}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep('info')}
                disabled={!selectedTime}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step === 'info' && (
          <div>
            <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{selectedDate && formatDate(selectedDate)}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{selectedTime}</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Any questions or special requests..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep('time')}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!formData.name || !formData.email || !formData.phone}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Review
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 'confirm' && (
          <div>
            <h3 className="font-semibold text-lg mb-4">Confirm Your Showing</h3>
            
            <div className="space-y-4">
              {/* Property */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Property</p>
                  <p className="font-medium">{propertyAddress}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <CalendarDays className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">{selectedDate && formatDate(selectedDate)}</p>
                  <p className="text-gray-600">{selectedTime}</p>
                  {alternateDate && alternateTime && (
                    <p className="text-sm text-gray-500 mt-1">
                      Alternate: {formatDate(alternateDate)} at {alternateTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Your Information</p>
                  <p className="font-medium">{formData.name}</p>
                  <p className="text-gray-600">{formData.email}</p>
                  <p className="text-gray-600">{formData.phone}</p>
                </div>
              </div>

              {/* Agent */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-600">Your Agent</p>
                  <p className="font-medium text-blue-900">{agentName}</p>
                  {agentPhone && <p className="text-blue-700">{agentPhone}</p>}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep('info')}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirm Showing
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Showing Requested!</h3>
            <p className="text-gray-600 mb-6">
              {agentName} will confirm your showing shortly. You'll receive an email at <strong>{formData.email}</strong> with the confirmation details.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-gray-500 mb-1">Requested Date & Time</p>
              <p className="font-medium">{selectedDate && formatDate(selectedDate)}</p>
              <p className="text-gray-600">{selectedTime}</p>
            </div>

            <button
              onClick={onCancel}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

