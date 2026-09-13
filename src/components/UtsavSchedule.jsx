import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Plus, Trash2, X, Save } from 'lucide-react';
import { useDonations } from '../hooks/useDonations';
import { useAuth } from '../context/AuthContext';
import {
  useLanguage,
  DEFAULT_DAILY_SCHEDULE,
  SPECIAL_FESTIVAL_EVENTS,
} from '../context/LanguageContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const DEVOTIONAL_EMOJIS = ['🌅', '🪔', '🔔', '🍲', '🕯️', '🍛', '🌙', '🚩', '🌺', '🍬', '🕉️', '🥁', '🙏', '✨', '💐'];

export default function UtsavSchedule() {
  const { t, pick, lang } = useLanguage();
  const { settings } = useDonations();
  const { isAdmin, token } = useAuth();

  // Active schedule from backend settings or fallback defaults
  const activeSchedule = settings?.dailySchedule && settings.dailySchedule.length > 0
    ? settings.dailySchedule
    : DEFAULT_DAILY_SCHEDULE;

  // Admin edit modal states
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [editingScheduleList, setEditingScheduleList] = useState([]);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [scheduleFeedback, setScheduleFeedback] = useState('');

  const handleOpenEditSchedule = () => {
    // Deep clone and normalize
    const normalized = activeSchedule.map((item, idx) => ({
      id: item.id || `sch-${idx}`,
      time: typeof item.time === 'string' ? item.time : pick(item.time),
      title: typeof item.title === 'string' ? item.title : pick(item.title),
      icon: item.icon || '🪔',
      desc: typeof item.desc === 'string' ? item.desc : pick(item.desc),
    }));
    setEditingScheduleList(normalized);
    setIsEditingSchedule(true);
    setScheduleFeedback('');
  };

  const handleAddScheduleItem = () => {
    const newItem = {
      id: `sch-${Date.now()}`,
      time: lang === 'mr' ? 'सायंकाळी ०६:००' : '06:00 PM',
      title: lang === 'mr' ? 'नवीन आरती / सोहळा' : 'New Prayer Session',
      icon: '🪔',
      desc: lang === 'mr' ? 'आरती व कार्यक्रमाची माहिती येथे लिहा.' : 'Details of prayer and ceremony.',
    };
    setEditingScheduleList((prev) => [...prev, newItem]);
  };

  const handleUpdateScheduleItem = (index, field, value) => {
    setEditingScheduleList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteScheduleItem = (index) => {
    setEditingScheduleList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    setScheduleFeedback('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dailySchedule: editingScheduleList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('error'));

      setScheduleFeedback(t('scheduleSavedMsg'));
      setTimeout(() => {
        setIsEditingSchedule(false);
        setScheduleFeedback('');
      }, 1000);
    } catch (err) {
      setScheduleFeedback('❌ ' + err.message);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  return (
    <section id="schedule" className="relative w-full space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <span>🔔</span>
          <span>{t('scheduleBadge')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {t('scheduleTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-orange-200/75 max-w-2xl mx-auto">
          {t('scheduleSubtitle')}
        </p>
      </div>

      {/* Daily Aarti Grid */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 p-6 md:p-8 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <h3 className="text-lg sm:text-xl font-bold text-amber-200">
              {t('dailyScheduleTitle')}
            </h3>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenEditSchedule}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t('editScheduleBtn')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {activeSchedule.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-orange-950/30 p-3.5 hover:border-amber-400/40 hover:bg-orange-900/40 transition-all"
            >
              <div className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-400/20 shrink-0">
                {item.icon || '🪔'}
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block font-mono text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                  {pick(item.time)}
                </span>
                <h4 className="font-bold text-sm text-white mt-1">
                  {pick(item.title)}
                </h4>
                <p className="text-xs text-orange-200/75 mt-0.5 leading-relaxed">
                  {pick(item.desc)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 10-Day Festival Highlights */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 p-6 md:p-8 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
          <span className="text-2xl">🚩</span>
          <h3 className="text-lg sm:text-xl font-bold text-amber-200">
            {t('specialEventsTitle')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {SPECIAL_FESTIVAL_EVENTS.map((event, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl border border-orange-500/20 bg-black/40 p-4 space-y-1.5 hover:border-amber-400/50 transition-all"
            >
              <span className="text-xs font-bold text-amber-400">
                {pick(event.day)}
              </span>
              <h4 className="font-bold text-sm text-white">
                {pick(event.title)}
              </h4>
              <p className="text-xs text-orange-200/75 leading-relaxed">
                {pick(event.desc)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Guidelines & Offerings Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-amber-500/25 bg-orange-950/30 p-5 backdrop-blur-xl space-y-2">
          <span className="text-3xl">🍬</span>
          <h4 className="font-bold text-sm text-white">{t('modakTitle')}</h4>
          <p className="text-xs text-orange-200/75">
            {t('modakDesc')}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-orange-950/30 p-5 backdrop-blur-xl space-y-2">
          <span className="text-3xl">🌿</span>
          <h4 className="font-bold text-sm text-white">{t('durvaTitle')}</h4>
          <p className="text-xs text-orange-200/75">
            {t('durvaDesc')}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-orange-950/30 p-5 backdrop-blur-xl space-y-2">
          <span className="text-3xl">🌺</span>
          <h4 className="font-bold text-sm text-white">{t('jaswandTitle')}</h4>
          <p className="text-xs text-orange-200/75">
            {t('jaswandDesc')}
          </p>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ADMIN EDIT MODAL: DAILY AARTI & MAHAPRASAD SCHEDULE                   */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isEditingSchedule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-gradient-to-b from-stone-950 via-orange-950/95 to-black p-5 sm:p-7 shadow-2xl space-y-5 my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>⏰</span>
                    <span>{t('adminScheduleModalTitle')}</span>
                  </h3>
                  <p className="text-xs text-orange-200/70 mt-0.5">
                    {t('adminScheduleModalSub')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingSchedule(false)}
                  className="rounded-full p-1.5 text-orange-200/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {scheduleFeedback && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs sm:text-sm font-semibold text-amber-200">
                  {scheduleFeedback}
                </div>
              )}

              {/* List of Schedule Items */}
              <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
                {editingScheduleList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-2xl border border-amber-500/25 bg-black/50 p-4 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-amber-500/15 pb-2">
                      <span className="text-xs font-bold text-amber-300">
                        {lang === 'mr' ? `आरती / सत्र #${idx + 1}` : `Session #${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduleItem(idx)}
                        className="p-1 rounded-lg text-red-400 hover:bg-red-950/60 transition cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                          {lang === 'mr' ? 'वेळ (Time)' : 'Time'}
                        </label>
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => handleUpdateScheduleItem(idx, 'time', e.target.value)}
                          className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                          placeholder={lang === 'mr' ? 'उदा. सकाळी ०६:०० किंवा दुपारी १२:३०' : 'e.g. 06:00 AM or 12:30 PM'}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                          {lang === 'mr' ? 'आरती / कार्यक्रमाचे नाव (Title)' : 'Session Title'}
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateScheduleItem(idx, 'title', e.target.value)}
                          className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                          placeholder={lang === 'mr' ? 'उदा. काकड आरती व भूपाळी' : 'e.g. Morning Kakad Aarti'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        {lang === 'mr' ? 'चिन्ह / इमोजी (Emoji Icon)' : 'Emoji Icon'}
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {DEVOTIONAL_EMOJIS.map((emoji) => (
                          <button
                            type="button"
                            key={emoji}
                            onClick={() => handleUpdateScheduleItem(idx, 'icon', emoji)}
                            className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm border transition cursor-pointer ${
                              item.icon === emoji
                                ? 'border-amber-400 bg-amber-500/30 scale-110 shadow-md shadow-amber-500/20'
                                : 'border-amber-500/20 bg-black/40 hover:bg-amber-500/15'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => handleUpdateScheduleItem(idx, 'icon', e.target.value)}
                        className="w-24 rounded-xl border border-amber-500/30 bg-black/60 py-1.5 px-3 text-sm text-center text-white outline-none focus:border-amber-400"
                        placeholder="Emoji"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        {lang === 'mr' ? 'सविस्तर माहिती / महत्त्व (Description)' : 'Description'}
                      </label>
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={(e) => handleUpdateScheduleItem(idx, 'desc', e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                        placeholder={lang === 'mr' ? 'आरती किंवा महाप्रसादाबद्दल थोडक्यात माहिती...' : 'Brief summary about this prayer/event...'}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={handleAddScheduleItem}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-amber-400/60 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('addAartiBtn')}</span>
                </button>

                <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingSchedule(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-orange-200 text-xs font-semibold transition cursor-pointer"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    disabled={isSavingSchedule}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-lg shadow-orange-600/30 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSavingSchedule ? (
                      <span>{t('saving')}</span>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>{t('saveScheduleBtn')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
