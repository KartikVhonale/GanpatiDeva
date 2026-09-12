import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Plus, Trash2, X, Check, Save, Clock, Sparkles } from 'lucide-react';
import { useDonations } from '../hooks/useDonations';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const DEFAULT_DAILY_SCHEDULE = [
  { id: 'sch-1', time: 'सकाळी ०६:००', title: 'काकड आरती व भूपाळी', icon: '🌅', desc: 'बाप्पाची मंगल प्रभात व सुमधूर भूपाळी गायन.' },
  { id: 'sch-2', time: 'सकाळी ०८:३०', title: 'अभिषेक, पंचामृत स्नान व नित्य पूजा', icon: '🪔', desc: 'वेदमंत्रांच्या जयघोषात मुख्य मूर्तीचा पवित्र अभिषेक.' },
  { id: 'sch-3', time: 'दुपारी १२:१५', title: 'दुपारची नैवेद्य महाआरती', icon: '🔔', desc: '२१ मोदक व पंचपक्वान्न नैवेद्य अर्पण.' },
  { id: 'sch-4', time: 'दुपारी १२:३० ते ०३:००', title: 'सार्वजनिक महाप्रसाद (अन्नदान)', icon: '🍲', desc: 'सर्व भाविकांसाठी महाप्रसाद भोजन व्यवस्था.' },
  { id: 'sch-5', time: 'सायंकाळी ०७:३०', title: 'मुख्य संध्या महाआरती व धूपारती', icon: '🕯️', desc: 'दिव्यांच्या लखलखाटात आणि ढोल-ताशांच्या गजरात महाआरती.' },
  { id: 'sch-6', time: 'रात्री ०८:३० ते १०:३०', title: 'रात्रीचा महाप्रसाद वाटप', icon: '🍛', desc: 'सायंकाळच्या दर्शनार्थी भाविकांसाठी प्रसाद वितरण.' },
  { id: 'sch-7', time: 'रात्री १०:००', title: 'शेजारती व मूक दर्शन', icon: '🌙', desc: 'दिवसाच्या सांगतेची शांत आणि भावपूर्ण शेजारती.' },
];

const DEVOTIONAL_EMOJIS = ['🌅', '🪔', '🔔', '🍲', '🕯️', '🍛', '🌙', '🚩', '🌺', '🍬', '🕉️', '🥁', '🙏', '✨', '💐'];

const SPECIAL_EVENTS = [
  { day: 'दिवस १ (गणेश चतुर्थी)', title: 'श्रींची प्राणप्रतिष्ठापना व आगमन सोहळा', desc: 'पारंपरिक वाद्यांच्या गजरात बाप्पाचे वाजत-गाजत आगमन.' },
  { day: 'दिवस ३', title: 'महिला हळदी-कुंकू व अथर्वशीर्ष पठण', desc: 'सामूहिक १०८ वेळा श्री गणपती अथर्वशीर्ष आवर्तन.' },
  { day: 'दिवस ५', title: 'गौरी आगमन व पूजन', desc: 'माता गौरीचे सवाद्य आगमन, सजावट व पारंपरिक गाणी.' },
  { day: 'दिवस ७', title: 'भव्य भजन संध्या व कीर्तन महोत्सव', desc: 'प्रसिद्ध वारकरी बुवांचे संगीतमय कीर्तन व भजन.' },
  { day: 'दिवस ९', title: 'सत्यविनायक महापूजा व ५६ भोग', desc: 'अखंड ५६ प्रकारच्या मिष्ठांनांचा छप्पन भोग नैवेद्य.' },
  { day: 'दिवस १० (अनंत चतुर्दशी)', title: 'महाविसर्जन मिरवणूक व निरोप', desc: 'गुलाल, फुले आणि टाळ-मृदुंगाच्या गजरात भावपूर्ण विसर्जन सोहळा.' },
];

export default function UtsavSchedule() {
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
    setEditingScheduleList(JSON.parse(JSON.stringify(activeSchedule)));
    setIsEditingSchedule(true);
    setScheduleFeedback('');
  };

  const handleAddScheduleItem = () => {
    const newItem = {
      id: `sch-${Date.now()}`,
      time: 'सायंकाळी ०६:००',
      title: 'नवीन आरती / सोहळा',
      icon: '🪔',
      desc: 'आरती व कार्यक्रमाची माहिती येथे लिहा.',
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
      if (!res.ok) throw new Error(data.error || 'वेळापत्रक सेव्ह करताना त्रुटी आली');

      setScheduleFeedback('✅ दैनिक आरत्या व महाप्रसाद वेळापत्रक यशस्वीरित्या सेव्ह झाले!');
      setTimeout(() => {
        setIsEditingSchedule(false);
        setScheduleFeedback('');
      }, 1000);
    } catch (err) {
      setScheduleFeedback('❌ त्रुटी: ' + err.message);
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
          <span>उत्सव दिनदर्शिका</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          दैनिक आरत्या व १० दिवसीय कार्यक्रम वेळापत्रक
        </h2>
        <p className="text-xs sm:text-sm text-orange-200/75 max-w-2xl mx-auto">
          श्री गणेशोत्सव काळातील दररोजच्या आरत्या, महाप्रसाद आणि विशेष सांस्कृतिक कार्यक्रमांचे संपूर्ण वेळापत्रक.
        </p>
      </div>

      {/* Daily Aarti Grid */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 p-6 md:p-8 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏰</span>
            <h3 className="text-lg sm:text-xl font-bold text-amber-200">
              दैनिक नित्य आरत्या व महाप्रसाद वेळा
            </h3>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleOpenEditSchedule}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>वेळापत्रक संपादित करा (Admin)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {activeSchedule.map((item, idx) => (
            <motion.div
              key={item.id || item.title || idx}
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
                  {item.time}
                </span>
                <h4 className="font-bold text-sm text-white mt-1">
                  {item.title}
                </h4>
                <p className="text-xs text-orange-200/75 mt-0.5 leading-relaxed">
                  {item.desc}
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
            १० दिवसांचे विशेष उत्सव व सांस्कृतिक सोहळे
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {SPECIAL_EVENTS.map((event, idx) => (
            <motion.div
              key={event.day}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl border border-orange-500/20 bg-black/40 p-4 space-y-1.5 hover:border-amber-400/50 transition-all"
            >
              <span className="text-xs font-bold text-amber-400">
                {event.day}
              </span>
              <h4 className="font-bold text-sm text-white">
                {event.title}
              </h4>
              <p className="text-xs text-orange-200/75 leading-relaxed">
                {event.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Guidelines & Offerings Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-amber-500/25 bg-orange-950/30 p-5 backdrop-blur-xl space-y-2">
          <span className="text-3xl">🍬</span>
          <h4 className="font-bold text-sm text-white">२१ मोदकांचा प्रसाद</h4>
          <p className="text-xs text-orange-200/75">
            उकडीचे किंवा तळलेले २१ मोदक बाप्पाला अत्यंत प्रिय आहेत. यामुळे तृप्ती आणि मनाची एकाग्रता वाढते.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-orange-950/30 p-5 backdrop-blur-xl space-y-2">
          <span className="text-3xl">🌿</span>
          <h4 className="font-bold text-sm text-white">२१ दुर्वांची जोडी</h4>
          <p className="text-xs text-orange-200/75">
            अनलासुर राक्षसाचा दाह शांत करण्यासाठी दुर्वा अर्पण केल्या जातात. दुर्वा ही शरीरातील उष्णता शांत करण्याचे प्रतीक आहे.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/25 bg-orange-950/30 p-5 backdrop-blur-xl space-y-2">
          <span className="text-3xl">🌺</span>
          <h4 className="font-bold text-sm text-white">लाल जास्वंदीचे फूल</h4>
          <p className="text-xs text-orange-200/75">
            लाल रंग हा तेज, ऊर्जा आणि चैतन्याचा कारक आहे. गणपती बाप्पाच्या मस्तकावर लाल जास्वंद अर्पण करणे अत्यंत शुभ मानले जाते.
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
                    <span>दैनिक आरत्या व महाप्रसाद वेळापत्रक संपादन (Admin Only)</span>
                  </h3>
                  <p className="text-xs text-orange-200/70 mt-0.5">
                    येथे केलेले बदल थेट मुख्य पृष्ठावर सर्व भाविकांना दिसतील.
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
                        आरती / सत्र #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteScheduleItem(idx)}
                        className="p-1 rounded-lg text-red-400 hover:bg-red-950/60 transition cursor-pointer"
                        title="काढून टाका"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                          वेळ (Time)
                        </label>
                        <input
                          type="text"
                          value={item.time}
                          onChange={(e) => handleUpdateScheduleItem(idx, 'time', e.target.value)}
                          className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                          placeholder="उदा. सकाळी ०६:०० किंवा दुपारी १२:३०"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                          आरती / कार्यक्रमाचे नाव (Title)
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateScheduleItem(idx, 'title', e.target.value)}
                          className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                          placeholder="उदा. काकड आरती व भूपाळी"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        चिन्ह / इमोजी (Emoji Icon)
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
                        placeholder="किंवा इमोजी टाईप करा"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-orange-200/80 mb-1">
                        सविस्तर माहिती / महत्त्व (Description)
                      </label>
                      <textarea
                        rows={2}
                        value={item.desc}
                        onChange={(e) => handleUpdateScheduleItem(idx, 'desc', e.target.value)}
                        className="w-full rounded-xl border border-amber-500/30 bg-black/60 py-2 px-3 text-xs text-white outline-none focus:border-amber-400"
                        placeholder="आरती किंवा महाप्रसादाबद्दल थोडक्यात माहिती..."
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
                  <span>नवीन आरती / वेळ जोडा</span>
                </button>

                <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingSchedule(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-orange-200 text-xs font-semibold transition cursor-pointer"
                  >
                    रद्द करा
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    disabled={isSavingSchedule}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-lg shadow-orange-600/30 disabled:opacity-50 transition cursor-pointer"
                  >
                    {isSavingSchedule ? (
                      <span>सेव्ह होत आहे...</span>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>बदल सेव्ह करा व Live करा</span>
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

