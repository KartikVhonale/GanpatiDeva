import React, { useState } from 'react';
import { playTempleBell } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const AARTIS = [
  {
    id: 'sukhkarta',
    title: { mr: 'सुखकर्ता दुखहर्ता (मुख्य आरती)', en: 'Sukhkarta Dukhharta (Main Aarti)' },
    author: { mr: 'श्री समर्थ रामदास स्वामी विरचित', en: 'Composed by Saint Samarth Ramdas Swami' },
    lines: [
      "सुखकर्ता दुखहर्ता वार्ता विघ्नाची । नुरवी पुरवी प्रेम कृपा जयाची ॥",
      "सर्वांगी सुंदर उटी शेंदुराची । कंठी झळके माळ मुक्ताफळांची ॥ १ ॥",
      "",
      "जय देव जय देव जय मंगलमूर्ती । दर्शनमात्रे मनकामना पुरती ॥ धृ. ॥",
      "",
      "रत्नखचित फरा तुज गौरीकुमरा । चंदनाची उटी कुमकुमकेशरा ॥",
      "हिरेजडित मुकुट शोभतो बरा । रुणझुणती नूपुरे चरणी घागरिया ॥ २ ॥",
      "",
      "जय देव जय देव जय मंगलमूर्ती । दर्शनमात्रे मनकामना पुरती ॥ धृ. ॥",
      "",
      "लंबोदर पीतांबर फणिवरबंधना । सरळ सोंड वक्रतुंड त्रिनयना ॥",
      "दास रामाचा वाट पाहे सदना । संकटी पावावे निर्वाणी रक्षावे सुरवरवंदना ॥ ३ ॥",
      "",
      "जय देव जय देव जय मंगलमूर्ती । दर्शनमात्रे मनकामना पुरती ॥ धृ. ॥"
    ]
  },
  {
    id: 'shendur',
    title: { mr: 'शेंदुर लाल चढायो (आरती)', en: 'Shendur Lal Chadhayo (Aarti)' },
    author: { mr: 'पारंपरिक आरती', en: 'Traditional Devotional Aarti' },
    lines: [
      "शेंदुर लाल चढायो अच्छा गजमुख को । दोंदिल लाल बिराजे सुत गौरीहर को ॥",
      "हाथ लिए गुडलड्डू सांई सुरवर को । महिमा कहे न जाय लागत हूं पद को ॥ १ ॥",
      "",
      "जय जय जय जय जय वंदना जय गणपती देवा ।",
      "माता जाकी पार्वती पिता महादेवा ॥ धृ. ॥",
      "",
      "विघ्नविनाशन मंगलमूर्ती जय जय आरती । रिद्धि सिद्धि के दाता तुम हो सुखकारी ॥",
      "अंधे को आंख देत कोढिन को काया । बांझन को पुत्र देत निर्धन को माया ॥ २ ॥",
      "",
      "जय जय जय जय जय वंदना जय गणपती देवा ।",
      "माता जाकी पार्वती पिता महादेवा ॥ धृ. ॥",
      "",
      "सूर श्याम शरण आए सफल कीजे सेवा । जय जय जय जय जय वंदना जय गणपती देवा ॥ ३ ॥"
    ]
  },
  {
    id: 'ghalin',
    title: { mr: 'घालीन लोटांगण वंदीन चरण', en: 'Ghalin Lotangan Vandin Charan' },
    author: { mr: 'आरती सांगता व प्रार्थना', en: 'Conclusive Prayer & Surrender' },
    lines: [
      "घालीन लोटांगण वंदीन चरण । डोळ्यांनी पाहीन रूप तुझे ॥",
      "प्रेमे आलिंगिन आनंदे पूजिन । भावे ओवाळिन म्हणे नामा ॥ १ ॥",
      "",
      "त्वमेव माता च पिता त्वमेव । त्वमेव बन्धुश्च सखा त्वमेव ॥",
      "त्वमेव विद्या द्रविणं त्वमेव । त्वमेव सर्वं मम देव देव ॥ २ ॥",
      "",
      "कायेन वाचा मनसेंद्रियैर्वा । बुद्ध्यात्मना वा प्रकृतिस्वभावात् ॥",
      "करोमि यद्यत् सकलं परस्मै । नारायणायेति समर्पयामि ॥ ३ ॥",
      "",
      "अच्युतं केशवं रामनारायणं । कृष्णदामोदरं वासुदेवं हरिम् ॥",
      "श्रीधरं माधवं गोपिकावल्लभं । जानकीनायकं रामचंद्रं भजे ॥ ४ ॥",
      "",
      "हरे राम हरे राम राम राम हरे हरे । हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे ॥"
    ]
  },
  {
    id: 'sankat-nashan',
    title: { mr: 'श्री संकटनाशन गणेश स्तोत्रम्', en: 'Shri Sankat Nashan Ganesha Stotram' },
    author: { mr: 'नारद पुराणातील अत्यंत फलदायी स्तोत्र', en: 'Sacred Stotra from Narada Purana' },
    lines: [
      "॥ श्री गणेशाय नमः ॥",
      "प्रणम्य शिरसा देवं गौरीपुत्रं विनायकम् ।",
      "भक्तावासं स्मरेन्नित्यमायुःकामार्थसिद्धये ॥ १ ॥",
      "",
      "प्रथमं वक्रतुण्डं च एकदन्तं द्वितीयकम् ।",
      "तृतीयं कृष्णपिङ्गाक्षं गजवक्त्रं चतुर्थकम् ॥ २ ॥",
      "",
      "लम्बोदरं पञ्चमं च षष्ठं विकटमेव च ।",
      "सप्तमं विघ्नराजेन्द्रं धूम्रवर्णं तथाष्टमम् ॥ ३ ॥",
      "",
      "नवमं भालचन्द्रं च दशमं तु विनायकम् ।",
      "एकादशं गणपतिं द्वादशं तु गजाननम् ॥ ४ ॥",
      "",
      "द्वादशैतानि नामानि त्रिसंध्यं यः पठेन्नरः ।",
      "न च विघ्नभयं तस्य सर्वसिद्धिकरं प्रभो ॥ ५ ॥",
      "",
      "विद्यार्थी लभते विद्यां धनार्थी लभते धनम् ।",
      "पुत्रार्थी लभते पुत्रान् मोक्षार्थी लभते गतिम् ॥ ६ ॥",
      "",
      "जपेद्गणपतिस्तोत्रं षड्भिर्मासैः फलं लभेत् ।",
      "संवत्सरेण सिद्धिं च लभते नात्र संशयः ॥ ७ ॥",
      "",
      "अष्टभ्यो ब्राह्मणेभ्यश्च लिखित्वा यः समर्पयेत् ।",
      "तस्य विद्या भवेत्सर्वा गणेशस्य प्रसादतः ॥ ८ ॥",
      "",
      "॥ इति श्रीनारदपुराणे संकटनाशनं गणेशस्तोत्रं सम्पूर्णम् ॥"
    ]
  },
  {
    id: 'atharvashirsha',
    title: { mr: 'श्री गणपती अथर्वशीर्ष (मंत्र)', en: 'Shri Ganapati Atharvashirsha (Mantra)' },
    author: { mr: 'अथर्ववेदातील मूळ गणेश उपनिषद', en: 'Sacred Atharva Veda Upanishad' },
    lines: [
      "ॐ नमस्ते गणपतये । त्वमेव प्रत्यक्षं तत्त्वमसि ।",
      "त्वमेव केवलं कर्ताऽसि । त्वमेव केवलं धर्ताऽसि ।",
      "त्वमेव केवलं हर्ताऽसि । त्वमेव सर्वं खल्विदं ब्रह्मासि ।",
      "त्वं साक्षादात्माऽसि नित्यम् ॥ १ ॥",
      "",
      "ऋतं वच्मि । सत्यं वच्मि ॥ २ ॥",
      "",
      "अव त्वं माम् । अव वक्तारम् । अव श्रोतारम् ।",
      "अव दातारम् । अव धातारम् । अवानूचानमव शिष्यम् ।",
      "अव पश्चात्तात् । अव पुरस्तात् । अवोत्तरात्तात् ।",
      "अव दक्षिणात्तात् । अव चोध्वात्तात् । अवाधरात्तात् ।",
      "सर्वतो मां पाहि पाहि समन्तात् ॥ ३ ॥",
      "",
      "त्वं वाङ्मयस्त्वं चिन्मयः । त्वमानन्दमयस्त्वं ब्रह्ममयः ।",
      "त्वं सच्चिदानन्दाऽद्वितीयोऽसि । त्वं प्रत्यक्षं ब्रह्मासि ।",
      "त्वं ज्ञानमयो विज्ञानमयोऽसि ॥ ४ ॥",
      "",
      "सर्वं जगदिदं त्वत्तो जायते । सर्वं जगदिदं त्वत्तस्तिष्ठति ।",
      "सर्वं जगदिदं त्वयि लयमेष्यति । सर्वं जगदिदं त्वयि प्रत्येति ।",
      "त्वं भूमिरापोऽनलोऽनिलो नभः । त्वं चत्वारि वाक्पदानि ॥ ५ ॥",
      "",
      "ॐ गं गणपतये नमः ॥"
    ]
  },
  {
    id: 'mantrapushpanjali',
    title: { mr: 'मंत्रपुष्पांजली', en: 'Mantra Pushpanjali' },
    author: { mr: 'ऋग्वेदातील पवित्र मंत्र', en: 'Sacred Vedic Mantras from Rigveda' },
    lines: [
      "ॐ यज्ञेन यज्ञमयजन्त देवास्तानि धर्माणि प्रथमान्यासन् ।",
      "ते ह नाकं महिमानः सचन्त यत्र पूर्वे साध्याः सन्ति देवाः ॥",
      "",
      "ॐ राजाधिराजाय प्रसह्यसाहिने नमो वयं वैश्रवणाय कुर्महे ।",
      "स मे कामान् कामकामाय मह्यं कामेश्वरो वैश्रवणो ददातु ।",
      "कुबेराय वैश्रवणाय महाराजाय नमः ॥",
      "",
      "ॐ स्वस्ति साम्राज्यं भौज्यं स्वाराज्यं वैराज्यं पारमेष्ठ्यं राज्यं",
      "महाराज्यमाधिपत्यमयं समन्तपर्यायी स्यात् सार्वभौमः सार्वायुष आन्तादापरार्धात् ।",
      "पृथिव्यै समुद्रपर्यन्ताया एकराळिति ॥",
      "",
      "तदप्येष श्लोकोऽभिगीतो मरुतः परिवेष्टारो मरुत्तस्यावसन् गृहे ।",
      "आविक्षितस्य कामप्रेर्विश्वेदेवाः सभासद इति ॥",
      "",
      "॥ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि तन्नो दन्तिः प्रचोदयात् ॥",
      "॥ श्री मंत्रपुष्पांजली समर्पयामि ॥"
    ]
  }
];

export default function AartiSection() {
  const { t, pick, isMarathi } = useLanguage();
  const { isLight } = useTheme();
  const [selectedAarti, setSelectedAarti] = useState(AARTIS[0]);
  const [fontSize, setFontSize] = useState(16); // in px

  const handleRing = () => {
    playTempleBell();
  };

  return (
    <section className="relative w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold mb-1.5 ${
            isLight
              ? 'border-[#CC5500]/30 bg-[#CC5500]/10 text-[#CC5500]'
              : 'border-amber-400/40 bg-amber-500/10 text-amber-300'
          }`}>
            <span>📖</span>
            <span>{t('aartiSectionBadge')}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isLight ? 'text-stone-900' : 'text-white'
          }`}>
            {t('aartiSectionTitle')}
          </h2>
          <p className={`text-xs sm:text-sm mt-0.5 ${
            isLight ? 'text-stone-600' : 'text-orange-200/75'
          }`}>
            {t('aartiSectionSub')}
          </p>
        </div>

        {/* Controls: Font size + Temple Bell */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-xl border px-2.5 py-1 text-xs ${
            isLight
              ? 'border-[#CC5500]/25 bg-[#F5F5DC] text-stone-700'
              : 'border-amber-500/30 bg-orange-950/40 text-orange-200'
          }`}>
            <span className="mr-2 text-[11px] font-semibold">{t('fontSizeLabel')}</span>
            <button
              type="button"
              onClick={() => setFontSize(Math.max(13, fontSize - 2))}
              className={`h-6 w-6 rounded text-sm font-bold flex items-center justify-center cursor-pointer ${
                isLight
                  ? 'bg-[#FFFDD0] hover:bg-stone-200 text-stone-800'
                  : 'bg-black/40 hover:bg-orange-800/40 text-amber-300'
              }`}
              title={isMarathi ? 'लहान करा' : 'Decrease font size'}
            >
              -
            </button>
            <span className={`w-8 text-center font-bold ${isLight ? 'text-[#CC5500]' : 'text-amber-300'}`}>{fontSize}</span>
            <button
              type="button"
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              className={`h-6 w-6 rounded text-sm font-bold flex items-center justify-center cursor-pointer ${
                isLight
                  ? 'bg-[#FFFDD0] hover:bg-stone-200 text-stone-800'
                  : 'bg-black/40 hover:bg-orange-800/40 text-amber-300'
              }`}
              title={isMarathi ? 'मोठे करा' : 'Increase font size'}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleRing}
            className="flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:scale-105 transition-all cursor-pointer"
          >
            <span>🔔</span>
            <span>{t('ringBellBtn')}</span>
          </button>
        </div>
      </div>

      {/* Aarti Selector Tabs */}
      <div className={`flex flex-wrap gap-2 border-b pb-3 ${
        isLight ? 'border-[#CC5500]/15' : 'border-amber-500/20'
      }`}>
        {AARTIS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelectedAarti(a)}
            className={`rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedAarti.id === a.id
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white shadow-md ring-1 ring-amber-300'
                : isLight
                ? 'border border-[#CC5500]/25 bg-[#F5F5DC] text-stone-700 hover:bg-[#FFFDD0] hover:text-stone-900'
                : 'border border-amber-500/20 bg-orange-950/30 text-orange-200/80 hover:bg-orange-900/40 hover:text-white'
            }`}
          >
            {pick(a.title)}
          </button>
        ))}
      </div>

      {/* Main Aarti Reading Card */}
      <div className={`relative overflow-hidden rounded-3xl border p-6 md:p-10 backdrop-blur-2xl shadow-xl ${
        isLight
          ? 'border-[#CC5500]/25 bg-[#FFFDD0] text-stone-900 shadow-md'
          : 'border-amber-500/30 bg-gradient-to-br from-orange-950/60 via-red-950/40 to-black/80 text-white shadow-xl'
      }`}>
        <div className={`border-b pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
          isLight ? 'border-[#CC5500]/15' : 'border-amber-500/30'
        }`}>
          <div>
            <h3 className={`text-xl sm:text-2xl font-black ${
              isLight ? 'text-[#CC5500]' : 'text-amber-200'
            }`}>
              {pick(selectedAarti.title)}
            </h3>
            <p className={`text-xs italic mt-0.5 ${
              isLight ? 'text-stone-500' : 'text-orange-300/80'
            }`}>
              {pick(selectedAarti.author)}
            </p>
          </div>
          <div className={`text-xs px-3 py-1 rounded-full self-start font-bold border ${
            isLight
              ? 'text-[#CC5500] bg-[#CC5500]/10 border-[#CC5500]/30'
              : 'text-amber-300/80 bg-amber-950/40 border-amber-400/30'
          }`}>
            {isMarathi ? '॥ गणपती बाप्पा मोरया ॥' : '|| Ganpati Bappa Morya ||'}
          </div>
        </div>

        {/* Aarti Lyrics */}
        <div 
          className={`space-y-3 font-serif text-center leading-relaxed ${
            isLight ? 'text-stone-800' : 'text-amber-50/95'
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {selectedAarti.lines.map((line, index) => (
            line === "" ? (
              <div key={index} className="h-4 flex items-center justify-center">
                <span className={`text-xs ${isLight ? 'text-[#CC5500]/50' : 'text-amber-500/50'}`}>✦ ✦ ✦</span>
              </div>
            ) : (
              <p 
                key={index}
                className={
                  line.includes("जय देव") || line.includes("धृ.") 
                    ? isLight
                      ? "font-bold text-[#CC5500] tracking-wide text-lg sm:text-xl py-1"
                      : "font-bold text-amber-300 tracking-wide text-lg sm:text-xl py-1" 
                    : ""
                }
              >
                {line}
              </p>
            )
          ))}
        </div>

        {/* Footer Blessing */}
        <div className={`mt-10 pt-4 border-t text-center text-xs ${
          isLight ? 'border-[#CC5500]/15 text-stone-500' : 'border-amber-500/20 text-orange-300/70'
        }`}>
          {isMarathi
            ? '॥ अनंत कोटी ब्रह्मांड नायक, राजाधिराज, योगीराज, श्री सिद्धिविनायक गणपती महाराज की जय ॥'
            : '|| Ananta Koti Brahmanda Nayaka, Rajadhiraja, Yogiraja, Shri Siddhivinayak Ganapati Maharaj Ki Jai ||'}
        </div>
      </div>
    </section>
  );
}
