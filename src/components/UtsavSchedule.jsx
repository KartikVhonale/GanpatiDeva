import React from 'react';
import { motion } from 'framer-motion';

const DAILY_SCHEDULE = [
  { time: 'सकाळी ०६:००', title: 'काकड आरती व भूपाळी', icon: '🌅', desc: 'बाप्पाची मंगल प्रभात व सुमधूर भूपाळी गायन.' },
  { time: 'सकाळी ०८:३०', title: 'अभिषेक, पंचामृत स्नान व नित्य पूजा', icon: '🪔', desc: 'वेदमंत्रांच्या जयघोषात मुख्य मूर्तीचा पवित्र अभिषेक.' },
  { time: 'दुपारी १२:१५', title: 'दुपारची नैवेद्य महाआरती', icon: '🔔', desc: '२१ मोदक व पंचपक्वान्न नैवेद्य अर्पण.' },
  { time: 'दुपारी १२:३० ते ०३:००', title: 'सार्वजनिक महाप्रसाद (अन्नदान)', icon: '🍲', desc: 'सर्व भाविकांसाठी महाप्रसाद भोजन व्यवस्था.' },
  { time: 'सायंकाळी ०७:३०', title: 'मुख्य संध्या महाआरती व धूपारती', icon: '🕯️', desc: 'दिव्यांच्या लखलखाटात आणि ढोल-ताशांच्या गजरात महाआरती.' },
  { time: 'रात्री ०८:३० ते १०:३०', title: 'रात्रीचा महाप्रसाद वाटप', icon: '🍛', desc: 'सायंकाळच्या दर्शनार्थी भाविकांसाठी प्रसाद वितरण.' },
  { time: 'रात्री १०:००', title: 'शेजारती व मूक दर्शन', icon: '🌙', desc: 'दिवसाच्या सांगतेची शांत आणि भावपूर्ण शेजारती.' },
];

const SPECIAL_EVENTS = [
  { day: 'दिवस १ (गणेश चतुर्थी)', title: 'श्रींची प्राणप्रतिष्ठापना व आगमन सोहळा', desc: 'पारंपरिक वाद्यांच्या गजरात बाप्पाचे वाजत-गाजत आगमन.' },
  { day: 'दिवस ३', title: 'महिला हळदी-कुंकू व अथर्वशीर्ष पठण', desc: 'सामूहिक १०८ वेळा श्री गणपती अथर्वशीर्ष आवर्तन.' },
  { day: 'दिवस ५', title: 'गौरी आगमन व पूजन', desc: 'माता गौरीचे सवाद्य आगमन, सजावट व पारंपरिक गाणी.' },
  { day: 'दिवस ७', title: 'भव्य भजन संध्या व कीर्तन महोत्सव', desc: 'प्रसिद्ध वारकरी बुवांचे संगीतमय कीर्तन व भजन.' },
  { day: 'दिवस ९', title: 'सत्यविनायक महापूजा व ५६ भोग', desc: 'अखंड ५६ प्रकारच्या मिष्ठांनांचा छप्पन भोग नैवेद्य.' },
  { day: 'दिवस १० (अनंत चतुर्दशी)', title: 'महाविसर्जन मिरवणूक व निरोप', desc: 'गुलाल, फुले आणि टाळ-मृदुंगाच्या गजरात भावपूर्ण विसर्जन सोहळा.' },
];

export default function UtsavSchedule() {
  return (
    <section className="relative w-full space-y-8">
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
        <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
          <span className="text-2xl">⏰</span>
          <h3 className="text-lg sm:text-xl font-bold text-amber-200">
            दैनिक नित्य आरत्या व महाप्रसाद वेळा
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {DAILY_SCHEDULE.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-orange-950/30 p-3.5 hover:border-amber-400/40 hover:bg-orange-900/40 transition-all"
            >
              <div className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-400/20 shrink-0">
                {item.icon}
              </div>
              <div>
                <span className="inline-block font-mono text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                  {item.time}
                </span>
                <h4 className="font-bold text-sm text-white mt-1">
                  {item.title}
                </h4>
                <p className="text-xs text-orange-200/75 mt-0.5">
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
    </section>
  );
}
