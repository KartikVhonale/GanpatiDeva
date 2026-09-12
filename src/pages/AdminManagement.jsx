import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserPlus,
  Users,
  UserCheck,
  Trash2,
  Power,
  RefreshCw,
  Phone,
  CheckCircle2,
  AlertCircle,
  Database,
  Search,
  ExternalLink,
  QrCode,
  Target,
  Clock,
  Check,
  X,
  Copy,
  Share2,
  Settings as SettingsIcon,
  Bell,
  MessageCircle,
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminManagement() {
  const { user, token } = useAuth();

  // Navigation Tab State: 'verification' | 'settings' | 'users'
  const [activeTab, setActiveTab] = useState('verification');

  // 1. Volunteer & User Management State
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    role: 'volunteer',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // 2. Settings Management State (Target Amount, UPI ID, QR Code)
  const [settings, setSettings] = useState({
    targetAmount: 500000,
    upiId: 'mandal.ganpati@upi',
    upiName: 'सार्वजनिक श्री गणेश उत्सव मंडळ',
    qrCodeUrl: '',
    qrCodeNote: 'स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा',
    ganeshaImages: [],
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // 3. Payment Verification Requests State
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [copiedUtr, setCopiedUtr] = useState(null);

  // 4. Donations Management & Deletion State
  const [adminDonations, setAdminDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [donationSearch, setDonationSearch] = useState('');
  const [donationFilter, setDonationFilter] = useState('all');
  const [deletingDonationId, setDeletingDonationId] = useState(null);

  // General Feedback Toast
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // =========================================================================
  // API CALLS
  // =========================================================================

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsersList(data.users);
      } else {
        throw new Error(data.error || 'वापरकर्ते आणण्यात अयशस्वी');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  }, [token]);

  // Fetch Payment Requests
  const fetchPaymentRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/payment-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.requests)) {
        setPaymentRequests(data.requests);
      }
    } catch (err) {
      console.error('Error fetching payment requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  }, [token]);

  // Fetch All Donations for Admin
  const fetchAdminDonations = useCallback(async () => {
    setLoadingDonations(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/donations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.donations)) {
        setAdminDonations(data.donations);
      }
    } catch (err) {
      console.error('Error fetching admin donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  }, [token]);

  // Initial Load
  useEffect(() => {
    fetchUsers();
    fetchSettings();
    fetchPaymentRequests();
    fetchAdminDonations();
  }, [fetchUsers, fetchSettings, fetchPaymentRequests, fetchAdminDonations]);

  // Refresh All
  const refreshAll = () => {
    fetchUsers();
    fetchSettings();
    fetchPaymentRequests();
    fetchAdminDonations();
  };

  // Delete a Donation (Admin only)
  const handleDeleteDonation = async (id, donorName, amount) => {
    if (
      !window.confirm(
        `⚠️ सावधान! खरोखर ${donorName} यांची ₹${Number(amount).toLocaleString()} ची देणगी कायमस्वरूपी हटवायची आहे का?\n\nही क्रिया पूर्ववत करता येणार नाही आणि थेट डॅशबोर्डवरील रक्कम कमी होईल.`
      )
    ) {
      return;
    }

    setDeletingDonationId(id);
    setFeedback({ type: '', message: '' });

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/donations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'देणगी हटवण्यात अयशस्वी');

      setFeedback({
        type: 'success',
        message: data.message || `₹${Number(amount).toLocaleString()} ची देणगी यशस्वीपणे हटवली!`,
      });

      setAdminDonations((prev) => prev.filter((d) => (d._id || d.id) !== id));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setDeletingDonationId(null);
    }
  };

  // =========================================================================
  // ACTIONS: SETTINGS
  // =========================================================================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setSavingSettings(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सेटिंग्ज सेव्ह करण्यात अयशस्वी');

      setFeedback({
        type: 'success',
        message: 'उत्सव लक्ष्य रक्कम व QR कोड सेटिंग्ज यशस्वीपणे सेव्ह झाल्या आणि लाइव्ह अपडेट झाल्या!',
      });
      setSettings(data.settings);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSavingSettings(false);
    }
  };

  // =========================================================================
  // ACTIONS: PAYMENT VERIFICATION REQUESTS
  // =========================================================================
  const handleApprovePayment = async (id, donorName, amount) => {
    setProcessingId(id);
    setFeedback({ type: '', message: '' });

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/payment-requests/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'मंजूर करण्यात त्रुटी आली');

      setFeedback({
        type: 'success',
        message: `₹${Number(amount).toLocaleString()} (${donorName}) ची देणगी यशस्वीपणे मंजूर केली व मुख्य डॅशबोर्डवर जोडली!`,
      });

      // Remove from list
      setPaymentRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectPayment = async (id, donorName) => {
    const reason = window.prompt(`खरोखर ${donorName} यांची पेमेंट विनंती नाकारायची आहे का? (कारण प्रविष्ट करा):`, 'पडताळणी अयशस्वी');
    if (reason === null) return;

    setProcessingId(id);
    setFeedback({ type: '', message: '' });

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/payment-requests/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'रद्द करण्यात त्रुटी आली');

      setFeedback({
        type: 'success',
        message: `${donorName} यांची पेमेंट विनंती रद्द करण्यात आली.`,
      });

      setPaymentRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setProcessingId(null);
    }
  };

  const copyUtr = (utr, id) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  // WhatsApp verification message generator
  const getWhatsAppContactUrl = (request) => {
    const cleanPhone = request.phone ? request.phone.replace(/\D/g, '') : '';
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `॥ श्री गणेशाय नमः ॥\nनमस्कार ${request.name} जी,\nसार्वजनिक श्री गणेश उत्सव मंडळ २०२६ कडून आपल्या ₹${request.amount} देणगी विनंती (UTR: ${request.utrNumber}) ची पडताळणी संदर्भात संपर्क करत आहोत.`;
    return phoneParam
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // =========================================================================
  // ACTIONS: USERS
  // =========================================================================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!formData.name.trim() || !formData.username.trim() || !formData.password) {
      setFeedback({ type: 'error', message: 'कृपया सर्व आवश्यक रकाने भरा.' });
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'वापरकर्ता जोडण्यात त्रुटी आली');

      setFeedback({
        type: 'success',
        message: `नवीन ${formData.role === 'admin' ? 'व्यवस्थापक' : 'स्वयंसेवक'} (${formData.name}) यशस्वीपणे MongoDB मध्ये जोडला गेला!`,
      });

      setFormData({
        name: '',
        username: '',
        password: '',
        phone: '',
        role: 'volunteer',
      });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, userName, currentStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'स्थिती बदलण्यात त्रुटी');

      setFeedback({
        type: 'success',
        message: `${userName} चे खाते ${!currentStatus ? 'सक्रिय' : 'निष्क्रिय'} करण्यात आले.`,
      });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`खरोखर ${userName} या सदस्याचे खाते कायमस्वरूपी हटवायचे आहे का?`)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'हटवण्यात त्रुटी आली');

      setFeedback({
        type: 'success',
        message: `${userName} चे खाते यशस्वीपणे हटवले.`,
      });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)
  );

  const previewUpiPayUrl = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiName)}&cu=INR`;
  const autoGeneratedQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(previewUpiPayUrl)}`;
  const previewQrImage = settings.qrCodeUrl || autoGeneratedQrUrl;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-orange-950/85 via-red-950/70 to-black/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-red-600 p-0.5 shadow-lg shadow-orange-600/40">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-orange-950 text-amber-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  मुख्य व्यवस्थापक नियंत्रण कक्ष (Admin Panel)
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  <Database className="h-3 w-3" />
                  MongoDB Atlas
                </span>
              </div>
              <p className="text-xs text-orange-200/75 mt-0.5">
                QR कोड संपादन, देणगी ध्येय मर्यादा, ऑनलाइन पेमेंट पडताळणी व स्वयंसेवक व्यवस्थापन
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-black/40 px-3 py-2 text-xs text-orange-200">
              <span>👑</span>
              <span>व्यवस्थापक: <strong className="text-amber-300">{user?.name}</strong></span>
            </div>

            <Link
              to="/dakshina"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-orange-950/50 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-orange-900/50 transition-all"
            >
              <span>📺 Live TV स्क्रीन</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-orange-950/50 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-orange-900/50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers || loadingRequests ? 'animate-spin' : ''}`} />
              <span>रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-2 pt-1">
          {/* Tab 1: Payment Verification Requests */}
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>ऑनलाइन पेमेंट पडताळणी</span>
            {paymentRequests.length > 0 ? (
              <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                {paymentRequests.length} नवीन
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px]">
                ० प्रलंबित
              </span>
            )}
          </button>

          {/* Tab 2: Settings & QR Code */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>ध्येय रक्कम & QR कोड सेटिंग्ज</span>
          </button>

          {/* Tab 3: Volunteer Management */}
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>स्वयंसेवक कक्ष व्यवस्थापन ({usersList.length})</span>
          </button>

          {/* Tab 4: Donations Management & Deletion */}
          <button
            type="button"
            onClick={() => setActiveTab('donations')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            <span>देणग्या व्यवस्थापन व हटवा ({adminDonations.length})</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast Banner */}
      {feedback.message && (
        <div
          className={`rounded-2xl p-4 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 border shadow-lg backdrop-blur-xl ${
            feedback.type === 'success'
              ? 'border-emerald-500/50 bg-emerald-950/80 text-emerald-200'
              : 'border-red-500/50 bg-red-950/80 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-white/60 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: ONLINE PAYMENT VERIFICATION REQUESTS                           */}
      {/* ===================================================================== */}
      {activeTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>🔔</span>
                <span>ऑनलाइन देणगी पडताळणी विनंत्या</span>
              </h2>
              <p className="text-xs text-orange-200/75">
                भाविकांनी QR कोड स्कॅन करून पाठवलेल्या UTR नंबरची खात्री करून एका क्लिकवर पावती मंजूर करा.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              {paymentRequests.length} प्रलंबित विनंत्या
            </span>
          </div>

          {loadingRequests ? (
            <div className="p-12 text-center text-orange-200/60 rounded-3xl border border-amber-500/20 bg-black/40">
              <span className="inline-block h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">विनंत्या लोड होत आहेत...</p>
            </div>
          ) : paymentRequests.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-black/60 backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-2xl mb-3">
                ✓
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                सर्व ऑनलाइन पेमेंट तपासणी पूर्ण झाली आहे!
              </h3>
              <p className="text-xs text-emerald-200/70 max-w-md mx-auto">
                सध्या कोणतीही नवीन ऑनलाइन देणगी पडताळणी प्रलंबित नाही. नवीन भाविकाने QR कोडवरून देणगी भरल्यास येथे त्वरित दिसेल.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentRequests.map((req) => (
                <div
                  key={req._id}
                  className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/70 via-red-950/50 to-black/85 p-5 backdrop-blur-xl shadow-xl space-y-3.5 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 mb-1">
                        <span>📱 UPI ऑनलाइन</span>
                        <span>•</span>
                        <span>{req.category}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {req.name}
                      </h3>
                      <span className="text-[11px] text-orange-200/70">
                        {req.city || 'ऑनलाइन भाविक'}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase text-orange-300/70 block">रक्कम</span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300">
                        ₹{Number(req.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* UTR & Transaction Details */}
                  <div className="rounded-2xl border border-amber-500/20 bg-black/50 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-200/70 text-[11px]">UTR / Ref. नंबर:</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <span>{req.utrNumber || 'उपलब्ध नाही'}</span>
                        {req.utrNumber && (
                          <button
                            type="button"
                            onClick={() => copyUtr(req.utrNumber, req._id)}
                            className="text-orange-300 hover:text-white p-0.5 cursor-pointer"
                            title="Copy UTR"
                          >
                            {copiedUtr === req._id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {req.phone && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-orange-200/70 text-[11px]">मोबाईल क्र:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white">{req.phone}</span>
                          <a
                            href={getWhatsAppContactUrl(req)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline font-bold"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-orange-200/60 pt-1 border-t border-white/5">
                      <span>वेळ:</span>
                      <span>
                        {req.timestamp
                          ? new Date(req.timestamp).toLocaleString('mr-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'आत्ताच'}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Approve / Reject */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={processingId === req._id}
                      onClick={() => handleApprovePayment(req._id, req.name, req.amount)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 px-3 text-xs font-black text-black shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {processingId === req._id ? (
                        <span>तपासत आहे...</span>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>✅ मंजूर करा (Approve)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={processingId === req._id}
                      onClick={() => handleRejectPayment(req._id, req.name)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 py-2.5 px-3 text-xs font-bold text-red-200 hover:bg-red-900/40 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                      <span>नाकार / रद्द करा</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: SETTINGS (Target Amount Limit & QR Code)                       */}
      {/* ===================================================================== */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Settings Edit Form (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/80 via-red-950/60 to-black/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-amber-500/20 pb-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  उत्सव ध्येय रक्कम व QR कोड संपादन
                </h2>
                <p className="text-[11px] text-orange-200/70">
                  येथे बदल केलेल्या सेटिंग्ज थेट Live TV स्क्रीन व मोबाईल डॅशबोर्डवर तात्काळ दिसतील.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* 1. Target Collection Limit (Edit Amount Limit) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/90 mb-1">
                  🎯 एकूण देणगी ध्येय मर्यादा (Target Collection Limit in ₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-black text-amber-400">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={settings.targetAmount}
                    onChange={(e) => setSettings({ ...settings, targetAmount: e.target.value })}
                    placeholder="उदा. 500000 किंवा 1000000"
                    className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 pl-8 pr-3.5 text-sm font-black text-amber-300 placeholder-orange-200/30 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <span className="text-[11px] text-orange-200/60 mt-0.5 block">
                  डॅशबोर्ड प्रगती पट्टी (Progress Bar) व TV स्क्रीनवरील लक्ष्य रक्कम येथे बदलते.
                </span>
              </div>

              {/* 2. Mandal UPI ID */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  📱 मंडळाचा अधिकृत UPI ID (Official UPI ID) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="उदा. mandal.ganpati@upi किंवा 9876543210@okaxis"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm font-mono text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* 3. Mandal / Account Name */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  🏛️ मंडळाचे / बँक खात्याचे नाव (Mandal Name)
                </label>
                <input
                  type="text"
                  value={settings.upiName}
                  onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                  placeholder="उदा. सार्वजनिक श्री गणेश उत्सव मंडळ"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* 4. Custom QR Code Image URL */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  🖼️ कस्टम QR कोड इमेज URL (Custom QR Image Link - Optional)
                </label>
                <input
                  type="url"
                  value={settings.qrCodeUrl}
                  onChange={(e) => setSettings({ ...settings, qrCodeUrl: e.target.value })}
                  placeholder="https://... (रिकामे ठेवल्यास सिस्टीम आपोआप वर दिलेल्या UPI ID चा QR कोड तयार करेल)"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-orange-200/60 mt-0.5 block">
                  टीप: जर आपल्याकडे बँकेचा / PhonePe / Paytm चा मूळ QR फोटो असेल, तर त्याची लिंक येथे टाका. रिकामे ठेवल्यास सिस्टीम आपोआप हाय-स्पीड QR तयार करते!
                </span>
              </div>

              {/* 5. QR Note / Banner Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  📝 QR कोड सूचना / नोट (QR Note)
                </label>
                <input
                  type="text"
                  value={settings.qrCodeNote}
                  onChange={(e) => setSettings({ ...settings, qrCodeNote: e.target.value })}
                  placeholder="उदा. स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* 6. Cloudinary Ganesha Photos Slider (Every 5s on Home) */}
              <div className="pt-2 border-t border-amber-500/20 space-y-2">
                <label className="block text-xs font-semibold text-orange-200/90">
                  🪔 मुख्य पृष्ठावरील गणेश छायाचित्रे (Cloudinary Image Links - Every 5s Slider)
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(settings.ganeshaImages) ? settings.ganeshaImages.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean);
                    setSettings({ ...settings, ganeshaImages: lines });
                  }}
                  placeholder="उदा. https://res.cloudinary.com/.../ganpati1.jpg&#10;https://res.cloudinary.com/.../ganpati2.jpg"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 px-3 text-xs font-mono text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-orange-200/70 block">
                  Cloudinary वर अपलोड केलेल्या प्रत्येक फोटोची लिंक स्वतंत्र ओळीवर (New Line) टाका. मुख्य पृष्ठावर दर ५ सेकंदांनी फोटो आपोआप बदलतील!
                </span>

                {/* Thumbnails preview */}
                {Array.isArray(settings.ganeshaImages) && settings.ganeshaImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {settings.ganeshaImages.map((imgUrl, i) => (
                      <div key={i} className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-amber-400/60 bg-black/60 shadow-md group">
                        <img src={imgUrl} alt={`Ganesha ${i + 1}`} className="h-full w-full object-cover rounded-full" />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = settings.ganeshaImages.filter((_, idx) => idx !== i);
                            setSettings({ ...settings, ganeshaImages: updated });
                          }}
                          className="absolute inset-0 bg-red-950/80 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-full"
                          title="काढून टाका"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={savingSettings}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/40 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {savingSettings ? (
                  <span>सेटिंग्ज सेव्ह होत आहेत...</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>सेटिंग्ज सेव्ह करा व Live TV वर लागू करा (Save & Publish)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview Card (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/70 via-red-950/50 to-black/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl text-center flex flex-col items-center justify-between">
            <div className="space-y-1 mb-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                <span>👁️</span>
                <span>थेट स्क्रीन प्रिव्ह्यू (Live Preview)</span>
              </div>
              <h3 className="text-base font-bold text-white">
                भाविकांना दिसणारा QR कोड
              </h3>
              <p className="text-[11px] text-orange-200/70">
                {settings.qrCodeNote || 'स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा'}
              </p>
            </div>

            {/* Rendered QR Preview */}
            <div className="relative my-2 p-3 bg-white rounded-2xl shadow-xl ring-2 ring-amber-400/50">
              <img
                src={previewQrImage}
                alt="QR Preview"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                onError={(e) => {
                  if (e.target.src !== autoGeneratedQrUrl) {
                    e.target.src = autoGeneratedQrUrl;
                  }
                }}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                {settings.upiName || 'सार्वजनिक श्री गणेश उत्सव मंडळ'}
              </div>
            </div>

            <div className="w-full mt-3 rounded-xl border border-amber-500/30 bg-black/60 p-3 text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-orange-200/70">लक्ष्य देणगी मर्यादा:</span>
                <span className="font-bold text-amber-300">₹{Number(settings.targetAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-200/70">UPI ID:</span>
                <span className="font-mono font-bold text-amber-200">{settings.upiId}</span>
              </div>
            </div>

            {/* Quick Links to Home Editable Sections */}
            <div className="w-full mt-3 rounded-2xl border border-amber-500/25 bg-black/60 p-4 text-xs space-y-2.5 text-left">
              <span className="font-bold text-amber-300 block text-xs">
                ✨ मुख्य पृष्ठावरील थेट संपादन (Quick Shortcuts):
              </span>
              <p className="text-[11px] text-orange-200/70">
                तुम्ही Admin म्हणून लॉगिन असल्याने मुख्य पृष्ठावर (Home) थेट "संपादित करा" बटनांवर क्लिक करून बदल करू शकता:
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="/#schedule"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-orange-950/40 border border-amber-500/20 hover:border-amber-400 text-amber-200 text-xs font-medium transition"
                >
                  <span>⏰ दैनिक आरत्या व महाप्रसाद वेळापत्रक</span>
                  <span className="text-[10px] text-amber-400 font-bold">मुख्य पृष्ठावर जा ↗</span>
                </a>
                <a
                  href="/#initiatives"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-orange-950/40 border border-amber-500/20 hover:border-amber-400 text-amber-200 text-xs font-medium transition"
                >
                  <span>🤝 मंडळाचे सामाजिक उपक्रम (Initiatives)</span>
                  <span className="text-[10px] text-amber-400 font-bold">मुख्य पृष्ठावर जा ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: VOLUNTEER & ADMIN MANAGEMENT (Existing Features)               */}
      {/* ===================================================================== */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form: Add New Volunteer / Admin (5 cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/80 via-red-950/60 to-black/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-amber-500/20 pb-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  नवीन सदस्य जोडा (Add Volunteer)
                </h2>
                <p className="text-[11px] text-orange-200/70">
                  स्वयंसेवक किंवा व्यवस्थापकाचे अधिकृत खाते तयार करा
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  पूर्ण नाव (Full Name) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा. राहुल सचिन मोरे"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  वापरकर्ता नाव (Username) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="उदा. rahul123 किंवा volunteer_dadar"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  पासवर्ड (Password) <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="किमान ४ अक्षरे / आकडे"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  मोबाईल नंबर (Phone Number)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="उदा. 9876543210"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  भूमिका (Role & Permissions)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'volunteer' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.role === 'volunteer'
                        ? 'bg-amber-500 text-black border border-amber-300'
                        : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40'
                    }`}
                  >
                    🚩 स्वयंसेवक (Volunteer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      formData.role === 'admin'
                        ? 'bg-amber-500 text-black border border-amber-300'
                        : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40'
                    }`}
                  >
                    👑 व्यवस्थापक (Admin)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/40 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {formSubmitting ? (
                  <span>जोडत आहे...</span>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>सदस्य खात्याची नोंद करा (Save)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Directory: Users List (7 cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/80 via-red-950/60 to-black/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3.5">
              <div>
                <h2 className="text-base font-black text-white">
                  नोंदणीकृत सदस्य यादी (Authorized Team)
                </h2>
                <p className="text-[11px] text-orange-200/70">
                  सक्रिय / निष्क्रिय करा किंवा आवश्यकतेनुसार खाते हटवा
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-orange-300/50" />
                <input
                  type="text"
                  placeholder="नाव किंवा युझरनेम शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 rounded-xl border border-amber-500/30 bg-black/50 py-1.5 pl-8 pr-3 text-xs text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="p-8 text-center text-orange-200/60">
                <span className="inline-block h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs">वापरकर्ते लोड होत आहेत...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-orange-200/60 text-xs">
                कोणताही वापरकर्ता आढळला नाही.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {filteredUsers.map((u) => {
                  const isMainAdmin = u.username === 'admin';
                  return (
                    <div
                      key={u._id}
                      className={`rounded-2xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        u.isActive
                          ? 'border-amber-500/25 bg-black/40 hover:bg-orange-950/30'
                          : 'border-red-500/20 bg-red-950/20 opacity-60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{u.name}</span>
                          <span
                            className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            }`}
                          >
                            {u.role === 'admin' ? '👑 Admin' : '🚩 Volunteer'}
                          </span>
                          {!u.isActive && (
                            <span className="rounded-full bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.2 text-[10px] font-bold">
                              निष्क्रिय
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-orange-200/60 font-mono">
                          ID: <span className="text-amber-200/90">{u.username}</span>
                          {u.phone && <span className="ml-3">📞 {u.phone}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!isMainAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u._id, u.name, u.isActive)}
                              className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                u.isActive
                                  ? 'border-amber-500/30 bg-orange-950/40 text-amber-300 hover:bg-orange-900/50'
                                  : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'
                              }`}
                              title={u.isActive ? 'निष्क्रिय करा' : 'सक्रिय करा'}
                            >
                              <Power className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">{u.isActive ? 'बंद' : 'सुरू'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-2 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-all cursor-pointer"
                              title="हटवा"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {isMainAdmin && (
                          <span className="text-[11px] text-amber-400/80 italic">
                            (मुख्य व्यवस्थापक)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ALL DONATIONS MANAGEMENT & DELETION                                 */}
      {/* ========================================================================= */}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          {/* Summary Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 text-center">
              <span className="text-[11px] font-semibold text-orange-200/70 block uppercase tracking-wider">
                एकूण देणग्या
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
                {adminDonations.length}
              </span>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 text-center">
              <span className="text-[11px] font-semibold text-orange-200/70 block uppercase tracking-wider">
                एकूण जमा रक्कम
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                ₹{adminDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4 text-center">
              <span className="text-[11px] font-semibold text-emerald-200/70 block uppercase tracking-wider">
                💵 रोख रक्कम (Cash)
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                ₹{adminDonations
                  .filter((d) => d.paymentMethod !== 'online')
                  .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-black/40 p-4 text-center">
              <span className="text-[11px] font-semibold text-blue-200/70 block uppercase tracking-wider">
                📱 ऑनलाइन (Online)
              </span>
              <span className="text-xl sm:text-2xl font-black text-blue-400 mt-1 block">
                ₹{adminDonations
                  .filter((d) => d.paymentMethod === 'online')
                  .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/60 via-red-950/40 to-black/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>💰</span>
                  <span>सर्व देणग्यांची यादी व थेट व्यवस्थापन (Live Donations List)</span>
                </h2>
                <p className="text-xs text-orange-200/70">
                  चुकीची किंवा दुबार देणगी नोंद असल्यास केवळ मुख्य व्यवस्थापक (Admin) येथून कायमस्वरूपी हटवू शकतात.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="नाव, शहर, फोन किंवा पावती शोधा..."
                  value={donationSearch}
                  onChange={(e) => setDonationSearch(e.target.value)}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-orange-200/40 outline-none focus:border-amber-400"
                />
                <Search className="h-4 w-4 text-orange-300/60 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-500/15">
              {[
                { id: 'all', label: 'सर्व देणग्या' },
                { id: 'cash', label: '💵 रोख (Cash)' },
                { id: 'online', label: '📱 ऑनलाइन (Online)' },
                { id: 'high', label: '🌟 विशेष (>₹५,०००)' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setDonationFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    donationFilter === f.id
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Donations Table */}
            {loadingDonations ? (
              <div className="py-12 text-center text-orange-200/60 text-sm">
                देणग्या लोड होत आहेत...
              </div>
            ) : adminDonations.filter((d) => {
                const q = donationSearch.toLowerCase().trim();
                const matchesSearch =
                  !q ||
                  d.name?.toLowerCase().includes(q) ||
                  d.city?.toLowerCase().includes(q) ||
                  d.category?.toLowerCase().includes(q) ||
                  d.recordedBy?.toLowerCase().includes(q) ||
                  d.phone?.includes(q) ||
                  d.utrNumber?.toLowerCase().includes(q) ||
                  String(d.amount).includes(q) ||
                  String(d._id || d.id).toLowerCase().includes(q);

                if (!matchesSearch) return false;
                if (donationFilter === 'cash') return d.paymentMethod !== 'online';
                if (donationFilter === 'online') return d.paymentMethod === 'online';
                if (donationFilter === 'high') return Number(d.amount) >= 5000;
                return true;
              }).length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-amber-500/20 bg-black/30">
                <p className="text-orange-200/60 text-sm">कोणतीही देणगी नोंद आढळली नाही.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-amber-500/20">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-black/70 text-orange-200/80 uppercase text-[11px] font-bold tracking-wider border-b border-amber-500/20">
                    <tr>
                      <th className="py-3 px-3.5">भाविक (Donor)</th>
                      <th className="py-3 px-3.5">रक्कम (Amount)</th>
                      <th className="py-3 px-3.5">सेवा वर्ग (Category)</th>
                      <th className="py-3 px-3.5">पद्धत (Method)</th>
                      <th className="py-3 px-3.5">नोंदणीकर्ता</th>
                      <th className="py-3 px-3.5">वेळ (Time)</th>
                      <th className="py-3 px-3.5 text-center">क्रिया (Admin Action)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10 bg-black/40">
                    {adminDonations
                      .filter((d) => {
                        const q = donationSearch.toLowerCase().trim();
                        const matchesSearch =
                          !q ||
                          d.name?.toLowerCase().includes(q) ||
                          d.city?.toLowerCase().includes(q) ||
                          d.category?.toLowerCase().includes(q) ||
                          d.recordedBy?.toLowerCase().includes(q) ||
                          d.phone?.includes(q) ||
                          d.utrNumber?.toLowerCase().includes(q) ||
                          String(d.amount).includes(q) ||
                          String(d._id || d.id).toLowerCase().includes(q);

                        if (!matchesSearch) return false;
                        if (donationFilter === 'cash') return d.paymentMethod !== 'online';
                        if (donationFilter === 'online') return d.paymentMethod === 'online';
                        if (donationFilter === 'high') return Number(d.amount) >= 5000;
                        return true;
                      })
                      .map((d) => {
                        const donId = d._id || d.id;
                        const isDeleting = deletingDonationId === donId;
                        return (
                          <tr key={donId} className="hover:bg-orange-950/30 transition-colors">
                            <td className="py-3 px-3.5">
                              <span className="font-bold text-white block">{d.name}</span>
                              <span className="text-[11px] text-orange-200/60">
                                📍 {d.city || 'स्थानिक भाविक'} {d.phone ? `• 📞 ${d.phone}` : ''}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 font-black text-amber-300 text-sm sm:text-base">
                              ₹{Number(d.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3.5">
                              <span className="inline-block rounded-full bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                                {d.category || 'महाप्रसाद सेवा'}
                              </span>
                            </td>
                            <td className="py-3 px-3.5">
                              {d.paymentMethod === 'online' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 text-[10px] font-bold">
                                  📱 ऑनलाइन {d.utrNumber ? `(${d.utrNumber})` : ''}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold">
                                  💵 रोख (Cash)
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-xs text-orange-200/70">
                              {d.recordedBy || 'स्वयंसेवक'}
                            </td>
                            <td className="py-3 px-3.5 text-xs text-orange-200/60 font-mono">
                              {d.timestamp
                                ? new Date(d.timestamp).toLocaleString('mr-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'आत्ताच'}
                            </td>
                            <td className="py-3 px-3.5 text-center">
                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteDonation(donId, d.name, d.amount)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-950/50 hover:bg-red-900/80 text-red-200 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                title="ही देणगी कायमस्वरूपी हटवा"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                <span>{isDeleting ? 'हटवत आहे...' : 'हटवा'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
