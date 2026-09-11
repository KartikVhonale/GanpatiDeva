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
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Database,
  Search,
  ExternalLink
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminManagement() {
  const { user, token } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    role: 'volunteer',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch users from MongoDB via Backend API
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.users) {
        setUsersList(data.users);
      } else {
        throw new Error(data.error || 'वापरकर्ते आणण्यात अयशस्वी');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle new user creation
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

      if (!res.ok) {
        throw new Error(data.error || 'वापरकर्ता जोडण्यात त्रुटी आली');
      }

      setFeedback({
        type: 'success',
        message: `नवीन ${formData.role === 'admin' ? 'व्यवस्थापक' : 'स्वयंसेवक'} (${formData.name}) यशस्वीपणे MongoDB मध्ये जोडला गेला!`,
      });

      // Reset form
      setFormData({
        name: '',
        username: '',
        password: '',
        phone: '',
        role: 'volunteer',
      });

      // Refresh users list
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (userId, userName, currentStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'स्थिती बदलण्यात त्रुटी');
      }

      setFeedback({
        type: 'success',
        message: `${userName} चे खाते ${!currentStatus ? 'सक्रिय' : 'निष्क्रिय'} करण्यात आले.`,
      });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`खरोखर ${userName} या सदस्याचे खाते कायमस्वरूपी हटवायचे आहे का?`)) {
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'हटवण्यात त्रुटी आली');
      }

      setFeedback({
        type: 'success',
        message: `${userName} चे खाते यशस्वीपणे हटवले.`,
      });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Filtered users
  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery)
  );

  const totalVolunteers = usersList.filter((u) => u.role === 'volunteer').length;
  const totalAdmins = usersList.filter((u) => u.role === 'admin').length;
  const activeCount = usersList.filter((u) => u.isActive).length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-orange-950/85 via-red-950/70 to-black/90 p-5 sm:p-8 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-red-600 p-0.5 shadow-lg shadow-orange-600/40">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-orange-950 text-amber-300">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  व्यवस्थापक नियंत्रण कक्ष (Admin Management)
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  <Database className="h-3 w-3" />
                  MongoDB
                </span>
              </div>
              <p className="text-xs text-orange-200/75 mt-0.5">
                नवीन स्वयंसेवक जोडणे, परवानग्या देणे व अधिकृत प्रवेश व्यवस्थापन
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/volunteer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/30 hover:brightness-110 transition-all"
            >
              <UserCheck className="h-4 w-4" />
              <span>स्वयंसेवक कक्ष उघडा</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-orange-950/50 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-orange-900/50 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Overview Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
            <span className="text-[11px] text-orange-200/70 block">एकूण नोंदणीकृत सदस्य</span>
            <span className="text-2xl font-black text-amber-300">{usersList.length}</span>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
            <span className="text-[11px] text-emerald-300/80 block">सक्रिय वापरकर्ते (Active)</span>
            <span className="text-2xl font-black text-emerald-400">{activeCount}</span>
          </div>
          <div className="rounded-2xl border border-orange-500/20 bg-black/40 p-3.5">
            <span className="text-[11px] text-orange-200/70 block">अधिकृत स्वयंसेवक</span>
            <span className="text-2xl font-black text-orange-400">{totalVolunteers}</span>
          </div>
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-3.5">
            <span className="text-[11px] text-purple-300/80 block">मुख्य व्यवस्थापक (Admins)</span>
            <span className="text-2xl font-black text-purple-300">{totalAdmins}</span>
          </div>
        </div>
      </div>

      {/* Action Notification Toast / Banner */}
      {feedback.message && (
        <div
          className={`rounded-2xl p-4 text-xs font-medium flex items-center justify-between gap-3 border shadow-lg backdrop-blur-xl ${
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/70 text-emerald-200'
              : 'border-red-500/40 bg-red-950/70 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-white/60 hover:text-white text-base font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Grid: Left Side Form, Right Side Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Add New Volunteer / Admin (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/80 via-red-950/60 to-black/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-amber-500/20 pb-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                नवीन सदस्य जोडा (Add User)
              </h2>
              <p className="text-[11px] text-orange-200/70">
                स्वयंसेवक किंवा व्यवस्थापकाचे खाते तयार करा
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-orange-200/90">
                पूर्ण नाव (Full Name) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="उदा. सचिन गणेश पाटील"
                className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 px-3 text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Username */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-orange-200/90">
                वापरकर्ता नाव (Username / Login ID) *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                placeholder="उदा. sachin_p (लहान इंग्रजी अक्षरे)"
                className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 px-3 text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-orange-200/90">
                पासवर्ड (Initial Password) *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="किमान ४ अक्षरे"
                className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 px-3 text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-orange-200/90">
                मोबाईल क्रमांक (Mobile Number)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="उदा. ९८७६५४३२१०"
                className="w-full rounded-xl border border-amber-500/30 bg-black/50 py-2 px-3 text-sm text-white placeholder-orange-200/30 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-orange-200/90">
                भूमिका (Role & Access Level) *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'volunteer' })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.role === 'volunteer'
                      ? 'border-orange-500 bg-orange-500/20 text-orange-200 ring-1 ring-orange-400'
                      : 'border-amber-500/20 bg-black/40 text-orange-200/60 hover:bg-black/60'
                  }`}
                >
                  <span className="text-base mb-0.5">🙋‍♂️</span>
                  <span>स्वयंसेवक (Volunteer)</span>
                  <span className="text-[10px] text-orange-200/60 font-normal">देणगी नोंद कक्ष</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.role === 'admin'
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400'
                      : 'border-amber-500/20 bg-black/40 text-orange-200/60 hover:bg-black/60'
                  }`}
                >
                  <span className="text-base mb-0.5">👑</span>
                  <span>व्यवस्थापक (Admin)</span>
                  <span className="text-[10px] text-amber-200/60 font-normal">पूर्ण नियंत्रण</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              {formSubmitting ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>MongoDB मध्ये जतन होत आहे...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>सदस्य जोडा (Add to Database)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Directory: List of Volunteers & Admins (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-orange-950/80 via-red-950/60 to-black/90 p-5 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  नोंदणीकृत सदस्य यादी (Staff Directory)
                </h2>
                <p className="text-[11px] text-orange-200/70">
                  {usersList.length} सदस्य डेटाबेसमध्ये नोंदणीकृत
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-orange-300/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शोधा (नाव, आयडी किंवा फोन)..."
                className="w-full sm:w-56 rounded-xl border border-amber-500/30 bg-black/50 py-1.5 pl-8 pr-3 text-xs text-white placeholder-orange-200/30 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Users List */}
          {loadingUsers ? (
            <div className="py-12 text-center text-xs text-amber-300/80 animate-pulse">
              सदस्य यादी लोड होत आहे...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-orange-200/60">
              कोणताही सदस्य सापडला नाही.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredUsers.map((u) => {
                const isMainAdmin = u.username === 'admin';
                return (
                  <div
                    key={u._id}
                    className={`rounded-2xl border p-3.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      u.isActive
                        ? 'border-amber-500/20 bg-black/40 hover:bg-black/60'
                        : 'border-red-500/20 bg-red-950/20 opacity-70'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                        }`}
                      >
                        {u.role === 'admin' ? '👑' : '🙋‍♂️'}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{u.name}</span>
                          <span
                            className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                                : 'bg-orange-500/20 text-orange-300 border border-orange-400/40'
                            }`}
                          >
                            {u.role === 'admin' ? 'व्यवस्थापक' : 'स्वयंसेवक'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-orange-200/60">
                          <span>आयडी: <strong className="text-orange-100">{u.username}</strong></span>
                          {u.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {u.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                      {/* Active Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.isActive ? 'bg-emerald-400' : 'bg-gray-400'
                          }`}
                        />
                        {u.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                      </span>

                      {/* Toggle Active Button */}
                      {!isMainAdmin && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.name, u.isActive)}
                          title={u.isActive ? 'निष्क्रिय करा' : 'सक्रिय करा'}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            u.isActive
                              ? 'border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                              : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Delete Button */}
                      {!isMainAdmin ? (
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          title="खाते कायमचे हटवा"
                          className="p-1.5 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-400/60 font-semibold px-1">
                          मुख्य प्रशासक
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
    </div>
  );
}
