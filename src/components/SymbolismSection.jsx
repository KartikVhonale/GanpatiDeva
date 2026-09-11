import React from 'react';
import { motion } from 'framer-motion';

const SYMBOLS = [
  {
    icon: '🐘',
    title: 'मोठे मस्तक (Large Head)',
    meaning: 'विशाल विचार (Think Big)',
    desc: 'बुद्धी, ज्ञान आणि दूरदृष्टीचे प्रतीक. नेहमी उच्च आणि सकारात्मक विचार करण्याची प्रेरणा देते.'
  },
  {
    icon: '👂',
    title: 'सूपसारखे मोठे कान (Broad Ears)',
    meaning: 'उत्तम श्रवण (Listen More)',
    desc: 'इतरांचे म्हणणे शांतपणे ऐकून घेणे आणि नको असलेल्या वाईट गोष्टी गाळून टाकणे.'
  },
  {
    icon: '👄',
    title: 'लहान मुख (Small Mouth)',
    meaning: 'मितभाषी (Speak Less)',
    desc: 'कमी आणि गोड बोला. वाणीवर संयम ठेवणे हाच आत्मिक उन्नतीचा खरा मार्ग आहे.'
  },
  {
    icon: '👃',
    title: 'लांब व वक्र सोंड (Long Trunk)',
    meaning: 'अनुकूलन व सामर्थ्य (High Efficiency)',
    desc: 'अवघडात अवघड परिस्थितीतही शांत राहून योग्य मार्ग काढण्याची अफाट कार्यक्षमता.'
  },
  {
    icon: '🪓',
    title: 'हातातील परशू व पाश (Axe & Rope)',
    meaning: 'आसक्ती तोडणे (Sever Attachments)',
    desc: 'अहंकार व संसारातील व्यर्थ बंधने तोडून सत्याच्या आणि भगवंताच्या मार्गावर चालणे.'
  },
  {
    icon: '🦷',
    title: 'एकदंत (Broken Tusk)',
    meaning: 'त्याग व निष्ठा (Sacrifice for Knowledge)',
    desc: 'महाभारत लिहिण्यासाठी स्वतःचा दात अर्पण केला. ज्ञानासाठी आणि कर्तव्यासाठी कोणताही त्याग करण्याची तयारी.'
  },
  {
    icon: '🍲',
    title: 'विशाल उदर (Large Belly)',
    meaning: 'सुख-दुःख पचवणे (Digest All Experiences)',
    desc: 'जीवनातील सुख आणि दुःख, स्तुती आणि निंदा समान भावनेने पचवण्याची सहनशीलता.'
  },
  {
    icon: '🍬',
    title: 'हातातील मोदक (Modak)',
    meaning: 'साधनेचे गोड फळ (Sweet Reward of Virtue)',
    desc: 'सत्कर्म आणि भक्तीचे अंतिम फळ नेहमी मोदकासारखे गोड आणि तृप्ती देणारे असते.'
  },
  {
    icon: '🐁',
    title: 'मूषक वाहन (Tiny Mouse)',
    meaning: 'इच्छांवर नियंत्रण (Control Over Desires)',
    desc: 'मूषक हा चंचल वासनेचे प्रतीक आहे. बाप्पा त्यावर स्वार होऊन चंचल मनावर विजय मिळवण्याचा संदेश देतात.'
  },
];

export default function SymbolismSection() {
  return (
    <section className="relative w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <span>🕉️</span>
          <span>आध्यात्मिक तत्त्वज्ञान</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          गणपती बाप्पाच्या रूपाचे गूढ रहस्य (Divine Symbolism)
        </h2>
        <p className="text-xs sm:text-sm text-orange-200/75 max-w-2xl mx-auto">
          श्री गणेशाचे प्रत्येक अंग जीवनात यशस्वी, सुखी आणि आनंदी होण्याचा आदर्श जीवनमंत्र शिकवते.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SYMBOLS.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/60 p-5 backdrop-blur-xl shadow-lg hover:border-amber-400/50 hover:shadow-orange-600/20 transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>
                <div className="inline-block rounded-md bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                  {item.meaning}
                </div>
                <p className="text-xs text-orange-200/75 pt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
