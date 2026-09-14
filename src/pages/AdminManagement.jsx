import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Trash2,
  Power,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Search,
  ExternalLink,
  QrCode,
  Target,
  Check,
  X,
  Copy,
  Bell,
  MessageCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  Clock,
  Lock,
  Receipt,
  Megaphone,
  Edit3,
  Pin,
} from 'lucide-react';
import { buildOfficialUpiUrl, generateUpiQrDataUrl } from '../utils/upiHelper';
import ReceiptModal from '../components/ReceiptModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminManagement() {
  const { user, token } = useAuth();
  const { t, isMarathi } = useLanguage();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'verification';
  // Navigation Tab State: 'verification' | 'settings' | 'notices' | 'users' | 'donations' | 'security'
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['verification', 'settings', 'notices', 'users', 'donations', 'security'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

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
  const [showPassword, setShowPassword] = useState(false);

  // 2. Settings Management State (Target Amount, UPI ID, QR Code)
  const [settings, setSettings] = useState({
    targetAmount: 500000,
    upiId: '8484844728@slc',
    upiName: 'श्री बाल गणेश मंडळ धानोरा बु.',
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
  const [selectedAdminReceipt, setSelectedAdminReceipt] = useState(null);
  const [isAdminReceiptOpen, setIsAdminReceiptOpen] = useState(false);

  // 5. Security & Blocked IPs State
  const [blockedIps, setBlockedIps] = useState([]);
  const [loadingBlockedIps, setLoadingBlockedIps] = useState(false);
  const [unblockingIp, setUnblockingIp] = useState(null);

  // 6. Notice Board Management State
  const [adminNotices, setAdminNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [submittingNotice, setSubmittingNotice] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    isActive: true,
  });

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
        throw new Error(data.error || (isMarathi ? 'वापरकर्ते आणण्यात अयशस्वी' : 'Failed to fetch users'));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [token, isMarathi]);

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

  // Fetch Blocked IPs
  const fetchBlockedIps = useCallback(async () => {
    setLoadingBlockedIps(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/security/blocked-ips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.blockedIps)) {
        setBlockedIps(data.blockedIps);
      }
    } catch (err) {
      console.error('Error fetching blocked IPs:', err);
    } finally {
      setLoadingBlockedIps(false);
    }
  }, [token]);

  // Unblock IP
  const handleUnblockIp = async (ip) => {
    setUnblockingIp(ip);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/security/unblock-ip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: data.message || `IP ${ip} यशस्वीरित्या अनब्लॉक केला आहे.`,
        });
        setBlockedIps((prev) => prev.filter((b) => b.ip !== ip));
      } else {
        throw new Error(data.error || 'Failed to unblock IP');
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUnblockingIp(null);
    }
  };

  // Fetch Notices for Admin
  const fetchAdminNotices = useCallback(async () => {
    setLoadingNotices(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.notices)) {
        setAdminNotices(data.notices);
      }
    } catch (err) {
      console.error('Error fetching admin notices:', err);
    } finally {
      setLoadingNotices(false);
    }
  }, [token]);

  // Initial Load
  useEffect(() => {
    fetchUsers();
    fetchSettings();
    fetchPaymentRequests();
    fetchAdminDonations();
    fetchBlockedIps();
    fetchAdminNotices();
  }, [fetchUsers, fetchSettings, fetchPaymentRequests, fetchAdminDonations, fetchBlockedIps, fetchAdminNotices]);

  // Refresh All
  const refreshAll = () => {
    fetchUsers();
    fetchSettings();
    fetchPaymentRequests();
    fetchAdminDonations();
    fetchBlockedIps();
    fetchAdminNotices();
  };

  // Create or Update Notice
  const handleSaveNotice = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!noticeForm.title.trim()) {
      setFeedback({
        type: 'error',
        message: isMarathi ? 'कृपया सूचनेचे शीर्षक प्रविष्ट करा.' : 'Please enter notice title.',
      });
      return;
    }
    if (!noticeForm.content.trim()) {
      setFeedback({
        type: 'error',
        message: isMarathi ? 'कृपया सूचनेचा सविस्तर मजकूर प्रविष्ट करा.' : 'Please enter notice content.',
      });
      return;
    }

    setSubmittingNotice(true);
    try {
      const url = editingNoticeId
        ? `${BACKEND_URL}/api/admin/notices/${editingNoticeId}`
        : `${BACKEND_URL}/api/admin/notices`;
      const method = editingNoticeId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noticeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सूचना सेव्ह करताना त्रुटी आली');

      setFeedback({
        type: 'success',
        message: editingNoticeId
          ? (isMarathi ? 'सूचना यशस्वीरित्या अद्ययावत झाली!' : 'Notice updated successfully!')
          : (isMarathi ? 'नवीन सूचना यशस्वीरित्या फलकावर प्रकाशित झाली!' : 'New notice published on the board!'),
      });

      setNoticeForm({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        isActive: true,
      });
      setEditingNoticeId(null);
      fetchAdminNotices();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmittingNotice(false);
    }
  };

  // Toggle Notice Active
  const handleToggleNotice = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notices/${id}/toggle`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'स्थिती बदलताना त्रुटी');

      setAdminNotices((prev) =>
        prev.map((n) => (String(n._id) === String(id) ? { ...n, isActive: !n.isActive } : n))
      );
      setFeedback({
        type: 'success',
        message: data.message || (isMarathi ? 'स्थिती बदलली' : 'Status toggled'),
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id, title) => {
    const confirmMsg = isMarathi
      ? `खरोखर "${title}" ही सूचना फलकावरून कायमस्वरूपी हटवायची आहे का?`
      : `Are you sure you want to permanently delete "${title}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/notices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सूचना हटवताना त्रुटी');

      setAdminNotices((prev) => prev.filter((n) => String(n._id) !== String(id)));
      setFeedback({
        type: 'success',
        message: isMarathi ? 'सूचना यशस्वीरित्या हटवली!' : 'Notice deleted successfully!',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Delete a Donation (Admin only)
  const handleDeleteDonation = async (id, donorName, amount) => {
    const confirmPrompt = isMarathi
      ? `⚠️ सावधान! खरोखर ${donorName} यांची ₹${Number(amount).toLocaleString('mr-IN')} ची देणगी कायमस्वरूपी हटवायची आहे का?\n\nही क्रिया पूर्ववत करता येणार नाही आणि थेट डॅशबोर्डवरील रक्कम कमी होईल.`
      : `⚠️ Warning! Are you sure you want to permanently delete the donation of ₹${Number(amount).toLocaleString('en-IN')} by ${donorName}?\n\nThis action cannot be undone and will deduct the amount from the live total counter.`;

    if (!window.confirm(confirmPrompt)) {
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
      if (!res.ok) throw new Error(data.error || (isMarathi ? 'देणगी हटवण्यात अयशस्वी' : 'Failed to delete donation'));

      setFeedback({
        type: 'success',
        message:
          data.message ||
          (isMarathi
            ? `₹${Number(amount).toLocaleString('mr-IN')} ची देणगी यशस्वीपणे हटवली!`
            : `Donation of ₹${Number(amount).toLocaleString('en-IN')} successfully deleted!`),
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
      if (!res.ok) throw new Error(data.error || (isMarathi ? 'सेटिंग्ज सेव्ह करण्यात अयशस्वी' : 'Failed to save settings'));

      setFeedback({
        type: 'success',
        message: isMarathi
          ? 'उत्सव लक्ष्य रक्कम व QR कोड सेटिंग्ज यशस्वीपणे सेव्ह झाल्या आणि लाइव्ह अपडेट झाल्या!'
          : 'Festival goal amount & QR code settings successfully saved and updated live!',
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
      if (!res.ok) throw new Error(data.error || (isMarathi ? 'मंजूर करण्यात त्रुटी आली' : 'Failed to approve payment'));

      setFeedback({
        type: 'success',
        message: isMarathi
          ? `₹${Number(amount).toLocaleString('mr-IN')} (${donorName}) ची देणगी यशस्वीपणे मंजूर केली व मुख्य डॅशबोर्डवर जोडली!`
          : `Donation of ₹${Number(amount).toLocaleString('en-IN')} (${donorName}) successfully approved and added to live board!`,
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
    const promptMsg = isMarathi
      ? `खरोखर ${donorName} यांची पेमेंट विनंती नाकारायची आहे का? (कारण प्रविष्ट करा):`
      : `Are you sure you want to reject payment request from ${donorName}? (Enter reason):`;
    const defaultReason = isMarathi ? 'पडताळणी अयशस्वी' : 'Verification failed';
    const reason = window.prompt(promptMsg, defaultReason);
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
      if (!res.ok) throw new Error(data.error || (isMarathi ? 'रद्द करण्यात त्रुटी आली' : 'Failed to reject payment'));

      setFeedback({
        type: 'success',
        message: isMarathi
          ? `${donorName} यांची पेमेंट विनंती रद्द करण्यात आली.`
          : `Payment verification request from ${donorName} has been rejected.`,
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
    const text = isMarathi
      ? `॥ श्री गणेशाय नमः ॥\nनमस्कार ${request.name} जी,\nश्री बाल गणेश मंडळ धानोरा बु. २०२६ कडून आपल्या ₹${request.amount} देणगी विनंती (UTR: ${request.utrNumber}) ची पडताळणी संदर्भात संपर्क करत आहोत.`
      : `|| Shree Ganeshaya Namah ||\nGreetings ${request.name} ji,\nWe are reaching out from Shri Baal Ganesh Mandal Dhanora Bk. 2026 regarding verification of your ₹${request.amount} contribution (UTR: ${request.utrNumber}).`;
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
      setFeedback({
        type: 'error',
        message: isMarathi ? 'कृपया सर्व आवश्यक रकाने भरा.' : 'Please fill all required fields.',
      });
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
      if (!res.ok) throw new Error(data.error || (isMarathi ? 'वापरकर्ता जोडण्यात त्रुटी आली' : 'Failed to create user'));

      setFeedback({
        type: 'success',
        message: isMarathi
          ? `नवीन ${formData.role === 'admin' ? 'व्यवस्थापक' : 'स्वयंसेवक'} (${formData.name}) यशस्वीपणे MongoDB मध्ये जोडला गेला!`
          : `New ${formData.role === 'admin' ? 'Admin' : 'Volunteer'} (${formData.name}) successfully registered in database!`,
      });

      setFormData({
        name: '',
        username: '',
        password: '',
        phone: '',
        role: 'volunteer',
      });
      setShowPassword(false);
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
      if (!res.ok) throw new Error(data.error || (isMarathi ? 'स्थिती बदलण्यात त्रुटी' : 'Failed to update user status'));

      setFeedback({
        type: 'success',
        message: isMarathi
          ? `${userName} चे खाते ${!currentStatus ? 'सक्रिय' : 'निष्क्रिय'} करण्यात आले.`
          : `Account for ${userName} has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmPrompt = isMarathi
      ? `खरोखर ${userName} या सदस्याचे खाते कायमस्वरूपी हटवायचे आहे का?`
      : `Are you sure you want to permanently delete the account for ${userName}?`;
    if (!window.confirm(confirmPrompt)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isMarathi ? 'हटवण्यात त्रुटी आली' : 'Failed to delete user'));

      setFeedback({
        type: 'success',
        message: isMarathi
          ? `${userName} चे खाते यशस्वीपणे हटवले.`
          : `Account for ${userName} deleted successfully.`,
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

  const [previewLocalQr, setPreviewLocalQr] = useState('');

  const effectiveUpiId = (settings?.upiId && settings.upiId !== 'mandal.ganpati@upi') ? settings.upiId : '8484844728@slc';
  const previewUpiPayUrl = buildOfficialUpiUrl(effectiveUpiId, { payeeName: 'kartik', amount: 501, note: 'ganesh seva' });
  const fallbackPreviewQr = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(previewUpiPayUrl)}`;

  useEffect(() => {
    let isCurrent = true;
    generateUpiQrDataUrl(previewUpiPayUrl).then((url) => {
      if (isCurrent && url) setPreviewLocalQr(url);
    });
    return () => {
      isCurrent = false;
    };
  }, [previewUpiPayUrl]);

  const previewQrImage = settings.qrCodeUrl || previewLocalQr || fallbackPreviewQr;

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
                  {t('adminTitle')}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  <Database className="h-3 w-3" />
                  MongoDB Atlas
                </span>
              </div>
              <p className="text-xs text-orange-200/75 mt-0.5">
                {t('adminSub')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-black/40 px-3 py-2 text-xs text-orange-200">
              <span>👑</span>
              <span>
                {isMarathi ? 'व्यवस्थापक:' : 'Admin:'} <strong className="text-amber-300">{user?.name}</strong>
              </span>
            </div>

            <Link
              to="/dakshina"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-orange-950/50 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-orange-900/50 transition-all"
            >
              <span>{t('liveTvScreenBtn')}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              type="button"
              onClick={refreshAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-orange-950/50 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-orange-900/50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers || loadingRequests || loadingSettings ? 'animate-spin' : ''}`} />
              <span>{t('refreshBtn')}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-2 pt-1">
          {/* Tab 1: Payment Verification Requests */}
          <button
            type="button"
            onClick={() => handleTabChange('verification')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>{t('tabVerification')}</span>
            {paymentRequests.length > 0 ? (
              <span className="rounded-full bg-red-500 text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                {paymentRequests.length} {t('newRequestsBadge')}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 text-[10px]">
                {t('zeroPendingBadge')}
              </span>
            )}
          </button>

          {/* Tab 2: Settings & QR Code */}
          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>{t('tabSettings')}</span>
          </button>

          {/* Tab 3: Notice Board (सूचना फलक) */}
          <button
            type="button"
            onClick={() => handleTabChange('notices')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'notices'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>{t('tabNotices')}</span>
            {adminNotices.length > 0 && (
              <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold">
                {adminNotices.length}
              </span>
            )}
          </button>

          {/* Tab 4: Volunteer Management */}
          <button
            type="button"
            onClick={() => handleTabChange('users')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>
              {t('tabUsers')} ({usersList.length})
            </span>
          </button>

          {/* Tab 5: Donations Management & Deletion */}
          <button
            type="button"
            onClick={() => handleTabChange('donations')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <Trash2 className="h-4 w-4 text-red-400" />
            <span>
              {t('tabDonations')} ({adminDonations.length})
            </span>
          </button>

          {/* Tab 6: Security & Blocked IPs */}
          <button
            type="button"
            onClick={() => {
              handleTabChange('security');
              fetchBlockedIps();
            }}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30 border border-amber-300/60'
                : 'border border-amber-500/20 bg-black/40 text-orange-200/70 hover:bg-orange-950/40 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>{t('tabSecurity')}</span>
            {blockedIps.length > 0 && (
              <span className="rounded-full bg-red-600 text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                {blockedIps.length}
              </span>
            )}
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
                <span>{t('verificationSectionTitle')}</span>
              </h2>
              <p className="text-xs text-orange-200/75">
                {t('verificationSectionSub')}
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              {paymentRequests.length} {t('pendingRequestsTitle')}
            </span>
          </div>

          {loadingRequests ? (
            <div className="p-12 text-center text-orange-200/60 rounded-3xl border border-amber-500/20 bg-black/40">
              <span className="inline-block h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">{t('loading')}</p>
            </div>
          ) : paymentRequests.length === 0 ? (
            <div className="p-10 text-center rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-black/60 backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-2xl mb-3">
                ✓
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {t('allCheckedMsg')}
              </h3>
              <p className="text-xs text-emerald-200/70 max-w-md mx-auto">
                {t('noPendingMsg')}
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
                        <span>{isMarathi ? '📱 UPI ऑनलाइन' : '📱 UPI Online'}</span>
                        <span>•</span>
                        <span>{req.category}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {req.name}
                      </h3>
                      <span className="text-[11px] text-orange-200/70">
                        {req.city || (isMarathi ? 'ऑनलाइन भाविक' : 'Online Devotee')}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase text-orange-300/70 block">
                        {t('amount')}
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-amber-300">
                        ₹{Number(req.amount).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* UTR & Transaction Details */}
                  <div className="rounded-2xl border border-amber-500/20 bg-black/50 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-200/70 text-[11px]">
                        UTR / Ref. {isMarathi ? 'नंबर:' : 'No:'}
                      </span>
                      <div className="flex items-center gap-1 font-mono font-bold text-amber-200 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <span>{req.utrNumber || (isMarathi ? 'उपलब्ध नाही' : 'N/A')}</span>
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
                        <span className="text-orange-200/70 text-[11px]">
                          {t('phone')}:
                        </span>
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
                      <span>{t('time')}:</span>
                      <span>
                        {req.timestamp
                          ? new Date(req.timestamp).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : t('justNow')}
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
                        <span>{t('checkingBtn')}</span>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>{t('approveBtn')}</span>
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
                      <span>{t('rejectBtn')}</span>
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
                  {t('targetSettingsTitle')}
                </h2>
                <p className="text-[11px] text-orange-200/70">
                  {t('targetSettingsSub')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* 1. Target Collection Limit (Edit Amount Limit) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-orange-200/90 mb-1">
                  {t('targetLimitLabel')}
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
                    placeholder="500000"
                    className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 pl-8 pr-3.5 text-sm font-black text-amber-300 placeholder-orange-200/30 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <span className="text-[11px] text-orange-200/60 mt-0.5 block">
                  {t('targetLimitHint')}
                </span>
              </div>

              {/* 2. Mandal UPI ID */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('upiIdLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="8484844728@slc"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm font-mono text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* 3. Mandal / Account Name */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('mandalNameLabel')}
                </label>
                <input
                  type="text"
                  value={settings.upiName}
                  onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                  placeholder={isMarathi ? 'श्री बाल गणेश मंडळ धानोरा बु.' : 'Shri Baal Ganesh Mandal Dhanora Bk.'}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* 4. Custom QR Code Image URL */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('customQrLabel')}
                </label>
                <input
                  type="url"
                  value={settings.qrCodeUrl}
                  onChange={(e) => setSettings({ ...settings, qrCodeUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-orange-200/60 mt-0.5 block">
                  {t('customQrHint')}
                </span>
              </div>

              {/* 5. QR Note / Banner Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('qrNoteLabel')}
                </label>
                <input
                  type="text"
                  value={settings.qrCodeNote}
                  onChange={(e) => setSettings({ ...settings, qrCodeNote: e.target.value })}
                  placeholder={isMarathi ? 'स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा' : 'Scan to offer devotion'}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* 6. Cloudinary Ganesha Photos Slider (Every 5s on Home) */}
              <div className="pt-2 border-t border-amber-500/20 space-y-2">
                <label className="block text-xs font-semibold text-orange-200/90">
                  {t('ganeshaPhotosLabel')}
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(settings.ganeshaImages) ? settings.ganeshaImages.join('\n') : ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean);
                    setSettings({ ...settings, ganeshaImages: lines });
                  }}
                  placeholder="https://res.cloudinary.com/.../ganpati1.jpg&#10;https://res.cloudinary.com/.../ganpati2.jpg"
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 px-3 text-xs font-mono text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-orange-200/70 block">
                  {t('ganeshaPhotosHint')}
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
                          title={t('delete')}
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
                  <span>{t('saving')}</span>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{t('savePublishBtn')}</span>
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
                <span>{isMarathi ? 'थेट स्क्रीन प्रिव्ह्यू (Live Preview)' : 'Live Screen Preview'}</span>
              </div>
              <h3 className="text-base font-bold text-white">
                {t('previewTitle')}
              </h3>
              <p className="text-[11px] text-orange-200/70">
                {settings.qrCodeNote || (isMarathi ? 'स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा' : 'Scan to offer devotion')}
              </p>
            </div>

            {/* Rendered QR Preview */}
            <div className="relative my-2 p-3 bg-white rounded-2xl shadow-xl ring-2 ring-amber-400/50">
              <img
                src={previewQrImage}
                alt="QR Preview"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                onError={(e) => {
                  if (e.target.src !== fallbackPreviewQr) {
                    e.target.src = fallbackPreviewQr;
                  }
                }}
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap">
                {settings.upiName || (isMarathi ? 'श्री बाल गणेश मंडळ धानोरा बु.' : 'Shri Baal Ganesh Mandal Dhanora Bk.')}
              </div>
            </div>

            <div className="w-full mt-3 rounded-xl border border-amber-500/30 bg-black/60 p-3 text-xs space-y-1.5 text-left">
              <div className="flex justify-between">
                <span className="text-orange-200/70">
                  {isMarathi ? 'लक्ष्य देणगी मर्यादा:' : 'Target Donation Limit:'}
                </span>
                <span className="font-bold text-amber-300">
                  ₹{Number(settings.targetAmount || 0).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-200/70">UPI ID:</span>
                <span className="font-mono font-bold text-amber-200">{settings.upiId}</span>
              </div>
            </div>

            {/* Quick Links to Home Editable Sections */}
            <div className="w-full mt-3 rounded-2xl border border-amber-500/25 bg-black/60 p-4 text-xs space-y-2.5 text-left">
              <span className="font-bold text-amber-300 block text-xs">
                {t('shortcutsTitle')}
              </span>
              <p className="text-[11px] text-orange-200/70">
                {t('shortcutsSub')}
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="/#schedule"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-orange-950/40 border border-amber-500/20 hover:border-amber-400 text-amber-200 text-xs font-medium transition"
                >
                  <span>⏰ {t('dailyScheduleTitle')}</span>
                  <span className="text-[10px] text-amber-400 font-bold">{t('goToHome')}</span>
                </a>
                <a
                  href="/#initiatives"
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-orange-950/40 border border-amber-500/20 hover:border-amber-400 text-amber-200 text-xs font-medium transition"
                >
                  <span>🤝 {t('initiativesTitle')}</span>
                  <span className="text-[10px] text-amber-400 font-bold">{t('goToHome')}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: VOLUNTEER & ADMIN MANAGEMENT                                   */}
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
                  {t('addUserTitle')}
                </h2>
                <p className="text-[11px] text-orange-200/70">
                  {t('addUserSub')}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('fullNameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('fullNamePlaceholder')}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('usernameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder={t('usernamePlaceholder')}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* Password with View / Hide Option */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 pl-3.5 pr-10 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-orange-300/60 hover:text-orange-200 transition-colors cursor-pointer"
                    title={showPassword ? (isMarathi ? 'पासवर्ड लपवा' : 'Hide password') : (isMarathi ? 'पासवर्ड पहा' : 'View password')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('phonePlaceholder')}
                  className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('roleLabel')}
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
                    {t('roleVolunteer')}
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
                    {t('roleAdmin')}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/40 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {formSubmitting ? (
                  <span>{t('addingUserBtn')}</span>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>{t('addUserBtn')}</span>
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
                  {t('teamDirectoryTitle')}
                </h2>
                <p className="text-[11px] text-orange-200/70">
                  {t('teamDirectorySub')}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-orange-300/50" />
                <input
                  type="text"
                  placeholder={t('searchUsersPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 rounded-xl border border-amber-500/30 bg-black/50 py-1.5 pl-8 pr-3 text-xs text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {loadingUsers ? (
              <div className="p-8 text-center text-orange-200/60">
                <span className="inline-block h-6 w-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs">{t('loading')}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-orange-200/60 text-xs">
                {t('noUsersFound')}
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
                              {t('inactive')}
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
                              title={u.isActive ? t('statusInactiveBtn') : t('statusActiveBtn')}
                            >
                              <Power className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">
                                {u.isActive ? t('statusInactiveBtn') : t('statusActiveBtn')}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-2 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition-all cursor-pointer"
                              title={t('delete')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                        {isMainAdmin && (
                          <span className="text-[11px] text-amber-400/80 italic">
                            {t('mainAdminNotice')}
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
                {t('totalDonationsStat')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">
                {adminDonations.length}
              </span>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 text-center">
              <span className="text-[11px] font-semibold text-orange-200/70 block uppercase tracking-wider">
                {t('totalCollectionStat')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-1 block">
                ₹{adminDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-black/40 p-4 text-center">
              <span className="text-[11px] font-semibold text-emerald-200/70 block uppercase tracking-wider">
                {t('cashStat')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 block">
                ₹{adminDonations
                  .filter((d) => d.paymentMethod !== 'online')
                  .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                  .toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </span>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-black/40 p-4 text-center">
              <span className="text-[11px] font-semibold text-blue-200/70 block uppercase tracking-wider">
                {t('onlineStat')}
              </span>
              <span className="text-xl sm:text-2xl font-black text-blue-400 mt-1 block">
                ₹{adminDonations
                  .filter((d) => d.paymentMethod === 'online')
                  .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
                  .toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/60 via-red-950/40 to-black/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>💰</span>
                  <span>{t('donationsListTitle')}</span>
                </h2>
                <p className="text-xs text-orange-200/70">
                  {t('donationsListSub')}
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder={t('searchDonationsPlaceholder')}
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
                { id: 'all', label: t('filterAll') },
                { id: 'cash', label: t('filterCash') },
                { id: 'online', label: t('filterOnline') },
                { id: 'high', label: t('filterHigh') },
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
                {t('loading')}
              </div>
            ) : (() => {
                const sortedList = [...adminDonations].sort(
                  (a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0) || new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
                );
                const filtered = sortedList.filter((d) => {
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
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-amber-500/20 bg-black/30">
                      <p className="text-orange-200/60 text-sm">{t('noDonationsFound')}</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto rounded-2xl border border-amber-500/20">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-black/70 text-orange-200/80 uppercase text-[11px] font-bold tracking-wider border-b border-amber-500/20">
                        <tr>
                          <th className="py-3 px-3.5">{t('colDonor')}</th>
                          <th className="py-3 px-3.5">{t('colAmount')}</th>
                          <th className="py-3 px-3.5">{t('colCategory')}</th>
                          <th className="py-3 px-3.5">{t('colMethod')}</th>
                          <th className="py-3 px-3.5">{t('colRecordedBy')}</th>
                          <th className="py-3 px-3.5">{t('colTime')}</th>
                          <th className="py-3 px-3.5 text-center">{t('colAction')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/10 bg-black/40">
                        {filtered.map((d) => {
                          const donId = d._id || d.id;
                          const isDeleting = deletingDonationId === donId;
                          return (
                            <tr key={donId} className="hover:bg-orange-950/30 transition-colors">
                              <td className="py-3 px-3.5">
                                <span className="font-bold text-white block">{d.name}</span>
                                <span className="text-[11px] text-orange-200/60">
                                  📍 {d.city || (isMarathi ? 'स्थानिक भाविक' : 'Local Devotee')} {d.phone ? `• 📞 ${d.phone}` : ''}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 font-black text-amber-300 text-sm sm:text-base">
                                ₹{Number(d.amount || 0).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN')}
                              </td>
                              <td className="py-3 px-3.5">
                                <span className="inline-block rounded-full bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                                  {d.category || (isMarathi ? 'महाप्रसाद सेवा' : 'Maha-Prasad Seva')}
                                </span>
                              </td>
                              <td className="py-3 px-3.5">
                                {d.paymentMethod === 'online' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 text-[10px] font-bold">
                                    📱 {isMarathi ? 'ऑनलाइन' : 'Online'} {d.utrNumber ? `(${d.utrNumber})` : ''}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold">
                                    💵 {isMarathi ? 'रोख (Cash)' : 'Cash'}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-xs text-orange-200/70">
                                {d.recordedBy || (isMarathi ? 'स्वयंसेवक' : 'Volunteer')}
                              </td>
                              <td className="py-3 px-3.5 text-xs text-orange-200/60 font-mono">
                                {d.timestamp
                                  ? new Date(d.timestamp).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : t('justNow')}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <div className="inline-flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedAdminReceipt(d);
                                      setIsAdminReceiptOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-black text-xs font-bold shadow-sm transition-all cursor-pointer"
                                    title={isMarathi ? 'अधिकृत पावती पहा, प्रिंट करा किंवा व्हॉट्सॲपवर पाठवा' : 'View, Print or WhatsApp Receipt'}
                                  >
                                    <Receipt className="h-3.5 w-3.5" />
                                    <span>{isMarathi ? 'पावती' : 'Receipt'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => handleDeleteDonation(donId, d.name, d.amount)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-500/40 bg-red-950/50 hover:bg-red-900/80 text-red-200 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                    title={isMarathi ? 'ही देणगी कायमस्वरूपी हटवा' : 'Permanently delete this donation'}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                    <span>{isDeleting ? t('deleting') : t('delete')}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: SECURITY & BLOCKED IPS (30-Min Lockout Management)           */}
      {/* =================================================================== */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="rounded-3xl border border-red-500/30 bg-black/60 p-6 sm:p-8 backdrop-blur-xl shadow-[0_15px_35px_rgba(239,68,68,0.15)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-red-500/20 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">{t('blockedIpsTitle')}</h2>
                </div>
                <p className="text-xs text-orange-200/70 mt-1">
                  {t('blockedIpsSub')} ({isMarathi ? 'सुरक्षा नियम: १० वेळा चुकीचा पासवर्ड टाकल्यास IP ३० मिनिटांसाठी आपोआप ब्लॉक होतो' : 'Rule: 10 failed password attempts = 30-minute IP block'})
                </p>
              </div>

              <button
                type="button"
                onClick={fetchBlockedIps}
                disabled={loadingBlockedIps}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-200 text-xs font-bold transition cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingBlockedIps ? 'animate-spin' : ''}`} />
                <span>{t('refresh')}</span>
              </button>
            </div>

            {loadingBlockedIps ? (
              <div className="py-12 text-center text-orange-200/60 text-sm">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-400" />
                <span>{t('loading')}</span>
              </div>
            ) : blockedIps.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-400">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {isMarathi ? 'सर्व सुरक्षित आहे!' : 'System is Fully Secure!'}
                </h3>
                <p className="text-xs text-orange-200/70 max-w-md mx-auto">
                  {t('noBlockedIps')}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                  <span>● {isMarathi ? 'सक्रिय ब्रूट-फोर्स संरक्षण चालू आहे (१० प्रयत्न / ३० मि. ब्लॉक)' : 'Active Brute-Force Protection Enabled (10 Attempts / 30-min Block)'}</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-red-500/30">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-black/80 text-red-200/80 uppercase text-[11px] font-bold tracking-wider border-b border-red-500/30">
                    <tr>
                      <th className="py-3 px-3.5">{t('ipAddress')}</th>
                      <th className="py-3 px-3.5">{t('failedCountLabel')}</th>
                      <th className="py-3 px-3.5">{isMarathi ? 'वापरकर्ता नाव' : 'Username'}</th>
                      <th className="py-3 px-3.5">{t('blockedUntilLabel')}</th>
                      <th className="py-3 px-3.5">{isMarathi ? 'शिल्लक वेळ' : 'Time Left'}</th>
                      <th className="py-3 px-3.5 text-center">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-500/15 bg-black/50">
                    {blockedIps.map((b) => {
                      const isUnblocking = unblockingIp === b.ip;
                      return (
                        <tr key={b.ip} className="hover:bg-red-950/30 transition-colors">
                          <td className="py-3.5 px-3.5">
                            <span className="font-mono font-bold text-white block text-sm">{b.ip}</span>
                            <span className="text-[10px] text-red-300/60">
                              {b.source || 'MongoDB Atlas'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/60 text-red-200 text-xs font-black">
                              ⚠️ {b.failedAttempts} / 10
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 font-mono text-orange-200">
                            {b.lastAttemptedUsername ? `"${b.lastAttemptedUsername}"` : '—'}
                          </td>
                          <td className="py-3.5 px-3.5 text-xs text-orange-200/80 font-mono">
                            {b.blockedUntil
                              ? new Date(b.blockedUntil).toLocaleTimeString(isMarathi ? 'mr-IN' : 'en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })
                              : '30 min'}
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                              <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: '4s' }} />
                              <span>{b.minutesLeft} {t('minutesSuffix')}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-center">
                            <button
                              type="button"
                              disabled={isUnblocking}
                              onClick={() => handleUnblockIp(b.ip)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                              title={isMarathi ? 'हा IP त्वरित अनब्लॉक करा' : 'Instantly unblock this IP address'}
                            >
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{isUnblocking ? t('unblocking') : t('unblockBtn')}</span>
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

      {/* ========================================================================= */}
      {/* TAB 3: NOTICE BOARD MANAGEMENT (अधिकृत सूचना फलक)                         */}
      {/* ========================================================================= */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          {/* Top Banner Header */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-orange-950/70 via-red-950/40 to-black/80 p-5 sm:p-7 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-0.5 text-xs font-bold text-amber-300">
                <Megaphone className="h-3.5 w-3.5" />
                <span>{t('noticeBoardBadge')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isMarathi ? 'श्री बाल गणेश मंडळ - सूचना व्यवस्थापन' : 'Shri Baal Ganesh Mandal - Notice Management'}
              </h3>
              <p className="text-xs text-orange-200/75">
                {isMarathi
                  ? 'येथे प्रकाशित केलेल्या सूचना थेट मुख्य पृष्ठावरील अधिकृत सूचना फलकावर व Live TV स्क्रीनवर झळकतील.'
                  : 'Announcements published here broadcast live to the main notice board and pandal TV screens.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/#notice-board"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-amber-400/40 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition shadow-sm"
              >
                <span>{isMarathi ? 'थेट फलक पहा' : 'View Public Board'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Notice Publish / Edit Form */}
          <div className="rounded-3xl border border-amber-500/30 bg-black/40 p-5 sm:p-7 backdrop-blur-xl shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h4 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>{editingNoticeId ? '✏️' : '📢'}</span>
                <span>
                  {editingNoticeId
                    ? (isMarathi ? 'सूचना संपादित करा' : 'Edit Notice')
                    : (isMarathi ? 'नवीन सूचना प्रकाशित करा' : 'Publish New Notice')}
                </span>
              </h4>

              {editingNoticeId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoticeId(null);
                    setNoticeForm({
                      title: '',
                      content: '',
                      category: 'general',
                      priority: 'normal',
                      isActive: true,
                    });
                  }}
                  className="text-xs text-orange-300 hover:text-white underline cursor-pointer"
                >
                  {isMarathi ? 'रद्द करा (नवीन तयार करा)' : 'Cancel Edit'}
                </button>
              )}
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Notice Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                    {t('noticeTitleLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder={
                      isMarathi
                        ? 'उदा. आज संध्याकाळी ७:३० वाजता महाआरती व महाप्रसाद वाटप'
                        : 'e.g. Grand Maha Aarti & Maha Prasad at 7:30 PM'
                    }
                    className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                    {t('noticeCategoryLabel')}
                  </label>
                  <select
                    value={noticeForm.category}
                    onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value })}
                    className="w-full rounded-xl border border-amber-500/30 bg-black/80 py-2.5 px-3 text-xs sm:text-sm text-white outline-none focus:border-amber-400"
                  >
                    <option value="urgent">{t('catUrgent')}</option>
                    <option value="event">{t('catEvent')}</option>
                    <option value="prasad">{t('catPrasad')}</option>
                    <option value="aarti">{t('catAarti')}</option>
                    <option value="general">{t('catGeneral')}</option>
                  </select>
                </div>
              </div>

              {/* Priority & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                    {t('noticePriorityLabel')}
                  </label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) => setNoticeForm({ ...noticeForm, priority: e.target.value })}
                    className="w-full rounded-xl border border-amber-500/30 bg-black/80 py-2.5 px-3 text-xs sm:text-sm text-white outline-none focus:border-amber-400"
                  >
                    <option value="normal">{t('priorityNormal')}</option>
                    <option value="medium">{t('priorityMedium')}</option>
                    <option value="high">{t('priorityHigh')} ⚠️</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={noticeForm.isActive}
                      onChange={(e) => setNoticeForm({ ...noticeForm, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-amber-400 text-amber-500 focus:ring-amber-400 accent-amber-500"
                    />
                    <span className="text-xs sm:text-sm font-bold text-amber-200">
                      {isMarathi ? 'तात्काळ Live फलकावर प्रकाशित करा' : 'Publish Live Immediately'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Detailed Content */}
              <div>
                <label className="block text-xs font-semibold text-orange-200/90 mb-1">
                  {t('noticeContentLabel')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  placeholder={
                    isMarathi
                      ? 'सूचनेचा संपूर्ण मजकूर येथे लिहा... सर्व भाविकांनी वेळेवर उपस्थित राहावे.'
                      : 'Enter complete announcement details here...'
                  }
                  className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400 leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingNotice}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-black font-black text-xs sm:text-sm shadow-lg shadow-orange-600/30 active:scale-95 disabled:opacity-50 transition cursor-pointer"
                >
                  <Megaphone className="h-4 w-4" />
                  <span>
                    {submittingNotice
                      ? t('saving')
                      : editingNoticeId
                      ? t('updateNoticeBtn')
                      : t('publishNoticeBtn')}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Published Notices */}
          <div className="rounded-3xl border border-amber-500/30 bg-black/40 p-5 sm:p-7 backdrop-blur-xl shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h4 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                <span>📋</span>
                <span>{isMarathi ? 'सर्व प्रकाशित सूचना यादी' : 'All Notices List'} ({adminNotices.length})</span>
              </h4>

              <button
                type="button"
                onClick={fetchAdminNotices}
                disabled={loadingNotices}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingNotices ? 'animate-spin' : ''}`} />
                <span>{t('refresh')}</span>
              </button>
            </div>

            {loadingNotices ? (
              <div className="py-12 text-center text-xs sm:text-sm text-orange-200/60 font-semibold animate-pulse">
                🪔 {t('loading')}
              </div>
            ) : adminNotices.length > 0 ? (
              <div className="space-y-3">
                {adminNotices.map((n) => {
                  const isHigh = n.priority === 'high';
                  const dateStr = n.createdAt
                    ? new Date(n.createdAt).toLocaleString(isMarathi ? 'mr-IN' : 'en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <div
                      key={n._id}
                      className={`rounded-2xl border ${
                        n.isActive ? 'border-amber-500/30 bg-black/60' : 'border-zinc-800 bg-zinc-950/40 opacity-70'
                      } p-4 space-y-2.5 transition-all`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/10 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              n.isActive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
                            }`}
                          >
                            {n.isActive ? (isMarathi ? '● Live सक्रिय' : '● Live Active') : (isMarathi ? '○ अप्रकाशित' : '○ Hidden')}
                          </span>

                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[10px] font-bold uppercase">
                            {n.category}
                          </span>

                          {isHigh && (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
                              उच्च प्राधान्य (High)
                            </span>
                          )}

                          <span className="text-[11px] text-orange-200/50">
                            🕒 {dateStr}
                          </span>
                        </div>

                        {/* Control Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {/* Toggle Active Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleNotice(n._id)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              n.isActive
                                ? 'border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300'
                                : 'border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300'
                            }`}
                            title={isMarathi ? 'स्थिती बदला (चालू/बंद)' : 'Toggle Status'}
                          >
                            {n.isActive ? (isMarathi ? 'सक्रिय' : 'Active') : (isMarathi ? 'बंद' : 'Off')}
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoticeId(n._id);
                              setNoticeForm({
                                title: n.title || '',
                                content: n.content || '',
                                category: n.category || 'general',
                                priority: n.priority || 'normal',
                                isActive: n.isActive !== undefined ? n.isActive : true,
                              });
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="p-1.5 rounded-xl border border-amber-500/30 bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 transition cursor-pointer"
                            title={t('edit')}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteNotice(n._id, n.title)}
                            className="p-1.5 rounded-xl border border-red-500/30 bg-red-950/40 text-red-300 hover:bg-red-900/60 transition cursor-pointer"
                            title={t('delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-bold text-white text-sm sm:text-base">
                          {n.title}
                        </h5>
                        <p className="text-xs text-orange-200/80 leading-relaxed mt-1 whitespace-pre-line">
                          {n.content}
                        </p>
                      </div>

                      <div className="text-[11px] text-amber-300/60 pt-1 flex items-center justify-between">
                        <span>✍️ {n.postedBy || 'श्री बाल गणेश मंडळ व्यवस्थापक'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center rounded-2xl border border-dashed border-amber-500/20 bg-black/30">
                <Megaphone className="h-8 w-8 text-amber-400/40 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-orange-200/60 font-semibold">
                  {isMarathi ? 'अद्याप कोणतीही सूचना तयार केलेली नाही. वरील फॉर्म वापरून पहिली सूचना प्रकाशित करा.' : 'No announcements created yet. Use the form above to publish the first one.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal for Admin */}
      <ReceiptModal
        isOpen={isAdminReceiptOpen}
        onClose={() => setIsAdminReceiptOpen(false)}
        donation={selectedAdminReceipt}
      />
    </div>
  );
}
