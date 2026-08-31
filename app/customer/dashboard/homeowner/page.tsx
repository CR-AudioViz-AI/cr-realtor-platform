'use client';

import { createClient } from '@/lib/supabase/client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 2026-08-30: `supabase` was NEVER DECLARED in this file. createClient is
// imported and was called by nothing, so every database statement referenced a
// bare `supabase` that does not exist and threw ReferenceError at runtime.
//
// Same defect as /api/auth in core and three routes in javari-admin. It survived
// here because next build stops at the FIRST error, so nobody ever saw past it.
const supabase = createClient();


interface DashboardStats {
  documents: number;
  expenses_ytd: number;
  warranties_active: number;
  warranties_expiring: number;
  maintenance_due: number;
  home_value: number;
  home_value_change: number;
}

export default function HomeownerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load stats
      const response = await fetch('/api/homeowner/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setUpcomingReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const menuItems = [
    { href: '/customer/dashboard/homeowner/documents', icon: '📁', label: 'Documents', desc: 'Store & organize all home documents', count: stats?.documents },
    { href: '/customer/dashboard/homeowner/expenses', icon: '💰', label: 'Expenses', desc: 'Track spending & budgets', amount: stats?.expenses_ytd },
    { href: '/customer/dashboard/homeowner/warranties', icon: '🛡️', label: 'Warranties', desc: 'Never miss an expiration', count: stats?.warranties_active, alert: stats?.warranties_expiring },
    { href: '/customer/dashboard/homeowner/maintenance', icon: '🔧', label: 'Maintenance', desc: 'Scheduled tasks & reminders', alert: stats?.maintenance_due },
    { href: '/customer/dashboard/homeowner/value', icon: '📈', label: 'Home Value', desc: 'Track your equity', amount: stats?.home_value, change: stats?.home_value_change },
    { href: '/customer/dashboard/homeowner/export', icon: '📤', label: 'Export All', desc: 'Download everything' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Homeowner Portal</h1>
          <p className="text-indigo-100 mt-1">Everything you need to manage your home in one place</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Documents</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.documents || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">YTD Expenses</p>
            <p className="text-2xl font-bold text-gray-900">${(stats?.expenses_ytd || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Active Warranties</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.warranties_active || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-gray-500 text-sm">Est. Home Value</p>
            <p className="text-2xl font-bold text-green-600">${(stats?.home_value || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-indigo-200">
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  {item.alert && item.alert > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.alert} due
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
                {item.count !== undefined && (
                  <p className="text-indigo-600 font-medium mt-2">{item.count} items</p>
                )}
                {item.amount !== undefined && (
                  <p className="text-indigo-600 font-medium mt-2">
                    ${item.amount.toLocaleString()}
                    {item.change !== undefined && (
                      <span className={item.change >= 0 ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </span>
                    )}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ Upcoming Reminders</h2>
            <div className="space-y-3">
              {upcomingReminders.slice(0, 5).map((reminder: any) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{reminder.title}</p>
                    <p className="text-sm text-gray-500">{reminder.message}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-indigo-600">
                      {new Date(reminder.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
