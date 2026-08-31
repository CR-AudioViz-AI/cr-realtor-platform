// =============================================================================
// LEAD TRIAGE INBOX - Type Definitions
// CR AudioViz AI - Realtor Platform
// Created: Monday, December 30, 2025 | 2:32 PM EST
// Hero Workflow #2: AI-powered lead prioritization
// =============================================================================

export type LeadPriority = 'hot' | 'warm' | 'cold' | 'nurture';
export type LeadSource = 'website' | 'zillow' | 'realtor' | 'referral' | 'social' | 'open_house' | 'cold_call' | 'other';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'showing' | 'offer' | 'closed' | 'lost';
export type LeadIntent = 'buying' | 'selling' | 'both' | 'renting' | 'investing' | 'unknown';
export type TimeFrame = 'immediate' | '1_3_months' | '3_6_months' | '6_12_months' | '12_plus_months' | 'unknown';

export interface Lead {
  id: string;
  agent_id: string;
  
  // Contact Info
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_contact: 'email' | 'phone' | 'text';
  
  // Lead Details
  source: LeadSource;
  source_detail?: string; // e.g., "Zillow - 123 Main St listing"
  intent: LeadIntent;
  status: LeadStatus;
  
  // Property Preferences (for buyers)
  buying_preferences?: {
    min_price?: number;
    max_price?: number;
    bedrooms_min?: number;
    bathrooms_min?: number;
    property_types?: string[];
    locations?: string[];
    must_haves?: string[];
    deal_breakers?: string[];
  };
  
  // Property Details (for sellers)
  selling_property?: {
    address: string;
    estimated_value?: number;
    timeline?: string;
    reason?: string;
  };
  
  // AI Analysis
  ai_score: number; // 0-100
  ai_priority: LeadPriority;
  ai_insights: AILeadInsights;
  
  // Engagement
  last_activity: string;
  total_interactions: number;
  email_opens: number;
  website_visits: number;
  properties_viewed: string[];
  
  // Timeline
  timeframe: TimeFrame;
  pre_approved?: boolean;
  working_with_agent?: boolean;
  
  // Notes & History
  notes: LeadNote[];
  activities: LeadActivity[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  assigned_at?: string;
  converted_at?: string;
}

export interface AILeadInsights {
  summary: string;
  key_signals: string[];
  recommended_actions: RecommendedAction[];
  conversation_starters: string[];
  objection_handlers: ObjectionHandler[];
  similar_successful_leads?: string[];
  predicted_conversion_probability: number;
  predicted_timeline_days: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
}

export interface RecommendedAction {
  id: string;
  action: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  // 2026-08-30: 'schedule' added. LeadTriageInbox sets type: 'schedule' on a
  // recommended action and renders a Calendar icon for it, but the union never
  // included it — so that icon branch was dead code TypeScript correctly called
  // unreachable. Scheduling a CMA presentation is a real lead action and the UI was
  // written for it, so the union is wrong, not the component.
  type: 'call' | 'email' | 'text' | 'showing' | 'follow_up' | 'nurture' | 'schedule';
  suggested_message?: string;
  best_time?: string;
}

export interface ObjectionHandler {
  objection: string;
  response: string;
  follow_up: string;
}

export interface LeadNote {
  id: string;
  content: string;
  created_by: string;
  created_at: string;
  is_private: boolean;
}

export interface LeadActivity {
  id: string;
  type: 'email_sent' | 'email_opened' | 'call' | 'text' | 'showing' | 'offer' | 'note' | 'status_change' | 'website_visit';
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface LeadTriageFilters {
  priority?: LeadPriority[];
  status?: LeadStatus[];
  source?: LeadSource[];
  intent?: LeadIntent[];
  timeframe?: TimeFrame[];
  min_score?: number;
  max_score?: number;
  has_phone?: boolean;
  pre_approved?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface LeadTriageStats {
  total: number;
  by_priority: Record<LeadPriority, number>;
  by_status: Record<LeadStatus, number>;
  new_today: number;
  needs_follow_up: number;
  avg_response_time_hours: number;
  conversion_rate: number;
}

export interface BulkAction {
  type: 'assign' | 'status' | 'priority' | 'tag' | 'email' | 'export';
  lead_ids: string[];
  value?: string;
  template_id?: string;
}

// AI Scoring factors
export interface LeadScoringFactors {
  engagement_score: number; // 0-25
  intent_score: number; // 0-25
  timeline_score: number; // 0-25
  qualification_score: number; // 0-25
  factors: {
    factor: string;
    points: number;
    max_points: number;
    description: string;
  }[];
}

// Quick actions for the inbox
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: 'call' | 'email' | 'text' | 'schedule' | 'note' | 'snooze';
  requires_template?: boolean;
  keyboard_shortcut?: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'call', label: 'Call', icon: 'phone', action: 'call', keyboard_shortcut: 'c' },
  { id: 'email', label: 'Email', icon: 'mail', action: 'email', requires_template: true, keyboard_shortcut: 'e' },
  { id: 'text', label: 'Text', icon: 'message-square', action: 'text', requires_template: true, keyboard_shortcut: 't' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar', action: 'schedule', keyboard_shortcut: 's' },
  { id: 'note', label: 'Add Note', icon: 'edit', action: 'note', keyboard_shortcut: 'n' },
  { id: 'snooze', label: 'Snooze', icon: 'clock', action: 'snooze', keyboard_shortcut: 'z' },
];

export const PRIORITY_CONFIG: Record<LeadPriority, { color: string; bgColor: string; label: string; icon: string }> = {
  hot: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Hot', icon: '🔥' },
  warm: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'Warm', icon: '☀️' },
  cold: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Cold', icon: '❄️' },
  nurture: { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'Nurture', icon: '🌱' },
};

export const STATUS_CONFIG: Record<LeadStatus, { color: string; label: string }> = {
  new: { color: 'text-blue-600', label: 'New' },
  contacted: { color: 'text-yellow-600', label: 'Contacted' },
  qualified: { color: 'text-green-600', label: 'Qualified' },
  showing: { color: 'text-purple-600', label: 'Showing' },
  offer: { color: 'text-indigo-600', label: 'Offer' },
  closed: { color: 'text-emerald-600', label: 'Closed' },
  lost: { color: 'text-gray-600', label: 'Lost' },
};
