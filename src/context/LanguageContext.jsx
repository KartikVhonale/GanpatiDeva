import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const TRANSLATIONS = {
  mr: {
    // Navigation & Common
    mandalName: 'श्री गणेश उत्सव मंडळ',
    year: '२०२६',
    sacredMantra: '॥ ॐ गं गणपतये नमः ॥',
    home: 'मुख्य पृष्ठ',
    homeShort: 'दर्शन',
    liveBoard: 'थेट देणगी फलक',
    liveBoardShort: 'थेट फलक',
    volunteerDesk: 'स्वयंसेवक कक्ष',
    volunteerShort: 'स्वयंसेवक',
    adminDesk: 'व्यवस्थापक कक्ष',
    adminShort: 'व्यवस्थापक',
    login: 'लॉगिन',
    logout: 'बाहेर पडा',
    ringBell: 'घंटी',
    liveSync: 'Live',
    bhakti: 'Bhakti',
    footerShloka: '॥ मोरया रे बाप्पा मोरया रे, गणपती बाप्पा मोरया, मंगलमूर्ती मोरया ॥',
    trustNotice: 'सार्वजनिक श्री गणेश उत्सव मंडळ ट्रस्ट • नोंदणी क्र. महा/२०२६/गणेश-१',
    langToggleLabel: 'Language / भाषा',

    // Hero Section
    heroBadge: 'विघ्नहर्ता • सुखकर्ता • सर्वमंगलकारक',
    heroTitle: '॥ श्री गणेशाय नमः ॥',
    heroSubtitle: 'सार्वजनिक श्री गणेश उत्सव मंडळामध्ये आपले सहर्ष स्वागत! बाप्पाच्या चरणी नतमस्तक होऊन सुख, शांती आणि समृद्धीचे शुभाशीर्वाद प्राप्त करा.',
    showerFlowers: '🌸 पुष्पवृष्टी करा (Shower Flowers)',
    lightDiya: '🪔 दीप प्रज्वलित करा',
    diyaLit: '🪔 नंदादीप तेवत आहे',
    flowerChimeMsg: 'पुष्पवृष्टी समर्पित झाली! बाप्पा मोरया! 🌸',
    diyaLitMsg: '॥ शुभं करोति कल्याणम् आरोग्यं धनसंपदा ॥ दीप प्रज्वलित झाला! 🪔',
    btnLiveBoard: 'पहा थेट देणगी फलक (Live Board)',
    btnVolunteerDesk: 'स्वयंसेवक कक्ष (Volunteer Desk)',

    // Dakshina Board
    dakshinaTitle: 'थेट देणगी व पारदर्शकता फलक (Live Display Board)',
    dakshinaSubtitle: 'पंडाल मुख्य स्क्रीन व टीव्ही डिस्प्लेसाठी थेट अद्यतन',
    scanPayTitle: 'Scan & Pay Dakshina',
    scanPaySubtitle: 'Google Pay, PhonePe, Paytm किंवा BHIM द्वारे सेवा अर्पण करा',
    openMobileUpi: '📱 मोबाईलवर थेट UPI ॲप उघडा (GPay / PhonePe)',
    copyUpi: 'Copy',
    copiedUpi: 'Copied!',
    safeAccountNotice: 'सुरक्षित व अधिकृत मंडळ बँक खाते',
    exitFullscreen: 'Exit Fullscreen',
    enterFullscreen: 'फुलस्क्रीन (TV Mode)',

    // Volunteer Form & Desk
    volunteerDeskTitle: 'स्वयंसेवक कक्ष (Volunteer Desk)',
    volunteerDeskSub: 'कॅश व ऑनलाइन देणग्यांची थेट नोंदणी कक्ष',
    activeDuty: 'कार्यरत स्वयंसेवक',
    sessionEntriesBadge: 'सत्रातील नोंदी',
    sessionTotalBadge: 'जमा रोख रक्कम',
    recorderBadge: 'नोंदणीकर्ता',
    formTitle: 'देणगी नोंदणी फॉर्म',
    formSub: 'कॅश किंवा ऑनलाइन पावती तात्काळ नोंदवा (MongoDB & Live TV Sync)',
    paymentMethod: 'पेमेंट पद्धत (Payment Method)',
    cash: 'रोख (Cash)',
    onlineUpi: 'ऑनलाइन (UPI / QR)',
    donorNameLabel: 'भाविकांचे नाव (Donor Name)',
    donorNamePlaceholder: 'उदा. श्री. सचिन रमेश पाटील किंवा सहपरिवार',
    amountLabel: 'देणगी रक्कम (Amount in ₹)',
    amountPlaceholder: 'उदा. 1100',
    sevaTypeLabel: 'सेवा प्रकार (Seva Category)',
    cityLabel: 'गाव / शहर (Locality / City)',
    cityPlaceholder: 'उदा. दादर, मुंबई, पुणे',
    phoneLabel: 'मोबाईल क्र. (WhatsApp पावतीसाठी)',
    phonePlaceholder: '१० अंकी मोबाईल नंबर',
    submitDonationBtn: 'पावती तयार करा व देणगी नोंदवा',
    submitting: 'नोंद होत आहे...',
    whatsappShareBtn: 'WhatsApp वर पावती पाठवा',
    newReceiptBtn: 'नवीन नोंदणी',
    receiptGenerated: 'पावती तयार झाली (Receipt Generated)',
    sessionHistoryTitle: 'सध्याच्या सत्रातील नोंदणी इतिहास (Session History)',
    receiptCol: 'पावती क्र.',
    donorCol: 'भाविकांचे नाव',
    sevaCol: 'सेवा प्रकार',
    recorderCol: 'नोंदणीकर्ता',
    amountCol: 'रक्कम (₹)',
    timeCol: 'वेळ',
    noDonationsYet: 'या सत्रात अद्याप कोणतीही देणगी नोंदवली गेलेली नाही.',

    // Admin Page
    adminTitle: 'व्यवस्थापक नियंत्रण कक्ष (Admin Management)',
    adminSub: 'नवीन स्वयंसेवक जोडणे, परवानग्या देणे व अधिकृत प्रवेश व्यवस्थापन',
    openDeskBtn: 'स्वयंसेवक कक्ष उघडा',
    refreshBtn: 'रिफ्रेश',
    totalStaffBadge: 'एकूण नोंदणीकृत सदस्य',
    activeStaffBadge: 'सक्रिय वापरकर्ते (Active)',
    volunteersBadge: 'अधिकृत स्वयंसेवक',
    adminsBadge: 'मुख्य व्यवस्थापक (Admins)',
    addStaffTitle: 'नवीन सदस्य जोडा (Add User)',
    addStaffSub: 'स्वयंसेवक किंवा व्यवस्थापकाचे खाते तयार करा',
    fullNameLabel: 'पूर्ण नाव (Full Name) *',
    fullNamePlaceholder: 'उदा. सचिन गणेश पाटील',
    usernameLabel: 'वापरकर्ता नाव (Username / Login ID) *',
    usernamePlaceholder: 'उदा. sachin_p (लहान इंग्रजी अक्षरे)',
    passwordLabel: 'पासवर्ड (Initial Password) *',
    passwordPlaceholder: 'किमान ४ अक्षरे',
    roleLabel: 'भूमिका (Role & Access Level) *',
    roleVolunteer: 'स्वयंसेवक (Volunteer)',
    roleAdmin: 'व्यवस्थापक (Admin)',
    addStaffBtn: 'सदस्य जोडा (Add to Database)',
    directoryTitle: 'नोंदणीकृत सदस्य यादी (Staff Directory)',
    searchStaffPlaceholder: 'शोधा (नाव, आयडी किंवा फोन)...',
    activeStatus: 'सक्रिय',
    inactiveStatus: 'निष्क्रिय',
    mainAdminNotice: 'मुख्य प्रशासक',

    // Login Page
    loginHeaderTitle: 'मंडळ कक्ष प्रवेश',
    loginHeaderSub: 'स्वयंसेवक व व्यवस्थापकांसाठी अधिकृत प्रवेशद्वार',
    demoAccountsTitle: 'त्वरित चाचणीसाठी डेमो खाती (Demo Fill):',
    demoAdminBtn: '👑 व्यवस्थापक (Admin)',
    demoVolBtn: '🙋‍♂️ स्वयंसेवक (Volunteer)',
    loginBtn: 'प्रवेश करा (Sign In)',
    verifyingLogin: 'पडताळणी सुरू आहे...',
    backToHome: 'मुख्य पृष्ठावर परत जा',
  },

  en: {
    // Navigation & Common
    mandalName: 'Shree Ganesh Utsav Mandal',
    year: '2026',
    sacredMantra: '|| Om Gam Ganapataye Namah ||',
    home: 'Home',
    homeShort: 'Home',
    liveBoard: 'Live Dakshina Board',
    liveBoardShort: 'Live Board',
    volunteerDesk: 'Volunteer Desk',
    volunteerShort: 'Volunteer',
    adminDesk: 'Admin Portal',
    adminShort: 'Admin',
    login: 'Login',
    logout: 'Sign Out',
    ringBell: 'Bell',
    liveSync: 'Live Sync',
    bhakti: 'Devotion',
    footerShloka: '|| Morya Re Bappa Morya Re, Ganpati Bappa Morya, Mangal Murti Morya ||',
    trustNotice: 'Public Shree Ganesh Utsav Mandal Trust • Reg. No. MAH/2026/GANESH-1',
    langToggleLabel: 'Language / भाषा',

    // Hero Section
    heroBadge: 'Remover of Obstacles • Bestower of Success',
    heroTitle: '|| Shree Ganeshaya Namah ||',
    heroSubtitle: 'A warm welcome to Shree Ganesh Mahotsav! Seek the holy blessings of Lord Ganesha for joy, tranquility, and endless prosperity.',
    showerFlowers: '🌸 Shower Flowers (पुष्पवृष्टी)',
    lightDiya: '🪔 Light Sacred Diya (दीप प्रज्वलन)',
    diyaLit: '🪔 Sacred Diya is Lit',
    flowerChimeMsg: 'Flowers offered at Lord Ganesha\'s lotus feet! Bappa Morya! 🌸',
    diyaLitMsg: '|| Shubham Karoti Kalyanam || Sacred flame illuminated! 🪔',
    btnLiveBoard: 'View Live Dakshina Board ↗',
    btnVolunteerDesk: 'Volunteer Desk →',

    // Dakshina Board
    dakshinaTitle: 'Live Dakshina & Transparency Display Board',
    dakshinaSubtitle: 'Real-time broadcast sync for pandal televisions and large monitors',
    scanPayTitle: 'Scan & Pay Dakshina',
    scanPaySubtitle: 'Offer devotional contributions via Google Pay, PhonePe, Paytm, or BHIM',
    openMobileUpi: '📱 Open UPI App Directly on Mobile (GPay / PhonePe)',
    copyUpi: 'Copy',
    copiedUpi: 'Copied!',
    safeAccountNotice: 'Verified & Secure Mandal Trust Bank Account',
    exitFullscreen: 'Exit Fullscreen',
    enterFullscreen: 'Fullscreen (TV Mode)',

    // Volunteer Form & Desk
    volunteerDeskTitle: 'Volunteer Desk (देणगी नोंदणी)',
    volunteerDeskSub: 'Direct data-entry counter for cash and online donations',
    activeDuty: 'On-Duty Volunteer',
    sessionEntriesBadge: 'Shift Receipts',
    sessionTotalBadge: 'Shift Total (Cash)',
    recorderBadge: 'Logged By',
    formTitle: 'Donation Entry Form',
    formSub: 'Instantly record cash/UPI receipts (Syncs with MongoDB & Live TV)',
    paymentMethod: 'Payment Method',
    cash: 'Cash (रोख)',
    onlineUpi: 'Online (UPI / QR)',
    donorNameLabel: 'Donor / Family Name *',
    donorNamePlaceholder: 'e.g. Mr. Sachin Ramesh Tendulkar & Family',
    amountLabel: 'Donation Amount (₹) *',
    amountPlaceholder: 'e.g. 1100',
    sevaTypeLabel: 'Seva Category (सेवा प्रकार)',
    cityLabel: 'City / Locality (गाव/शहर)',
    cityPlaceholder: 'e.g. Dadar, Mumbai, Pune',
    phoneLabel: 'Mobile No. (for WhatsApp Receipt)',
    phonePlaceholder: '10-digit mobile number',
    submitDonationBtn: 'Generate Receipt & Log Donation',
    submitting: 'Saving to Database...',
    whatsappShareBtn: 'Share Receipt on WhatsApp',
    newReceiptBtn: 'Record New Donation',
    receiptGenerated: 'Receipt Generated (पावती तयार)',
    sessionHistoryTitle: 'Current Shift Session History (नोंदणी इतिहास)',
    receiptCol: 'Receipt #',
    donorCol: 'Donor Name',
    sevaCol: 'Seva Type',
    recorderCol: 'Volunteer',
    amountCol: 'Amount (₹)',
    timeCol: 'Time',
    noDonationsYet: 'No donations have been logged during this shift yet.',

    // Admin Page
    adminTitle: 'Admin Management Portal (व्यवस्थापक नियंत्रण)',
    adminSub: 'Add volunteers, manage role access & configure staff in MongoDB',
    openDeskBtn: 'Open Volunteer Desk',
    refreshBtn: 'Refresh',
    totalStaffBadge: 'Total Registered Staff',
    activeStaffBadge: 'Active Users',
    volunteersBadge: 'Authorized Volunteers',
    adminsBadge: 'System Administrators',
    addStaffTitle: 'Add New Member (नवीन सदस्य)',
    addStaffSub: 'Create an authorized volunteer or admin account',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'e.g. Sachin Ganesh Patil',
    usernameLabel: 'Username / Login ID *',
    usernamePlaceholder: 'e.g. sachin_p (lowercase letters)',
    passwordLabel: 'Password *',
    passwordPlaceholder: 'Minimum 4 characters',
    roleLabel: 'Role & Access Level *',
    roleVolunteer: 'Volunteer (Donation Counter)',
    roleAdmin: 'Administrator (Full Control)',
    addStaffBtn: 'Save User to MongoDB',
    directoryTitle: 'Staff Directory (सदस्य यादी)',
    searchStaffPlaceholder: 'Search by name, ID or mobile...',
    activeStatus: 'Active',
    inactiveStatus: 'Inactive',
    mainAdminNotice: 'Super Admin',

    // Login Page
    loginHeaderTitle: 'Portal Login (मंडळ कक्ष प्रवेश)',
    loginHeaderSub: 'Official access gateway for volunteers and administrators',
    demoAccountsTitle: 'Quick 1-Click Demo Accounts:',
    demoAdminBtn: '👑 Main Admin (व्यवस्थापक)',
    demoVolBtn: '🙋‍♂️ Volunteer (स्वयंसेवक)',
    loginBtn: 'Sign In (प्रवेश करा)',
    verifyingLogin: 'Authenticating credentials...',
    backToHome: 'Return to Home Page',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ganpati_language') || 'mr';
  });

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('ganpati_language', newLang);
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'mr' ? 'en' : 'mr';
    changeLanguage(nextLang);
  };

  const t = (key) => {
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key] !== undefined) {
      return TRANSLATIONS[lang][key];
    }
    // Fallback to Marathi or raw key
    return TRANSLATIONS.mr[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage: changeLanguage,
        toggleLanguage,
        t,
        isMarathi: lang === 'mr',
        isEnglish: lang === 'en',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
