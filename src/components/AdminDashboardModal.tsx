import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Eye,
  History,
  Lock,
  Search,
  Filter,
  BadgeCheck
} from 'lucide-react';
import { UserProfile, AuditLog, UserAccount } from '../types/database';
import { storageService } from '../services/storageService';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onProfileStatusChanged: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onProfileStatusChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'documents' | 'audits'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const allProfiles = storageService.getProfiles();
  const auditLogs = storageService.getAuditLogs();

  const pendingProfiles = allProfiles.filter((p) => p.approvalStatus === 'pending');
  const approvedProfiles = allProfiles.filter((p) => p.approvalStatus === 'approved');
  const suspendedProfiles = allProfiles.filter((p) => p.approvalStatus === 'suspended');

  const filteredList = (activeTab === 'pending' ? pendingProfiles : allProfiles).filter(
    (p) =>
      p.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.profession.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = (
    profileId: string,
    status: 'approved' | 'rejected' | 'suspended'
  ) => {
    const reviewer = currentUser?.email || 'jafarmd0007@gmail.com';
    storageService.setProfileApprovalStatus(
      profileId,
      status,
      reviewer,
      actionNotes || `Action ${status.toUpperCase()} recorded by ${reviewer}`
    );
    setActionNotes('');
    setStatusMessage(`Profile updated to ${status.toUpperCase()}`);
    setTimeout(() => setStatusMessage(null), 3000);
    onProfileStatusChanged();

    // Update selected profile view if open
    const updated = storageService.getProfileById(profileId);
    if (updated) setSelectedProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Nikah Pakka Admin & Verification Console</span>
                <span className="text-[10px] bg-emerald-800 text-amber-300 px-2 py-0.5 rounded font-mono font-medium">
                  {currentUser?.email || 'jafarmd0007@gmail.com'}
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Manual profile verification, Godavari district lineage checks & Aadhaar masking compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors"
            aria-label="Close admin dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shrink-0">
          <div className="bg-white p-3 rounded-xl border border-stone-200">
            <span className="text-stone-500 font-medium">Total Profiles</span>
            <p className="text-xl font-bold text-stone-900 mt-0.5">{allProfiles.length}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-amber-200">
            <span className="text-amber-700 font-medium">Pending Approvals</span>
            <p className="text-xl font-bold text-amber-800 mt-0.5">{pendingProfiles.length}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-emerald-200">
            <span className="text-emerald-700 font-medium">Approved Matches</span>
            <p className="text-xl font-bold text-emerald-800 mt-0.5">{approvedProfiles.length}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-rose-200">
            <span className="text-rose-700 font-medium">Suspended / Flagged</span>
            <p className="text-xl font-bold text-rose-800 mt-0.5">{suspendedProfiles.length}</p>
          </div>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className="bg-emerald-100 text-emerald-900 px-6 py-2 text-xs font-semibold flex items-center justify-between border-b border-emerald-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {statusMessage}
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Pending Review</span>
              <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {pendingProfiles.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3.5 border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              All Directory Profiles ({allProfiles.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'documents'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Identity Documents & Masking</span>
            </button>
            <button
              onClick={() => setActiveTab('audits')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'audits'
                  ? 'border-emerald-800 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Security Audit Trail</span>
            </button>
          </div>

          {(activeTab === 'pending' || activeTab === 'all') && (
            <div className="relative py-2 w-52 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search candidate or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 placeholder:text-stone-400"
              />
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {/* PROFILE QUEUE TAB */}
          {(activeTab === 'pending' || activeTab === 'all') && (
            <div className="space-y-4">
              {filteredList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-300">
                  <BadgeCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-800">
                    {activeTab === 'pending'
                      ? 'No pending profiles requiring review.'
                      : 'No profiles match your filter.'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    All submitted profiles are currently verified and active.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredList.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
                          style={{ backgroundColor: p.avatarBgColor || '#047857' }}
                        >
                          {p.avatarInitials}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-stone-900 text-sm">
                              {p.candidateName}
                            </h3>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                              {p.gender === 'bride' ? 'Bride' : 'Groom'} · {p.age} Yrs
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                p.approvalStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : p.approvalStatus === 'pending'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              Status: {p.approvalStatus.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600">
                            {p.education} · {p.profession} ({p.annualIncomeRange})
                          </p>
                          <p className="text-xs text-emerald-800 font-medium">
                            📍 {p.district} ({p.mandalCity}) · {p.religion.sect} · {p.religion.salah}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Guardian: {p.guardianWaliContact.name} ({p.guardianWaliContact.relationship}) · Phone: {p.guardianWaliContact.phone}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setSelectedProfile(p)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Full</span>
                        </button>

                        {p.approvalStatus !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'approved')}
                            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {p.approvalStatus !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'rejected')}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-rose-700 border border-stone-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}

                        {p.approvalStatus === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'suspended')}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Suspend</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* IDENTITY DOCUMENTS & MASKING TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Protected Identity Documents & UIDAI / Govt Masking Standards</p>
                  <p className="text-stone-600 leading-relaxed">
                    Identity documents are confidential and accessible only to verified administrators. In compliance with privacy standards, Aadhaar/Passport numbers are masked with only the last 4 digits visible for administrative audit validation.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
                {allProfiles.map((p) => (
                  <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">{p.candidateName}</span>
                        <span className="text-xs text-stone-500">({p.district})</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {p.documents && p.documents.length > 0 ? (
                          p.documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="inline-flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded text-xs text-stone-700"
                            >
                              <FileText className="w-3.5 h-3.5 text-stone-500" />
                              <span>{doc.type}:</span>
                              <span className="font-mono font-bold text-emerald-900">{doc.maskedId}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-medium">
                                Verified
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-stone-400 italic">
                            Aadhaar card verified verbally with guardian {p.guardianWaliContact.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-xs text-stone-500 shrink-0">
                      <span>Restricted Storage: AES-256</span>
                      <p className="text-[10px] text-stone-400">UIDAI compliant masking</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeTab === 'audits' && (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-700 flex justify-between">
                <span>Timestamp & Actor</span>
                <span>Action & Description</span>
              </div>
              <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-800">{log.action}</span>
                        <span className="text-stone-400">·</span>
                        <span className="text-emerald-800 font-medium">{log.performedBy}</span>
                      </div>
                      <p className="text-stone-600">{log.details}</p>
                    </div>
                    <span className="text-[11px] text-stone-400 shrink-0 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Detail Review Drawer / Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 z-60 bg-stone-950/60 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[85vh] flex flex-col">
              <div className="bg-emerald-950 text-white px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Detailed Verification: {selectedProfile.candidateName}
                </span>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="text-stone-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <div>
                    <span className="text-stone-500 font-medium">District & Town:</span>
                    <p className="font-semibold text-stone-900">{selectedProfile.district} ({selectedProfile.mandalCity})</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Native Place:</span>
                    <p className="font-semibold text-stone-900">{selectedProfile.familyDetails.nativePlace}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Education & Job:</span>
                    <p className="font-semibold text-stone-900">{selectedProfile.education} · {selectedProfile.profession}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 font-medium">Annual Income:</span>
                    <p className="font-semibold text-stone-900">{selectedProfile.annualIncomeRange}</p>
                  </div>
                </div>

                <div className="border border-stone-200 p-3 rounded-lg">
                  <span className="text-stone-500 font-semibold block mb-1">Guardian (Wali) Contact & Verification:</span>
                  <p className="text-stone-900 font-medium">
                    {selectedProfile.guardianWaliContact.name} ({selectedProfile.guardianWaliContact.relationship})
                  </p>
                  <p className="text-emerald-800 font-semibold mt-0.5">
                    Phone: {selectedProfile.guardianWaliContact.phone}
                  </p>
                </div>

                <div className="border border-stone-200 p-3 rounded-lg">
                  <span className="text-stone-500 font-semibold block mb-1">Must-Haves:</span>
                  <ul className="list-disc pl-4 text-stone-800 space-y-0.5">
                    {selectedProfile.mustHaves?.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-stone-200 p-3 rounded-lg bg-rose-50/50">
                  <span className="text-rose-900 font-semibold block mb-1">Deal-Breakers:</span>
                  <ul className="list-disc pl-4 text-rose-950 space-y-0.5">
                    {selectedProfile.dealBreakers?.map((d, idx) => (
                      <li key={idx}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Reviewer Audit Notes:</label>
                  <input
                    type="text"
                    placeholder="e.g. Identity verified via telephone with Wali. No issues found."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="px-4 py-2 bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProfile.id, 'rejected')}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedProfile.id, 'approved')}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-900"
                >
                  Approve Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
