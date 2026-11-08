import React, { useState, useEffect } from 'react';
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
  BadgeCheck,
  Camera,
  Star,
  ExternalLink,
  RefreshCw,
  Sparkles,
  FileCheck,
  Check,
  ChevronRight,
  Phone,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile, AuditLog, UserAccount, ValidGovtDocType } from '../types/database';
import { storageService } from '../services/storageService';
import { fetchAllRegistrations, updateProfileApprovalStatusFirestore } from '../services/firestoreService';
import { VALID_GOVT_DOC_TYPES } from '../utils/matrimony';
import { isAdminUser } from '../utils/admin';

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
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all' | 'documents' | 'audits'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [actionNotes, setActionNotes] = useState('');
  const [selectedRejectionReason, setSelectedRejectionReason] = useState('Candidate photo does not meet clarity or modesty guidelines');
  const [showRejectDrawer, setShowRejectDrawer] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !isAdminUser(currentUser)) return;

    let cancelled = false;
    setLoading(true);

    fetchAllRegistrations()
      .then((data) => {
        if (!cancelled) setProfiles(data);
      })
      .catch((error) => {
        console.error('Admin registrations could not be loaded:', error);
        if (!cancelled) {
          setStatusMessage('Unable to load registrations. Please confirm administrator access and Firestore rules.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, currentUser?.id, currentUser?.role]);

  if (!isOpen || currentUser?.role !== 'admin') return null;

  const auditLogs = storageService.getAuditLogs();

  const pendingProfiles = profiles.filter((p) => p.approvalStatus === 'pending');
  const approvedProfiles = profiles.filter((p) => p.approvalStatus === 'approved');
  const rejectedProfiles = profiles.filter((p) => p.approvalStatus === 'rejected');
  const suspendedProfiles = profiles.filter((p) => p.approvalStatus === 'suspended');

  const getFilteredList = () => {
    let list: UserProfile[] = [];
    if (activeTab === 'pending') list = pendingProfiles;
    else if (activeTab === 'approved') list = approvedProfiles;
    else if (activeTab === 'rejected') list = [...rejectedProfiles, ...suspendedProfiles];
    else list = profiles;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.candidateName.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        (p.documents && p.documents.some((d) => d.type.toLowerCase().includes(q) || d.maskedId.toLowerCase().includes(q)))
    );
  };

  const filteredList = getFilteredList();

  const handleUpdateStatus = async (
    profileId: string,
    status: 'approved' | 'rejected' | 'suspended',
    customNote?: string
  ) => {
    const reviewer = currentUser?.email || 'jafarmd0007@gmail.com';
    const noteToRecord =
      customNote ||
      actionNotes ||
      (status === 'approved'
        ? 'Profile approved based on verified candidate photo and valid identity document.'
        : status === 'rejected'
        ? selectedRejectionReason
        : 'Profile suspended by admin.');

    const profileToUpdate = profiles.find(p => p.id === profileId);
    if (!profileToUpdate) return;

    await updateProfileApprovalStatusFirestore(profileId, profileToUpdate.userId, status, reviewer, noteToRecord);
    
    setActionNotes('');
    setShowRejectDrawer(false);
    setStatusMessage(`Profile ${status === 'approved' ? 'APPROVED' : status === 'rejected' ? 'REJECTED' : 'SUSPENDED'} successfully.`);
    setTimeout(() => setStatusMessage(null), 3500);
    
    // Refresh local list
    const updatedProfiles = await fetchAllRegistrations();
    setProfiles(updatedProfiles);
    onProfileStatusChanged();

    // Update selected profile view if open
    const updated = updatedProfiles.find(p => p.id === profileId);
    if (updated) {
      setSelectedProfile(updated);
    }
  };

  const handleOpenDetailModal = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setSelectedPhotoIndex(0);
    setActionNotes('');
    setShowRejectDrawer(false);
  };

  const REJECTION_REASONS = [
    'Candidate photo is unclear, low resolution, or face not recognizable',
    'Photograph does not meet Islamic modesty / decent attire standards',
    'Suspected duplicate account, stock photo, or celebrity image',
    'Invalid, expired, or unreadable Government ID document',
    'Government ID document name does not match candidate biodata name',
    'Document uploaded is not an accepted ID (only Aadhaar, PAN, Passport, Driving Licence are valid)',
    'Guardian / Wali contact details unreachable or unverified',
    'Incomplete biodata particulars or misleading information',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white flex items-center gap-2">
                <span>Nikah Pakka Admin & Verification Console</span>
                <span className="text-[10px] bg-emerald-800 text-amber-300 px-2.5 py-0.5 rounded font-mono font-medium">
                  Authorized Administrator
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Full authority to Approve or Reject candidate profiles based on Photo Clarity and Valid Government ID Proof
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
            aria-label="Close admin dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Bar */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                : 'bg-white border-stone-200 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-800 font-bold">Pending Review</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </div>
            <p className="text-2xl font-bold text-amber-900 mt-0.5">{pendingProfiles.length}</p>
            <span className="text-[10px] text-stone-500">Requires Photo & ID check</span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'approved'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                : 'bg-white border-stone-200 hover:border-emerald-200'
            }`}
          >
            <span className="text-emerald-700 font-bold">Approved Matches</span>
            <p className="text-2xl font-bold text-emerald-800 mt-0.5">{approvedProfiles.length}</p>
            <span className="text-[10px] text-stone-500">Active in public matches</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'rejected'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400/30'
                : 'bg-white border-stone-200 hover:border-rose-200'
            }`}
          >
            <span className="text-rose-700 font-bold">Rejected / Suspended</span>
            <p className="text-2xl font-bold text-rose-800 mt-0.5">{rejectedProfiles.length + suspendedProfiles.length}</p>
            <span className="text-[10px] text-stone-500">Revisions or invalid ID</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeTab === 'all'
                ? 'bg-stone-100 border-stone-300 ring-2 ring-stone-400/30'
                : 'bg-white border-stone-200 hover:border-stone-300'
            }`}
          >
            <span className="text-stone-600 font-bold">Total Directory</span>
            <p className="text-2xl font-bold text-stone-900 mt-0.5">{allProfiles.length}</p>
            <span className="text-[10px] text-stone-500">All registered profiles</span>
          </button>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className="bg-emerald-100 text-emerald-950 px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b border-emerald-200 shadow-xs">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {statusMessage}
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 flex flex-wrap items-center justify-between bg-white shrink-0 gap-2">
          <div className="flex gap-4 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'pending'
                  ? 'border-emerald-800 text-emerald-900 font-bold'
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
              className={`py-3.5 border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'border-emerald-800 text-emerald-900 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              All Profiles ({allProfiles.length})
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'rejected'
                  ? 'border-emerald-800 text-emerald-900 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <span>Rejected ({rejectedProfiles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'documents'
                  ? 'border-emerald-800 text-emerald-900 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Valid Govt IDs (Aadhaar/PAN/Passport/DL)</span>
            </button>

            <button
              onClick={() => setActiveTab('audits')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'audits'
                  ? 'border-emerald-800 text-emerald-900 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>
          </div>

          {(activeTab === 'pending' || activeTab === 'all' || activeTab === 'approved' || activeTab === 'rejected') && (
            <div className="relative py-2 w-52 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search candidate, district, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 placeholder:text-stone-400"
              />
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
          {/* PROFILE QUEUE TAB (pending, all, approved, rejected) */}
          {(activeTab === 'pending' || activeTab === 'all' || activeTab === 'approved' || activeTab === 'rejected') && (
            <div className="space-y-4">
              {filteredList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-300">
                  <BadgeCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-800">
                    {activeTab === 'pending'
                      ? 'Alhamdulillah! No pending profiles currently requiring review.'
                      : 'No profiles match your filter.'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    All submitted candidate photographs and identity documents have been inspected.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredList.map((p) => {
                    const hasPhotos = p.photos && p.photos.length > 0;
                    const doc = p.documents && p.documents.length > 0 ? p.documents[0] : null;

                    return (
                      <div
                        key={p.id}
                        className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          p.approvalStatus === 'pending'
                            ? 'border-amber-300 bg-amber-50/20'
                            : p.approvalStatus === 'rejected'
                            ? 'border-rose-200 bg-rose-50/10'
                            : 'border-stone-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Candidate Photo Thumbnail */}
                          <div className="relative shrink-0">
                            {hasPhotos ? (
                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-emerald-700/40 shadow-xs relative bg-stone-900">
                                <img
                                  src={p.photos[0]}
                                  alt={p.candidateName}
                                  className="w-full h-full object-cover"
                                />
                                {p.photos.length > 1 && (
                                  <span className="absolute bottom-0 right-0 bg-stone-950/80 text-white text-[9px] font-mono px-1 rounded-tl">
                                    📷 {p.photos.length}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs"
                                style={{ backgroundColor: p.avatarBgColor || '#047857' }}
                              >
                                {p.avatarInitials}
                              </div>
                            )}
                          </div>

                          {/* Candidate Particulars & Document Badges */}
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
                                {p.approvalStatus.toUpperCase()}
                              </span>
                            </div>

                            <p className="text-xs text-stone-600">
                              {p.education} · {p.profession} ({p.annualIncomeRange})
                            </p>

                            <p className="text-xs text-emerald-800 font-medium">
                              📍 {p.district} ({p.mandalCity}) · {p.religion.sect} · {p.religion.salah}
                            </p>

                            {/* Verification Badges for Photo & Valid Govt ID */}
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              {/* Photo status chip */}
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded">
                                <Camera className="w-3 h-3 text-emerald-700" />
                                <span>{hasPhotos ? `${p.photos.length} Photo(s) Attached` : 'No Photo Uploaded'}</span>
                              </span>

                              {/* Government ID Chip */}
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200 px-2 py-0.5 rounded">
                                <FileCheck className="w-3 h-3 text-emerald-700" />
                                <span>{doc ? doc.type : 'Govt ID'}:</span>
                                <strong className="font-mono text-emerald-900">{doc ? doc.maskedId : 'Pending'}</strong>
                              </span>

                              {p.photoPrivacy === 'blurred_until_request' && (
                                <span className="text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                  Modesty: Blurred for Public
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-stone-500 pt-0.5">
                              Guardian: {p.guardianWaliContact.name} ({p.guardianWaliContact.relationship}) · Phone: {p.guardianWaliContact.phone}
                            </p>

                            {p.approvalNotes && (
                              <p className="text-[11px] text-stone-600 italic bg-stone-100/80 p-1.5 rounded border border-stone-200">
                                <strong>Admin Note:</strong> {p.approvalNotes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Direct Admin Action Rights */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
                          <button
                            onClick={() => handleOpenDetailModal(p)}
                            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-stone-600" />
                            <span>Inspect Photo & ID</span>
                          </button>

                          {p.approvalStatus !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'approved', 'Approved by Admin based on valid photograph and identity document.')}
                              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                              title="Approve candidate based on photo and identity"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                              <span>Approve (Photo & ID OK)</span>
                            </button>
                          )}

                          {p.approvalStatus !== 'rejected' && (
                            <button
                              onClick={() => {
                                setSelectedProfile(p);
                                setShowRejectDrawer(true);
                              }}
                              className="px-3 py-2 bg-stone-100 hover:bg-rose-50 text-rose-700 border border-stone-200 hover:border-rose-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title="Reject profile"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Reject</span>
                            </button>
                          )}

                          {p.approvalStatus === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(p.id, 'suspended', 'Suspended by Admin review.')}
                              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Suspend</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                  <p className="font-semibold text-sm">Protected Identity Documents & Valid Document Standards</p>
                  <p className="text-stone-600 leading-relaxed">
                    In compliance with Indian matrimony and UIDAI standards, valid identification documents are strictly restricted to <strong>Aadhaar Card</strong>, <strong>PAN Card</strong>, <strong>Passport</strong>, or <strong>Driving Licence</strong>. Full identity numbers are masked with only the last 4 digits visible to prevent identity theft.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
                {allProfiles.map((p) => {
                  const doc = p.documents && p.documents.length > 0 ? p.documents[0] : null;
                  return (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900 text-sm">{p.candidateName}</span>
                          <span className="text-xs text-stone-500">({p.district})</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              p.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-900'
                                : p.approvalStatus === 'pending'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {p.approvalStatus.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {doc ? (
                            <div className="inline-flex items-center gap-1.5 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded text-xs text-stone-800">
                              <FileText className="w-3.5 h-3.5 text-stone-500" />
                              <span className="font-semibold">{doc.type}:</span>
                              <span className="font-mono font-bold text-emerald-900">{doc.maskedId}</span>
                              <span className="text-[10px] bg-stone-200 text-stone-700 px-1 py-0.5 rounded">
                                {doc.fileName}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                  doc.verified
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {doc.verified ? 'Verified' : 'Pending Verification'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 italic">No government ID attached</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenDetailModal(p)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Proof</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
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

        {/* Detailed Profile Verification Studio Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Studio Header */}
              <div className="bg-emerald-950 text-white px-6 py-3.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Photo & Identity Verification: {selectedProfile.candidateName}
                    </h3>
                    <span className="text-[10px] text-stone-300">
                      ID: #{selectedProfile.id} · Status: {selectedProfile.approvalStatus.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="p-1 text-stone-300 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Studio Scrollable Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs">
                {/* 1. PHOTO VERIFICATION STUDIO */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-emerald-800" />
                      <h4 className="text-xs font-bold text-stone-900">
                        1. Candidate Photographs Inspection ({selectedProfile.photos?.length || 0} Pictures Uploaded)
                      </h4>
                    </div>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-mono">
                      Photo #{selectedPhotoIndex + 1} of {selectedProfile.photos?.length || 1}
                    </span>
                  </div>

                  {selectedProfile.photos && selectedProfile.photos.length > 0 ? (
                    <div className="space-y-3">
                      {/* Large Photo Inspector View */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="w-full sm:w-56 h-56 rounded-xl overflow-hidden border-2 border-emerald-800/40 bg-stone-900 relative shadow-sm shrink-0">
                          <img
                            src={selectedProfile.photos[selectedPhotoIndex] || selectedProfile.photos[0]}
                            alt="Candidate high-res inspection"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-2 left-2 bg-stone-950/80 text-white text-[9px] px-2 py-0.5 rounded">
                            {selectedPhotoIndex === 0 ? 'Cover Photo' : `Photo #${selectedPhotoIndex + 1}`}
                          </span>
                        </div>

                        {/* Photo Verification Checklist */}
                        <div className="flex-1 space-y-2">
                          <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1.5">
                            <span className="font-semibold text-stone-900 block text-xs">Admin Photo Verification Checklist:</span>
                            <div className="space-y-1 text-stone-700">
                              <p className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>Clear front-facing portrait with visible facial features</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>Modest Islamic attire & respectful posture</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>No watermark, no stock model, no AI distortion</span>
                              </p>
                            </div>
                          </div>

                          <div className="p-2.5 bg-stone-100 rounded-lg text-stone-600 text-[11px]">
                            <span>Public Privacy Preference: </span>
                            <strong>
                              {selectedProfile.photoPrivacy === 'blurred_until_request'
                                ? 'Blurred for public (Admin has unrestricted view for validation)'
                                : 'Visible to logged-in members'}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Photo Thumbnail Strip */}
                      {selectedProfile.photos.length > 1 && (
                        <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1">
                          {selectedProfile.photos.map((picUrl, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedPhotoIndex(idx)}
                              className={`relative rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                selectedPhotoIndex === idx
                                  ? 'border-emerald-700 ring-2 ring-emerald-500/40 scale-105'
                                  : 'border-stone-300 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={picUrl}
                                alt={`Candidate thumbnail ${idx + 1}`}
                                className="w-12 h-12 object-cover"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-stone-950/80 text-[7px] text-white text-center font-mono">
                                #{idx + 1}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
                      No photograph uploaded. Monogram avatar in use ({selectedProfile.avatarInitials}).
                    </div>
                  )}
                </div>

                {/* 2. IDENTITY DOCUMENT VERIFICATION STUDIO */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-800" />
                      <h4 className="text-xs font-bold text-stone-900">
                        2. Government Identity Document Proof
                      </h4>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded">
                      Accepted: Aadhaar · PAN · Passport · Driving Licence
                    </span>
                  </div>

                  {selectedProfile.documents && selectedProfile.documents.length > 0 ? (
                    <div className="space-y-3">
                      {selectedProfile.documents.map((doc, idx) => (
                        <div
                          key={doc.id || idx}
                          className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900">{doc.type}</span>
                              <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {doc.maskedId}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 font-mono">
                              File: {doc.fileName} · Uploaded: {doc.uploadedAt}
                            </p>
                            <p className="text-[11px] text-stone-600">
                              Storage: <strong>Encrypted AES-256 (UIDAI Compliant)</strong> · Access: <strong>Admin Only</strong>
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                doc.verified
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {doc.verified ? '✓ ID Verified' : '⏳ Pending Review'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
                      No document records attached.
                    </div>
                  )}

                  {/* ID Match Checklist */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-stone-200">
                    <div>
                      <span className="text-stone-500 font-medium block">Candidate Name on File:</span>
                      <p className="font-bold text-stone-900 text-xs">{selectedProfile.candidateName}</p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium block">District / Town:</span>
                      <p className="font-bold text-stone-900 text-xs">{selectedProfile.district} ({selectedProfile.mandalCity})</p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium block">Guardian (Wali) Verification:</span>
                      <p className="font-semibold text-stone-900 text-xs">
                        {selectedProfile.guardianWaliContact.name} ({selectedProfile.guardianWaliContact.relationship})
                      </p>
                    </div>
                    <div>
                      <span className="text-stone-500 font-medium block">Wali Telephone Contact:</span>
                      <p className="font-mono font-bold text-emerald-800 text-xs">{selectedProfile.guardianWaliContact.phone}</p>
                    </div>
                  </div>
                </div>

                {/* 3. REJECTION REASON DRAWER (If triggered) */}
                {showRejectDrawer && (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-700" />
                        <span>Specify Profile Rejection Reason:</span>
                      </span>
                      <button
                        onClick={() => setShowRejectDrawer(false)}
                        className="text-rose-700 hover:text-rose-900 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-stone-700 font-semibold">Standard Reason *</label>
                      <select
                        value={selectedRejectionReason}
                        onChange={(e) => setSelectedRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs text-stone-900 font-medium"
                      >
                        {REJECTION_REASONS.map((reason, idx) => (
                          <option key={idx} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Additional Notes / Feedback for Candidate:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Please upload a clear face portrait without sunglasses, or upload valid Aadhaar/PAN."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs text-stone-900"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setShowRejectDrawer(false)}
                        className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 text-xs font-semibold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedProfile.id, 'rejected', selectedRejectionReason + (actionNotes ? ` - ${actionNotes}` : ''))}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                {/* Audit Note input when not rejecting */}
                {!showRejectDrawer && (
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      Admin Reviewer Audit Note (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Photo verified with proper modesty; valid Aadhaar card verified with guardian."
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="text-[11px] text-stone-500">
                  Reviewer: <strong className="font-mono text-emerald-900">Authorized Administrator</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProfile(null)}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-lg"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => setShowRejectDrawer(true)}
                    className="px-4 py-2 bg-stone-100 hover:bg-rose-50 text-rose-700 border border-stone-300 hover:border-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Profile</span>
                  </button>

                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        selectedProfile.id,
                        'approved',
                        actionNotes || 'Approved by Admin based on verified candidate photograph and valid government identity proof.'
                      )
                    }
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>Approve Profile (Photo & ID Verified)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
