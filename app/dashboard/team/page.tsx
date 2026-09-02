'use client';

import { useState } from 'react';
import { 
  Users, UserPlus, Mail, Phone, Shield, Edit2, Trash2,
  Check, X, Building, Crown, TrendingUp, Home, DollarSign
} from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'agent' | 'assistant';
  status: 'active' | 'pending' | 'inactive';
  commission_split?: number;
  joined_at: string;
  stats?: { active_listings: number; closed_ytd: number; volume_ytd: number; };
}

const ROLES = {
  owner: { label: 'Owner', color: 'purple', icon: Crown },
  admin: { label: 'Admin', color: 'blue', icon: Shield },
  agent: { label: 'Agent', color: 'green', icon: Users },
  assistant: { label: 'Assistant', color: 'gray', icon: Users },
};

const DEMO_MEMBERS: TeamMember[] = [
  { id: '1', email: 'agent@example.com', full_name: 'Lead Agent', role: 'owner', status: 'active', commission_split: 80, joined_at: '2024-01-01', stats: { active_listings: 4, closed_ytd: 12, volume_ytd: 4500000 } },
  { id: '2', email: 'agent2@example.com', full_name: 'Agent', role: 'agent', status: 'active', commission_split: 70, joined_at: '2024-01-01', stats: { active_listings: 4, closed_ytd: 8, volume_ytd: 2800000 } },
];

export default function TeamManagementPage() {
  const [members] = useState<TeamMember[]>(DEMO_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'agent' as const, message: '' });

  const teamStats = {
    totalMembers: members.filter(m => m.status === 'active').length,
    totalListings: members.reduce((sum, m) => sum + (m.stats?.active_listings || 0), 0),
    closedYTD: members.reduce((sum, m) => sum + (m.stats?.closed_ytd || 0), 0),
    volumeYTD: members.reduce((sum, m) => sum + (m.stats?.volume_ytd || 0), 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your team members and permissions</p>
        </div>
        <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
          <UserPlus className="w-5 h-5" />Invite Team Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{teamStats.totalMembers}</p><p className="text-sm text-gray-600">Team Members</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><Home className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{teamStats.totalListings}</p><p className="text-sm text-gray-600">Active Listings</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><TrendingUp className="w-6 h-6 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{teamStats.closedYTD}</p><p className="text-sm text-gray-600">Closed YTD</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><DollarSign className="w-6 h-6 text-yellow-600" /></div>
            <div><p className="text-2xl font-bold">${(teamStats.volumeYTD / 1000000).toFixed(1)}M</p><p className="text-sm text-gray-600">Volume YTD</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Member</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Performance</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Split</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((member) => {
              const RoleIcon = ROLES[member.role]?.icon || Users;
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">{member.full_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.full_name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${ROLES[member.role]?.color}-100 text-${ROLES[member.role]?.color}-700`}>
                      <RoleIcon className="w-3 h-3" />{ROLES[member.role]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p><span className="font-medium">{member.stats?.active_listings || 0}</span> listings</p>
                      <p className="text-gray-500">{member.stats?.closed_ytd || 0} closed YTD</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{member.commission_split}%</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} placeholder="colleague@example.com" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'agent' })} className="w-full px-4 py-2 border rounded-lg">
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                  <option value="assistant">Assistant</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
