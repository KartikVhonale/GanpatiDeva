import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Music,
  Play,
  SkipForward,
  SkipBack,
  Shuffle,
  Heart,
  Share2,
  ExternalLink,
  PlusCircle,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Flame,
  User,
  MessageSquare,
  Check,
  Headphones,
  Bell,
  Tv,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { playTempleBell } from '../utils/audio';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Fallback curated songs (available instantly on first render before API responds)
const INITIAL_CURATED_SONGS = [
  // महाआरती व स्तोत्रे
  {
    id: 'curated-aarti-1',
    title: 'सुखकर्ता दुःखहर्ता (Sukhkarta Dukh Harta)',
    titleEn: 'Sukhkarta Dukh Harta - Traditional Aarti',
    singer: 'लता मंगेशकर (Lata Mangeshkar)',
    category: 'aarti',
    youtubeId: '8Mmsn84X2aU',
    duration: '4:22',
    isCurated: true,
    description: 'समर्थ रामदास स्वामी विरचित श्री गणेशाची अत्यंत पवित्र व भावपूर्ण मुख्य महाआरती.',
    likes: 124,
  },
  {
    id: 'curated-aarti-2',
    title: 'शेंदुर लाल चढायो (Shendur Lal Chadhayo)',
    titleEn: 'Shendur Lal Chadhayo - Classic Aarti',
    singer: 'रवींद्र साठे (Ravindra Sathe)',
    category: 'aarti',
    youtubeId: 'w6e2q4rEwZ8',
    duration: '3:45',
    isCurated: true,
    description: 'सिंदूर वंदना आणि अष्टविनायकांचे स्मरण करणारी मंगलमय आरती.',
    likes: 98,
  },
  {
    id: 'curated-aarti-3',
    title: 'घालीन लोटांगण वंदिन चरण (Ghalin Lotangan)',
    titleEn: 'Ghalin Lotangan Vandin Charan',
    singer: 'पारंपारिक मंत्रपुष्पांजली (Traditional)',
    category: 'aarti',
    youtubeId: 'X9mN5pZ4d3I',
    duration: '2:50',
    isCurated: true,
    description: 'आरतीची सांगता करणारी मन आणि आत्मा तृप्त करणारी पवित्र प्रार्थना.',
    likes: 76,
  },
  {
    id: 'curated-aarti-4',
    title: 'दुर्गे दुर्घट भारी (Durge Durgat Bhari)',
    titleEn: 'Durge Durgat Bhari - Devi Aarti',
    singer: 'अनुराधा पौडवाल (Anuradha Paudwal)',
    category: 'aarti',
    youtubeId: 'd4Bv3u7qX0o',
    duration: '4:15',
    isCurated: true,
    description: 'गणेशोत्सवात आरतीनंतर गायली जाणारी आदिमाया दुर्गेची जगप्रसिद्ध आरती.',
    likes: 65,
  },

  // आगमन व ढोल-ताशा
  {
    id: 'curated-aagman-1',
    title: 'देवा श्री गणेशा (Deva Shree Ganesha)',
    titleEn: 'Deva Shree Ganesha - Agneepath',
    singer: 'अजय गोगावले (Ajay-Atul)',
    category: 'aagman',
    youtubeId: 'o-0ygW-B_gI',
    duration: '5:56',
    isCurated: true,
    description: 'बाप्पाच्या आगमन मिरवणुकीत संपूर्ण अंगावर रोमांच उभे करणारे सुप्रसिद्ध गीत.',
    likes: 245,
  },
  {
    id: 'curated-aagman-2',
    title: 'मोरया रे (Morya Re - Bappa Morya Re)',
    titleEn: 'Morya Re - Shankar Mahadevan (Don)',
    singer: 'शंकर महादेवन (Shankar Mahadevan)',
    category: 'aagman',
    youtubeId: '_H4m0j_w_Xg',
    duration: '5:50',
    isCurated: true,
    description: 'मुंबई व महाराष्ट्रातील गणेश मंडपांची ओळख बनलेला जल्लोषमय ट्रॅक.',
    likes: 198,
  },
  {
    id: 'curated-aagman-3',
    title: 'आला रे आला गणपती आला (Aala Re Aala Ganesha)',
    titleEn: 'Aala Re Aala Ganesha - Daddy',
    singer: 'वाजिद, साजिद (Sajid-Wajid)',
    category: 'aagman',
    youtubeId: 's0-PzC_sK90',
    duration: '4:35',
    isCurated: true,
    description: 'लालबाग व गिरगावच्या बाप्पाच्या आगमनाची थरारक अनुभूती देणारे गाणे.',
    likes: 142,
  },
  {
    id: 'curated-aagman-4',
    title: 'पुणेरी व नाशिक ढोल-ताशा जुगलबंदी (Dhol Tasha Beats)',
    titleEn: 'Puneri & Nashik Dhol Tasha Jugalbandi',
    singer: 'पारंपारिक ढोल ताशा पथक (Dhol Tasha Pathak)',
    category: 'aagman',
    youtubeId: 'zN18K9Pj_dE',
    duration: '6:12',
    isCurated: true,
    description: 'टाळ, मृदुंग आणि ढोल-ताशांच्या कडक आवाजात बाप्पाचे जंगी स्वागत!',
    likes: 167,
  },
  {
    id: 'curated-aagman-5',
    title: 'बाप्पा मोरया रे (Bappa Morya Re - Pralhad Shinde)',
    titleEn: 'Bappa Morya Re - Pralhad Shinde',
    singer: 'प्रल्हाद शिंदे (Pralhad Shinde)',
    category: 'aagman',
    youtubeId: 'oUqV9B_uMbc',
    duration: '5:10',
    isCurated: true,
    description: 'महाराष्ट्राच्या खेड्यापाड्यात आणि शहरात गुंजणारा लोकमान्य भक्ती आवाज.',
    likes: 215,
  },

  // भावपूर्ण भक्तीगीते
  {
    id: 'curated-bhajan-1',
    title: 'प्रथम तुला वंदितो (Pratham Tula Vandito)',
    titleEn: 'Pratham Tula Vandito - Ashtavinayak',
    singer: 'अनुराधा पौडवाल, सुरेश वाडकर',
    category: 'bhajan',
    youtubeId: 'P7p9lE0U36A',
    duration: '6:24',
    isCurated: true,
    description: 'कोणत्याही शुभकार्याची मंगल सुरुवात करणारे महाराष्ट्राचे अमर गणेशगीत.',
    likes: 280,
  },
  {
    id: 'curated-bhajan-2',
    title: 'तुझ मागतो मी आता (Tujh Magato Mi Aata)',
    titleEn: 'Tujh Magato Mi Aata - Lata Mangeshkar',
    singer: 'लता मंगेशकर, हृदयनाथ मंगेशकर',
    category: 'bhajan',
    youtubeId: 'hK0Z7mY5X5Q',
    duration: '4:48',
    isCurated: true,
    description: 'संत ज्ञानेश्वर महाराज रचित आणि लतादीदींच्या मधुर स्वरातील भावपूर्ण प्रार्थना.',
    likes: 182,
  },
  {
    id: 'curated-bhajan-3',
    title: 'ओंकार स्वरूपा (Omkar Swarupa)',
    titleEn: 'Omkar Swarupa - Suresh Wadkar',
    singer: 'सुरेश वाडकर (Suresh Wadkar)',
    category: 'bhajan',
    youtubeId: 'd4Bv3u7qX0o',
    duration: '7:15',
    isCurated: true,
    description: 'सद्गुरू आणि विघ्नहर्त्याचे ध्यान करणारा अध्यात्मिक स्वरानुभव.',
    likes: 165,
  },
  {
    id: 'curated-bhajan-4',
    title: 'उठा उठा हो सकळीक (Utha Utha Ho Sakalika)',
    titleEn: 'Utha Utha Ho Sakalika - Prabhat Bhupali',
    singer: 'पं. भीमसेन जोशी (Bhimsen Joshi)',
    category: 'bhajan',
    youtubeId: 'Wv7L9g9z_B0',
    duration: '5:02',
    isCurated: true,
    description: 'पहाटेच्या मंगल वेळी बाप्पाला जागे करणारी सुरेल भूपाळी.',
    likes: 110,
  },
  {
    id: 'curated-bhajan-5',
    title: 'तू सुखकर्ता तू दुःखहर्ता (Tu Sukhkarta Tu Dukh Harta)',
    titleEn: 'Tu Sukhkarta Tu Dukh Harta - Hariharan',
    singer: 'हरिहरन (Hariharan)',
    category: 'bhajan',
    youtubeId: 'K1F49uK8a3M',
    duration: '5:32',
    isCurated: true,
    description: 'भक्तांच्या मनोकामना पूर्ण करणारी शांत आणि प्रभावी गणेश वंदना.',
    likes: 118,
  },

  // आधुनिक व जल्लोष हिट्स
  {
    id: 'curated-modern-1',
    title: 'श्री गणेशाय धीमहि (Shree Ganeshay Dheemahi)',
    titleEn: 'Shree Ganeshay Dheemahi - Shankar Mahadevan',
    singer: 'शंकर महादेवन (Shankar Mahadevan)',
    category: 'modern',
    youtubeId: 'h18T3a4_JvU',
    duration: '6:18',
    isCurated: true,
    description: 'एकदंताय वक्रतुण्डाय गौरीतनयाय धीमहि - जगप्रसिद्ध आधुनिक स्तोत्र संगीत.',
    likes: 295,
  },
  {
    id: 'curated-modern-2',
    title: 'गजानना (Gajanana - Bajirao Mastani)',
    titleEn: 'Gajanana - Sukhwinder Singh',
    singer: 'सुखविंदर सिंग (Sukhwinder Singh)',
    category: 'modern',
    youtubeId: 'f8YJ0h4mQ1g',
    duration: '3:34',
    isCurated: true,
    description: 'श्रीमंत बाजीराव पेशवे यांच्या काळातील भव्य आणि ओजस्वी गणेश महाआरती.',
    likes: 140,
  },
  {
    id: 'curated-modern-3',
    title: 'विघ्नहर्ता (Vighnaharta - Antim)',
    titleEn: 'Vighnaharta - Ajay Gogavale',
    singer: 'अजय गोगावले (Ajay Gogavale)',
    category: 'modern',
    youtubeId: '2JpS1c068_c',
    duration: '4:18',
    isCurated: true,
    description: 'हाय-एनर्जी मॉडर्न गणेश उत्सव गाणे.',
    likes: 125,
  },
  {
    id: 'curated-modern-4',
    title: 'बप्पा (Bappa - Banjo)',
    titleEn: 'Bappa - Vishal Dadlani (Banjo)',
    singer: 'विशाल दादलानी (Vishal Dadlani)',
    category: 'modern',
    youtubeId: 'U0H_L7hC0dE',
    duration: '4:38',
    isCurated: true,
    description: 'तरुणाईच्या आवडीचे रॉक व ढोल ताशाचे अप्रतिम मिश्रण.',
    likes: 104,
  },
  {
    id: 'curated-modern-5',
    title: 'सुनो गणपती बाप्पा मोरया (Suno Ganpati Bappa Morya)',
    titleEn: 'Suno Ganpati Bappa Morya - Judwaa 2',
    singer: 'अमित मिश्रा (Amit Mishra)',
    category: 'modern',
    youtubeId: 'kS6c4qG8hM0',
    duration: '4:40',
    isCurated: true,
    description: 'गणेशोत्सवाच्या मंचावर सादर होणारे तरुणाईचे आवडीचे गाणे.',
    likes: 92,
  },

  // भावुक विसर्जन गीते
  {
    id: 'curated-visarjan-1',
    title: 'बाप्पा निघाले गावाला (Bappa Nighale Gaavala)',
    titleEn: 'Bappa Nighale Gaavala - Visarjan Special',
    singer: 'अनंत पांचाळ (Anant Panchal)',
    category: 'visarjan',
    youtubeId: 'BfC8w-ZfE7M',
    duration: '6:45',
    isCurated: true,
    description: 'अनंत चतुर्दशीच्या दिवशी डोळ्यात अश्रू आणणारे भावुक विसर्जन गीत.',
    likes: 210,
  },
  {
    id: 'curated-visarjan-2',
    title: 'मोरया रे बाप्पा मोरया रे पुढच्या वर्षी लवकर या',
    titleEn: 'Pudhchya Varshi Lavkar Ya - Visarjan',
    singer: 'अजय-अतुल / पारंपारिक',
    category: 'visarjan',
    youtubeId: '5n2F6b7Qf7k',
    duration: '5:22',
    isCurated: true,
    description: 'निरोप देताना सर्वांच्या तोंडी असणारा लाडका जयघोष.',
    likes: 188,
  },
];

// Helper to extract YouTube video ID from URL
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return '';
  const trimmed = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : '';
}

export default function MusicPage() {
  const { t } = useLanguage();

  // State
  const [songs, setSongs] = useState(INITIAL_CURATED_SONGS);
  const [activeSong, setActiveSong] = useState(INITIAL_CURATED_SONGS[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedSongIds, setLikedSongIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ganpati_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Suggest Song Modal State
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({
    title: '',
    singer: '',
    category: 'aagman',
    youtubeUrl: '',
    suggestedBy: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const playerRef = useRef(null);

  // Fetch all songs (Curated + Approved Devotee Suggestions) from backend
  const fetchSongs = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/music/songs`);
      if (res.ok) {
        const data = await res.json();
        if (data.all && Array.isArray(data.all) && data.all.length > 0) {
          setSongs(data.all);
        }
      }
    } catch (err) {
      console.warn('Using initial curated songs fallback:', err.message);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  // Save likes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ganpati_liked_songs', JSON.stringify(likedSongIds));
    } catch (_) {}
  }, [likedSongIds]);

  // Show auto-dismissing toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Categories configuration with icons and labels
  const categories = useMemo(() => [
    { id: 'all', label: t('catMusicAll'), icon: Music, color: 'from-amber-500 to-orange-600' },
    { id: 'aarti', label: t('catMusicAarti'), icon: Bell, color: 'from-yellow-500 to-amber-600' },
    { id: 'aagman', label: t('catMusicAagman'), icon: Flame, color: 'from-orange-500 to-red-600' },
    { id: 'bhajan', label: t('catMusicBhajan'), icon: Headphones, color: 'from-emerald-500 to-teal-700' },
    { id: 'modern', label: t('catMusicModern'), icon: Radio, color: 'from-purple-500 to-pink-600' },
    { id: 'visarjan', label: t('catMusicVisarjan'), icon: Sparkles, color: 'from-blue-500 to-cyan-600' },
    { id: 'suggestions', label: t('catMusicSuggestions'), icon: User, color: 'from-rose-500 to-red-700' },
  ], [t]);

  // Filtered songs based on category and search query
  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const matchesCategory =
        activeCategory === 'all'
          ? true
          : activeCategory === 'suggestions'
          ? song.isSuggestion === true
          : song.category === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        song.title.toLowerCase().includes(q) ||
        (song.titleEn && song.titleEn.toLowerCase().includes(q)) ||
        (song.singer && song.singer.toLowerCase().includes(q)) ||
        (song.suggestedBy && song.suggestedBy.toLowerCase().includes(q)) ||
        (song.description && song.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [songs, activeCategory, searchQuery]);

  // Play a specific song
  const handleSelectSong = (song) => {
    setActiveSong(song);
    playTempleBell();
    // Smoothly scroll to player on mobile
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Next / Previous song
  const handleNextSong = () => {
    const currentIndex = songs.findIndex((s) => s.id === activeSong.id);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % songs.length;
      setActiveSong(songs[nextIndex]);
    }
  };

  const handlePrevSong = () => {
    const currentIndex = songs.findIndex((s) => s.id === activeSong.id);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
      setActiveSong(songs[prevIndex]);
    }
  };

  const handleShuffle = () => {
    if (songs.length <= 1) return;
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * songs.length);
    } while (songs[randomIndex].id === activeSong.id);
    setActiveSong(songs[randomIndex]);
    showToast('🎲 यादृच्छिक गाणे सुरू झाले!');
  };

  // Handle like song
  const handleLike = async (e, song) => {
    e.stopPropagation();
    const songId = song.id;
    const isAlreadyLiked = likedSongIds.includes(songId);

    // Optimistically update
    setLikedSongIds((prev) =>
      isAlreadyLiked ? prev.filter((id) => id !== songId) : [...prev, songId]
    );

    setSongs((prev) =>
      prev.map((s) =>
        s.id === songId
          ? { ...s, likes: (s.likes || 0) + (isAlreadyLiked ? -1 : 1) }
          : s
      )
    );

    if (activeSong && activeSong.id === songId) {
      setActiveSong((prev) => ({
        ...prev,
        likes: (prev.likes || 0) + (isAlreadyLiked ? -1 : 1),
      }));
    }

    if (!isAlreadyLiked) {
      try {
        await fetch(`${BACKEND_URL}/api/music/like/${songId}`, { method: 'POST' });
      } catch (_) {}
    }
  };

  // Share song
  const handleShare = () => {
    const text = `श्री बाल गणेश मंडळ धानोरा बु. वर हे बाप्पाचे गाणे ऐका: "${activeSong.title}"\nhttps://www.youtube.com/watch?v=${activeSong.youtubeId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      showToast(t('songShared'));
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Suggest Song submission
  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!suggestForm.title.trim()) {
      setSubmitError('कृपया गाण्याचे नाव प्रविष्ट करा (Song title required)');
      return;
    }

    const extractedId = extractYouTubeId(suggestForm.youtubeUrl);
    if (!extractedId) {
      setSubmitError('कृपया वैध YouTube व्हिडिओ लिंक किंवा 11-अक्षरी Video ID टाका');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: suggestForm.title.trim(),
        singer: suggestForm.singer.trim(),
        category: suggestForm.category,
        youtubeUrl: suggestForm.youtubeUrl.trim(),
        youtubeId: extractedId,
        suggestedBy: suggestForm.suggestedBy.trim() || 'भाविक',
        phone: suggestForm.phone.trim(),
        message: suggestForm.message.trim(),
      };

      let newSong;
      try {
        const res = await fetch(`${BACKEND_URL}/api/music/suggest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          newSong = {
            id: data.suggestion._id || data.suggestion.id,
            title: data.suggestion.title,
            titleEn: data.suggestion.title,
            singer: data.suggestion.singer || 'सुचवलेले गाणे',
            category: data.suggestion.category,
            youtubeId: data.suggestion.youtubeId,
            duration: 'Play Now',
            isCurated: false,
            isSuggestion: true,
            suggestedBy: data.suggestion.suggestedBy,
            message: data.suggestion.message,
            likes: 1,
          };
        }
      } catch (networkErr) {
        console.warn('Backend unavailable, using local suggestion mode:', networkErr);
      }

      // If backend failed or offline, construct local suggestion object
      if (!newSong) {
        newSong = {
          id: `local-suggest-${Math.random().toString(36).slice(2, 9)}`,
          title: payload.title,
          titleEn: payload.title,
          singer: payload.singer || 'सुचवलेले गाणे',
          category: payload.category,
          youtubeId: extractedId,
          duration: 'Play Now',
          isCurated: false,
          isSuggestion: true,
          suggestedBy: payload.suggestedBy,
          message: payload.message,
          likes: 1,
        };
      }

      // Add to songs state at the top
      setSongs((prev) => [newSong, ...prev]);
      setActiveSong(newSong);
      setIsSuggestModalOpen(false);
      setSuggestForm({
        title: '',
        singer: '',
        category: 'aagman',
        youtubeUrl: '',
        suggestedBy: '',
        phone: '',
        message: '',
      });

      playTempleBell();
      showToast(t('songSubmittedSuccess'));

      // Smooth scroll to player
      if (playerRef.current) {
        playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      setSubmitError(err.message || 'गाणे सुचवताना त्रुटी आली');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview YouTube ID for modal
  const previewModalYoutubeId = useMemo(() => {
    return extractYouTubeId(suggestForm.youtubeUrl);
  }, [suggestForm.youtubeUrl]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-2xl border border-amber-400/60 bg-gradient-to-r from-orange-950 via-amber-950 to-red-950 px-5 py-3 text-amber-200 shadow-2xl backdrop-blur-xl"
          >
            <Sparkles className="h-5 w-5 text-amber-400 animate-spin" />
            <span className="text-sm font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* PAGE HEADER & HERO BANNER                                 */}
      {/* ========================================================= */}
      <header className="relative rounded-3xl border border-amber-500/30 bg-gradient-to-br from-orange-950/80 via-red-950/70 to-black/90 p-5 sm:p-8 backdrop-blur-2xl shadow-[0_10px_35px_rgba(234,88,12,0.25)] overflow-hidden">
        {/* Festive background accents */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/20 to-red-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-orange-600/15 to-amber-400/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              <span>{t('sacredMantra')}</span>
              <span className="text-orange-400">•</span>
              <span>{t('mandalName')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400">
                {t('musicTitle')}
              </span>
              <span className="text-2xl sm:text-3xl">🪔</span>
            </h1>

            <p className="text-xs sm:text-sm text-orange-200/80 max-w-2xl">
              {t('musicSubtitle')}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                playTempleBell();
                setIsSuggestModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95 transition-all border border-amber-300/40 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{t('suggestSongBtn')}</span>
            </button>

            <Link
              to="/dakshina"
              className="flex items-center gap-2 rounded-2xl border border-amber-500/35 bg-orange-950/60 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-amber-300 hover:bg-orange-900/60 transition-all"
            >
              <Tv className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">{t('liveBoard')}</span>
              <span className="sm:hidden">{t('liveBoardShort')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* THEATER MODE / NOW PLAYING YOUTUBE VIDEO PLAYER           */}
      {/* ========================================================= */}
      <section ref={playerRef} className="space-y-4">
        <div className="rounded-3xl border border-amber-500/35 bg-black/80 p-3 sm:p-5 backdrop-blur-2xl shadow-[0_15px_45px_rgba(234,88,12,0.3)]">
          {/* Top Status Bar of Player */}
          <div className="flex items-center justify-between gap-2 pb-3 px-1 border-b border-amber-500/20 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                {t('nowPlaying')}
              </span>
              {activeSong.isSuggestion && (
                <span className="rounded-full bg-rose-500/20 border border-rose-400/40 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  {t('catMusicSuggestions')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                title="Shuffle / Random"
                className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-orange-950/40 px-2.5 py-1 text-[11px] font-bold text-orange-200 hover:text-white transition-all cursor-pointer"
              >
                <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
              <button
                onClick={handleShare}
                title="Share Song"
                className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-orange-950/40 px-2.5 py-1 text-[11px] font-bold text-orange-200 hover:text-white transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-amber-400" />}
                <span className="hidden sm:inline">{copiedLink ? 'Copied' : t('shareSong')}</span>
              </button>
            </div>
          </div>

          {/* YouTube Responsive Video Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-2xl">
            {activeSong.youtubeId ? (
              <iframe
                key={activeSong.youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${activeSong.youtubeId}?autoplay=1&rel=0&enablejsapi=1`}
                title={activeSong.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/90 text-amber-300">
                <AlertCircle className="h-8 w-8" />
                <span className="ml-2 font-bold">व्हिडिओ उपलब्ध नाही</span>
              </div>
            )}
          </div>

          {/* Player Metadata & Control Row */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
                  {activeSong.title}
                </h2>
                <span className="rounded-md bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black text-amber-300 shrink-0 uppercase">
                  {activeSong.category}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-orange-200/80 flex-wrap">
                <span className="font-semibold text-amber-400">{activeSong.singer || 'मंडळ भक्ती संगीत'}</span>
                <span>•</span>
                <span>{activeSong.duration || 'Special Track'}</span>
                {activeSong.suggestedBy && (
                  <>
                    <span>•</span>
                    <span className="text-rose-300 font-bold flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {t('suggestedByDevotee')} {activeSong.suggestedBy}
                    </span>
                  </>
                )}
              </div>

              {activeSong.message && (
                <p className="text-xs italic text-orange-200/70 pt-0.5 flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3 text-amber-400 shrink-0" />
                  "{activeSong.message}"
                </p>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevSong}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-orange-950/50 text-amber-300 hover:bg-orange-900/60 transition-all cursor-pointer"
                title="मागील गाणे (Previous)"
              >
                <SkipBack className="h-4 w-4" />
              </button>

              <button
                onClick={handleNextSong}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-orange-950/50 text-amber-300 hover:bg-orange-900/60 transition-all cursor-pointer"
                title="पुढील गाणे (Next)"
              >
                <SkipForward className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => handleLike(e, activeSong)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                  likedSongIds.includes(activeSong.id)
                    ? 'border-red-500/50 bg-red-600/25 text-red-300 shadow-md shadow-red-600/30'
                    : 'border-amber-500/30 bg-orange-950/50 text-orange-200 hover:text-white'
                }`}
              >
                <Heart
                  className={`h-4 w-4 ${
                    likedSongIds.includes(activeSong.id) ? 'fill-red-500 text-red-500' : ''
                  }`}
                />
                <span>{activeSong.likes || 0}</span>
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${activeSong.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/50 px-3 py-2 text-xs font-bold text-red-200 transition-all cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('openInYoutube')}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* CATEGORIES FILTER BAR & SEARCH INPUT                      */}
      {/* ========================================================= */}
      <section className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            const count =
              cat.id === 'all'
                ? songs.length
                : cat.id === 'suggestions'
                ? songs.filter((s) => s.isSuggestion).length
                : songs.filter((s) => s.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  playTempleBell();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-orange-600/35 border border-amber-300 scale-105'
                    : 'border border-amber-500/25 bg-orange-950/40 text-orange-200/80 hover:bg-orange-900/40 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    isActive ? 'bg-black/40 text-amber-200' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-300/70" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchSongsPlaceholder')}
            className="w-full rounded-2xl border border-amber-500/30 bg-orange-950/40 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-white placeholder-orange-300/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-orange-300/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SONGS GRID (PLAYABLE CARDS)                               */}
      {/* ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between text-xs text-orange-200/70 px-1 font-bold">
          <span>
            {filteredSongs.length} {t('music')}
          </span>
          <span>{t('mandalName')}</span>
        </div>

        {filteredSongs.length === 0 ? (
          <div className="rounded-3xl border border-amber-500/20 bg-orange-950/20 p-12 text-center backdrop-blur-xl">
            <Music className="mx-auto h-12 w-12 text-orange-400/40 mb-3" />
            <p className="font-bold text-orange-200">{t('noSongsFound')}</p>
            <p className="text-xs text-orange-200/60 mt-1">
              आपले आवडते गाणे मंडळाला सुचवण्यासाठी खालील बटणावर क्लिक करा:
            </p>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{t('suggestSongBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSongs.map((song) => {
              const isSelected = activeSong && activeSong.id === song.id;
              const isLiked = likedSongIds.includes(song.id);

              return (
                <motion.div
                  key={song.id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleSelectSong(song)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                    isSelected
                      ? 'border-amber-400 bg-gradient-to-b from-orange-950/90 via-red-950/80 to-black/95 shadow-[0_8px_30px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/50'
                      : 'border-amber-500/25 bg-orange-950/30 hover:border-amber-400/50 hover:bg-orange-950/50'
                  }`}
                >
                  {/* Thumbnail Banner with YouTube HQ preview image */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                    <img
                      src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                      alt={song.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

                    {/* Centered Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black scale-110'
                            : 'bg-black/60 text-white group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black'
                        }`}
                      >
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Playing indicator badge */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-red-600/90 border border-red-400 px-2.5 py-0.5 text-[10px] font-black text-white shadow-md">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                        <span>{t('nowPlaying')}</span>
                      </div>
                    )}

                    {/* Duration badge */}
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-300">
                      {song.duration || 'Audio'}
                    </span>

                    {/* Suggestion badge */}
                    {song.isSuggestion && (
                      <span className="absolute top-2 right-2 rounded-full bg-rose-600/90 border border-rose-400/50 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                        👤 {song.suggestedBy || 'भाविक'}
                      </span>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {song.title}
                        </h3>
                      </div>

                      <p className="text-xs text-orange-200/70 line-clamp-1 mt-0.5 font-medium">
                        {song.singer || 'श्री गणेश भक्ती'}
                      </p>

                      {song.message && (
                        <p className="text-[11px] text-amber-300/80 italic line-clamp-1 mt-1">
                          "{song.message}"
                        </p>
                      )}
                    </div>

                    {/* Bottom Metadata & Like Button */}
                    <div className="pt-2 border-t border-amber-500/15 flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-400/20">
                        {song.category}
                      </span>

                      <button
                        onClick={(e) => handleLike(e, song)}
                        className={`flex items-center gap-1 rounded-lg px-2 py-1 transition-all cursor-pointer ${
                          isLiked
                            ? 'text-red-400 font-bold bg-red-500/15'
                            : 'text-orange-200/60 hover:text-white hover:bg-orange-950/40'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span className="text-[11px]">{song.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SUGGEST A SONG MODAL (भाविकांसाठी गाणे सुचवा फॉर्म)        */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isSuggestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl border border-amber-500/40 bg-gradient-to-b from-orange-950 via-stone-950 to-black p-5 sm:p-7 shadow-[0_20px_60px_rgba(234,88,12,0.4)] space-y-4 my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSuggestModalOpen(false)}
                className="absolute top-4 right-4 rounded-full border border-amber-500/30 bg-orange-950/60 p-1.5 text-orange-200 hover:text-white hover:bg-orange-900/60 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Music className="h-4 w-4" />
                  <span>{t('mandalName')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {t('suggestSongTitle')}
                </h3>
                <p className="text-xs text-orange-200/70">
                  {t('suggestSongSubtitle')}
                </p>
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSuggestSubmit} className="space-y-3.5">
                {/* Song Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-200">
                    {t('songTitleLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestForm.title}
                    onChange={(e) =>
                      setSuggestForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder={t('songTitlePlaceholder')}
                    className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Singer & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-200">
                      {t('singerLabel')}
                    </label>
                    <input
                      type="text"
                      value={suggestForm.singer}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, singer: e.target.value }))
                      }
                      placeholder={t('singerPlaceholder')}
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-200">
                      {t('songCategoryLabel')}
                    </label>
                    <select
                      value={suggestForm.category}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950 px-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="aagman">आगमन व ढोल-ताशा (Aagman)</option>
                      <option value="aarti">महाआरती व स्तोत्रे (Aarti)</option>
                      <option value="bhajan">भावपूर्ण भक्तीगीते (Bhajan)</option>
                      <option value="modern">आधुनिक व जल्लोष हिट्स (Modern)</option>
                      <option value="visarjan">भावुक विसर्जन गीते (Visarjan)</option>
                    </select>
                  </div>
                </div>

                {/* YouTube Link / ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-200">
                    {t('youtubeUrlLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={suggestForm.youtubeUrl}
                    onChange={(e) =>
                      setSuggestForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))
                    }
                    placeholder={t('youtubeUrlPlaceholder')}
                    className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="text-[10px] text-orange-200/60">
                    उदा. https://youtu.be/o-0ygW-B_gI किंवा https://www.youtube.com/watch?v=o-0ygW-B_gI
                  </p>
                </div>

                {/* Live YouTube Preview Box */}
                {previewModalYoutubeId && (
                  <div className="rounded-2xl border border-amber-500/30 bg-black/60 p-2.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>YouTube व्हिडिओ सापडला (Live Preview):</span>
                    </div>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-amber-500/20">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${previewModalYoutubeId}?rel=0`}
                        title="Preview"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                )}

                {/* Suggested By & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-200">
                      {t('suggestedByLabel')}
                    </label>
                    <input
                      type="text"
                      value={suggestForm.suggestedBy}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, suggestedBy: e.target.value }))
                      }
                      placeholder={t('suggestedByPlaceholder')}
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-200">
                      {t('phone')} (ऐच्छिक / Optional)
                    </label>
                    <input
                      type="tel"
                      value={suggestForm.phone}
                      onChange={(e) =>
                        setSuggestForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="उदा. 9822******"
                      className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-200">
                    {t('messageLabel')}
                  </label>
                  <textarea
                    rows={2}
                    value={suggestForm.message}
                    onChange={(e) =>
                      setSuggestForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder={t('messagePlaceholder')}
                    className="w-full rounded-xl border border-amber-500/30 bg-orange-950/50 px-3.5 py-2 text-xs sm:text-sm text-white placeholder-orange-300/35 focus:border-amber-400 focus:outline-none"
                  />
                </div>

                {/* Submit CTA */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsSuggestModalOpen(false)}
                    className="rounded-xl border border-amber-500/30 bg-orange-950/40 px-4 py-2 text-xs font-bold text-orange-200 hover:text-white transition-all cursor-pointer"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-orange-600/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{isSubmitting ? t('submittingSong') : t('submitSongBtn')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
