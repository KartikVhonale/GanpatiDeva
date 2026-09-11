import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TEMPLES = [
  {
    id: 1,
    name: '१. श्री मयूरेश्वर (श्री क्षेत्र मोरगाव)',
    district: 'पुणे (कऱ्हा नदीकाठ)',
    vahana: 'मयूर (मोर)',
    desc: 'अष्टविनायक यात्रेची सुरुवात आणि सांगता मोरगावच्या मयूरेश्वराच्या दर्शनाने होते. कमलासुर दैत्याचा वध करण्यासाठी गणपतीने मोरावर स्वार होऊन हे रूप घेतले होते.',
    special: 'या मंदिराची रचना मुघल काळातील किल्ल्यासारखी चारही बाजूंनी उंच तटबंदी असलेली आहे.'
  },
  {
    id: 2,
    name: '२. श्री सिद्धिविनायक (श्री क्षेत्र सिद्धटेक)',
    district: 'अहमदनगर (भीमा नदीकाठ)',
    vahana: 'सिंह / मूषक',
    desc: 'येथे श्री विष्णूने मधू आणि कैटभ या राक्षसांचा वध करण्यासाठी गणेशाची आराधना करून सिद्धी प्राप्त केली होती. या मूर्तीची सोंड उजवीकडे वळलेली आहे.',
    special: 'उजव्या सोंडेचा गणपती कडक शिस्तीचा मानला जातो; येथे प्रदक्षिणेसाठी संपूर्ण डोंगर फिरावे लागते.'
  },
  {
    id: 3,
    name: '३. श्री बल्लाळेश्वर (श्री क्षेत्र पाली)',
    district: 'रायगड (अंबा नदीकाठ)',
    vahana: 'मूषक',
    desc: 'एकमेव मंदिर जे गणेशाच्या निस्सीम भक्त बल्लाळाच्या नावाने ओळखले जाते. भक्ताच्या हाकेला धावून येणारे अत्यंत जागृत देवस्थान.',
    special: 'मंदिरातील मूर्ती पूर्वाभिमुख असून सिंहासनावर विराजमान आहे; डोळ्यात आणि नाभीमध्ये हिरे जडवलेले आहेत.'
  },
  {
    id: 4,
    name: '४. श्री वरदविनायक (श्री क्षेत्र महड)',
    district: 'रायगड (खोपोलीजवळ)',
    vahana: 'मूषक',
    desc: 'येथे भाविकांच्या सर्व मनोकामना (वरद) पूर्ण होतात. मंदिराच्या गर्भगृहात १८९२ सालापासून अखंड नंदादीप तेवत आहे.',
    special: 'येथील मूर्ती स्वयंभू असून भाविकांना स्वतः गर्भगृहात जाऊन मूर्तीला स्पर्श करून पूजा करण्याची परवानगी आहे.'
  },
  {
    id: 5,
    name: '५. श्री चिंतामणी (श्री क्षेत्र थेऊर)',
    district: 'पुणे (मुळा-मुठा नदीसंगम)',
    vahana: 'मूषक',
    desc: 'मनातील चिंता दूर करणारे चिंतामणी. महर्षी कपिलांचे चिंतामणी रत्न गणेशाने कपटी गणासुराकडून परत मिळवून दिले होते.',
    special: 'श्रीमंत माधवराव पेशवे यांचे हे अत्यंत आवडते दैवत असून त्यांनी आपल्या आयुष्यातील शेवटचा काळ येथेच व्यतीत केला.'
  },
  {
    id: 6,
    name: '६. श्री गिरिजात्मज (श्री क्षेत्र लेण्याद्री)',
    district: 'जुन्नर, पुणे (कुकडी नदी)',
    vahana: 'मूषक',
    desc: 'माता पार्वतीने (गिरिजा) पुत्राच्या प्राप्तीसाठी येथे कठोर तप केले, म्हणून या रूपाला ‘गिरिजात्मज’ (गिरिजेचा पुत्र) म्हणतात.',
    special: 'हे एकमेव मंदिर आहे जे डोंगरावरील बौद्ध लेण्यांच्या गुहेमध्ये वसलेले आहे; येथे पोहोचण्यासाठी ३०७ पायऱ्या चढाव्या लागतात.'
  },
  {
    id: 7,
    name: '७. श्री विघ्नेश्वर (श्री क्षेत्र ओझर)',
    district: 'पुणे (कुुकडी नदीकाठ)',
    vahana: 'मूषक',
    desc: 'विघ्नासुर नावाच्या असुराचा पराभव करून संतांचे व ऋषींचे विघ्न हरण केले. असुराने शरण येऊन प्रार्थना केल्याने देवाचे नाव विघ्नेश्वर पडले.',
    special: 'मंदिराचा कळस सुवर्णमयी असून मंदिराभोवती भव्य तटबंदी आणि भव्य दीपमाळा आहेत.'
  },
  {
    id: 8,
    name: '८. श्री महागणपती (श्री क्षेत्र रांजणगाव)',
    district: 'पुणे (पुणे-अहमदनगर रस्ता)',
    vahana: 'कमल / मूषक',
    desc: 'भगवान शिवाने त्रिपुरासुराचा वध करण्यापूर्वी येथे महागणपतीची पूजा केली होती. हे गणेशाचे सर्वात शक्तिशाली आणि विराट रूप मानले जाते.',
    special: 'या मूर्तीला ‘दशमुखी’ (१० सोंडा आणि २० हात) स्वरूप मानले जाते; सूर्योदयाचे किरण थेट मूर्तीवर पडतात.'
  },
];

export default function AshtavinayakSection() {
  const [selectedTemple, setSelectedTemple] = useState(null);

  return (
    <section className="relative w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <span>🚩</span>
          <span>महाराष्ट्राची कुलदैवते</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          पवित्र अष्टविनायक यात्रा दर्शन (Eight Sacred Shrines)
        </h2>
        <p className="text-xs sm:text-sm text-orange-200/75 max-w-2xl mx-auto">
          स्वयंभू प्रकट झालेल्या ८ पवित्र श्री गणेशांच्या मंदिरांचा इतिहास, वैशिष्ट्ये आणि महिमा.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLES.map((t, idx) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            onClick={() => setSelectedTemple(t)}
            className="cursor-pointer group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-orange-950/40 via-red-950/30 to-black/70 p-4 sm:p-5 backdrop-blur-xl shadow-lg hover:border-amber-400/60 hover:shadow-orange-600/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🪔</span>
                <span className="rounded-full bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  तीर्थक्षेत्र
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors">
                {t.name}
              </h3>
              <p className="text-xs text-orange-300/70 mt-1">
                📍 {t.district}
              </p>
              <p className="text-xs text-orange-200/80 mt-2.5 line-clamp-3 leading-relaxed">
                {t.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-300 font-semibold">
              <span>माहिती वाचा</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Temple Detail Modal */}
      <AnimatePresence>
        {selectedTemple && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedTemple(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-3xl border border-amber-400/50 bg-gradient-to-b from-orange-950 via-red-950 to-black p-6 md:p-8 shadow-2xl text-white space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    अष्टविनायक तीर्थक्षेत्र दर्शन
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {selectedTemple.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-orange-200/75 mt-0.5">
                    📍 {selectedTemple.district}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTemple(null)}
                  className="rounded-full bg-white/10 hover:bg-white/20 h-8 w-8 flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-black/40 p-4 space-y-2.5 text-xs sm:text-sm text-orange-100/90 leading-relaxed">
                <p><strong>महिमा व कथा:</strong> {selectedTemple.desc}</p>
                <p className="border-t border-amber-500/20 pt-2 text-amber-200">
                  <strong>विशेष वैशिष्ठ्य:</strong> {selectedTemple.special}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTemple(null)}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow cursor-pointer"
                >
                  बाप्पा मोरया! (Close)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
