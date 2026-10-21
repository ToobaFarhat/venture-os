import React, { useEffect, useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  Shield,
  Plus,
  Save,
  Mail,
  UserCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { WorkspaceService } from '../../services/api';
import { WorkspaceMember } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../contexts/AuthContext';

export const WorkspaceSettingsPage: React.FC = () => {
  const { activeWorkspace, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  // Workspace Profile Form
  const [profileData, setProfileData] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    targetAudience: '',
    currency: 'USD',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Invite Member Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Employee');
  const [inviting, setInviting] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [detailsRes, membersRes] = await Promise.all([
        WorkspaceService.getDetails(),
        WorkspaceService.getMembers(),
      ]);

      if (detailsRes.data.success) {
        const ws = detailsRes.data.data.workspace || detailsRes.data.data;
        setProfileData({
          name: ws.name || '',
          industry: ws.industry || 'Technology',
          website: ws.website || '',
          description: ws.description || '',
          targetAudience: ws.targetAudience || '',
          currency: ws.currency || 'USD',
        });
      }

      if (membersRes.data.success) {
        setMembers(membersRes.data.data.members || membersRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load workspace settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [activeWorkspace]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccess(false);
    try {
      const res = await WorkspaceService.updateProfile(profileData);
      if (res.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        refreshUser();
      }
    } catch (err) {
      console.error('Failed to update workspace profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await WorkspaceService.inviteMember({
        email: inviteEmail,
        role: inviteRole,
      });
      if (res.data.success) {
        setInviteModalOpen(false);
        setInviteEmail('');
        fetchDetails();
      }
    } catch (err) {
      console.error('Failed to invite member:', err);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    try {
      await WorkspaceService.updateMemberRole(memberId, role);
      fetchDetails();
    } catch (err) {
      console.error('Failed to update member role:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-600" />
            Workspace Profile & Team Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure tenant metadata, team member RBAC permissions, and operational preferences
          </p>
        </div>

        <Button size="sm" onClick={() => setInviteModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
          Invite Member
        </Button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Workspace profile successfully updated.</span>
        </div>
      )}

      {/* Workspace Profile Editor */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Company Information</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Workspace Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              required
            />
            <Input
              label="Industry"
              value={profileData.industry}
              onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Website"
              value={profileData.website}
              onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
              placeholder="https://novapulse.io"
            />
            <Input
              label="Target Audience"
              value={profileData.targetAudience}
              onChange={(e) => setProfileData({ ...profileData, targetAudience: e.target.value })}
              placeholder="Enterprise SaaS & Operations"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Company Description & Business Scope
            </label>
            <textarea
              rows={3}
              value={profileData.description}
              onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:border-indigo-500 focus:outline-none"
              placeholder="Autonomous BI & operations platform for fast-growing technology enterprises..."
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" loading={savingProfile} icon={<Save className="w-3.5 h-3.5" />}>
              Save Workspace Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Team Members & Roles Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Workspace Members & Permissions</h3>
          </div>
          <span className="text-xs text-slate-500">{members.length} active collaborators</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Role (RBAC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{m.userId?.name || 'Invited User'}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {m.userId?.email || m.invitedEmail}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={m.status === 'active' ? 'success' : 'warning'} size="sm">
                      {m.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={m.role}
                      onChange={(e) => handleUpdateRole(m._id, e.target.value)}
                      className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded px-2 py-1 text-slate-800"
                    >
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite New Team Member"
        size="md"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="Colleague Work Email"
            type="email"
            placeholder="colleague@company.io"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Workspace Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-lg border border-slate-300 text-xs p-2.5 focus:border-indigo-500 focus:outline-none"
            >
              <option value="Admin">Admin (Full administrative control)</option>
              <option value="Manager">Manager (Team coordination & analytics)</option>
              <option value="Employee">Employee (Tasks, CRM, & Execution)</option>
              <option value="Viewer">Viewer (Read-only access)</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={inviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
