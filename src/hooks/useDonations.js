import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const INITIAL_DONORS = [
  {
    id: 'donor-1',
    name: "राजेश व अनिता देशपांडे",
    city: "दादर, मुंबई",
    amount: 25000,
    category: "महाप्रसाद सेवा",
    time: "५ मिनिटांपूर्वी",
    blessing: "सकुटुंब सहपरिवार सुख-समृद्धी",
    badgeColor: "border-amber-400/40 bg-amber-500/20 text-amber-200",
    icon: "🍛"
  },
  {
    id: 'donor-2',
    name: "समीर प्रकाश कदम",
    city: "पुणे",
    amount: 11000,
    category: "अखंड दीप & धूप सेवा",
    time: "१२ मिनिटांपूर्वी",
    blessing: "आरोग्य व दीर्घायुष्य लाभो",
    badgeColor: "border-orange-400/40 bg-orange-500/20 text-orange-200",
    icon: "🪔"
  },
  {
    id: 'donor-3',
    name: "डॉ. मिलिंद व स्नेहा साने",
    city: "ठाणे",
    amount: 51000,
    category: "सुवर्ण/रजत छत्र सेवा",
    time: "२५ मिनिटांपूर्वी",
    blessing: "सर्व विघ्नहर्ता कृपा राहो",
    badgeColor: "border-red-400/40 bg-red-500/20 text-red-200",
    icon: "👑"
  },
  {
    id: 'donor-4',
    name: "अमित जोशी आणि मित्रमंडळ",
    city: "गिरगाव, मुंबई",
    amount: 7500,
    category: "पुष्पवृष्टी व सजावट",
    time: "४० मिनिटांपूर्वी",
    blessing: "बाप्पाचे शुभाशीर्वाद सदैव",
    badgeColor: "border-rose-400/40 bg-rose-500/20 text-rose-200",
    icon: "🌸"
  },
  {
    id: 'donor-5',
    name: "श्रीमती सुनंदाताई वाघ",
    city: "नवी मुंबई",
    amount: 5100,
    category: "मोदक नैवेद्य अर्पण",
    time: "१ तासापूर्वी",
    blessing: "मंगलमूर्ती चरणी सेवा",
    badgeColor: "border-amber-400/40 bg-amber-500/20 text-amber-200",
    icon: "🍬"
  },
  {
    id: 'donor-6',
    name: "विक्रम रमेश पाटील",
    city: "कोल्हापूर",
    amount: 15000,
    category: "दैनिक संध्या महाआरती",
    time: "२ तासांपूर्वी",
    blessing: "कार्य सिद्धीस जावो",
    badgeColor: "border-orange-400/40 bg-orange-500/20 text-orange-200",
    icon: "🔔"
  }
];

const CATEGORIES = [
  { category: "महाप्रसाद सेवा", icon: "🍛", badgeColor: "border-amber-400/40 bg-amber-500/20 text-amber-200", isPrasad: true },
  { category: "अखंड दीप & धूप सेवा", icon: "🪔", badgeColor: "border-orange-400/40 bg-orange-500/20 text-orange-200" },
  { category: "दैनिक संध्या महाआरती", icon: "🔔", badgeColor: "border-rose-400/40 bg-rose-500/20 text-rose-200", isAarti: true },
  { category: "मोदक नैवेद्य अर्पण", icon: "🍬", badgeColor: "border-amber-400/40 bg-amber-500/20 text-amber-200" },
  { category: "पुष्पवृष्टी व सजावट", icon: "🌸", badgeColor: "border-rose-400/40 bg-rose-500/20 text-rose-200" },
  { category: "सुवर्ण/रजत छत्र सेवा", icon: "👑", badgeColor: "border-red-400/40 bg-red-500/20 text-red-200" },
];

const MAX_VISIBLE_DONORS = 10;

export function useDonations() {
  const [totalAmount, setTotalAmount] = useState(384500);
  const [targetAmount] = useState(500000);
  const [donorCount, setDonorCount] = useState(428);
  const [prasadCount, setPrasadCount] = useState(1250);
  const [aartiSponsors, setAartiSponsors] = useState(36);
  const [donors, setDonors] = useState(INITIAL_DONORS);
  const [latestDonation, setLatestDonation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Helper to push a donation locally
  const pushLocalDonation = useCallback((donationData) => {
    const newId = `donor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newDonation = {
      id: newId,
      time: "आत्ताच (Just now)",
      ...donationData,
    };

    setTotalAmount(prev => prev + newDonation.amount);
    setDonorCount(prev => prev + 1);
    setLatestDonation(newDonation);

    if (newDonation.category?.includes("महाप्रसाद")) {
      setPrasadCount(prev => prev + Math.max(1, Math.floor(newDonation.amount / 50)));
    }
    if (newDonation.category?.includes("आरती")) {
      setAartiSponsors(prev => prev + 1);
    }

    setDonors(prev => [newDonation, ...prev.slice(0, MAX_VISIBLE_DONORS - 1)]);
  }, []);

  // Format incoming MongoDB document to match UI card schema
  const formatBackendDonor = (doc) => ({
    id: doc._id || doc.id || `donor-${Date.now()}-${Math.random()}`,
    name: doc.name || 'Anonymous',
    city: doc.city || 'स्थानिक भाविक',
    amount: Number(doc.amount) || 0,
    category: doc.category || 'महाप्रसाद सेवा',
    time: doc.timestamp 
      ? new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : 'आत्ताच (Just now)',
    blessing: doc.blessing || 'गणेश कृपेने सर्व मनोरथ पूर्ण होवोत',
    badgeColor: 'border-amber-400/40 bg-amber-500/20 text-amber-200',
    icon: doc.category?.includes('महाप्रसाद') ? '🍛' : 
          doc.category?.includes('आरती') ? '🔔' :
          doc.category?.includes('मोदक') ? '🍬' : '🌺',
  });

  // =========================================================================
  // REAL-TIME NODE.JS + SOCKET.IO BACKEND CONNECTION
  // =========================================================================
  useEffect(() => {
    let socket;

    // 1. Initial REST API Fetch from http://localhost:5000/api/donations
    async function fetchInitialDonations() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/donations`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.totalVargani !== undefined && data.totalVargani > 0) {
          setTotalAmount(data.totalVargani);
        }
        if (data.donorCount !== undefined && data.donorCount > 0) {
          setDonorCount(data.donorCount);
        }
        if (Array.isArray(data.recentDonors) && data.recentDonors.length > 0) {
          setDonors(data.recentDonors.map(formatBackendDonor));
        }
      } catch (err) {
        console.warn('Backend REST API not reachable or starting up. Using default state:', err.message);
      }
    }

    fetchInitialDonations();

    // 2. Establish Socket.io connection to http://localhost:5000
    try {
      socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        timeout: 5000,
      });

      socket.on('connect', () => {
        console.log(' Connected to Socket.io backend at:', BACKEND_URL);
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from Socket.io backend');
        setIsConnected(false);
      });

      // 3. Listen for new_donation broadcast
      socket.on('new_donation', (data) => {
        console.log(' Live donation received via Socket.io:', data);
        const rawDonation = data.donation || data;
        const formatted = formatBackendDonor(rawDonation);

        // Update total collection from server or calculate increment
        if (data.totalVargani !== undefined) {
          setTotalAmount(data.totalVargani);
        } else if (data.updatedTotal !== undefined) {
          setTotalAmount(data.updatedTotal);
        } else {
          setTotalAmount(prev => prev + formatted.amount);
        }

        setDonorCount(prev => prev + 1);
        setLatestDonation(formatted);

        if (formatted.category?.includes("महाप्रसाद")) {
          setPrasadCount(prev => prev + Math.max(1, Math.floor(formatted.amount / 50)));
        }
        if (formatted.category?.includes("आरती")) {
          setAartiSponsors(prev => prev + 1);
        }

        // Prepend new donation to recent donors list
        setDonors(prev => [formatted, ...prev.slice(0, MAX_VISIBLE_DONORS - 1)]);
      });
    } catch (err) {
      console.error('Socket.io connection error:', err);
    }

    // 4. Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Manual donation handler (supports backend POST + local optimistic fallback)
  const addManualDonation = useCallback(async ({ name, city, amount, category, recordedBy }, authToken) => {
    const matchedCategory = CATEGORIES.find(c => c.category === category) || CATEGORIES[0];
    const numericAmount = parseInt(amount, 10);
    const donorPayload = {
      name: name?.trim() || "Anonymous",
      city: city?.trim() || "स्थानिक भाविक",
      amount: numericAmount,
      category: matchedCategory.category,
      blessing: "गणेश कृपेने सर्व मनोरथ पूर्ण होवोत",
      recordedBy: recordedBy || 'मंडळ स्वयंसेवक',
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${BACKEND_URL}/api/donations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(donorPayload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      // Note: socket.io will broadcast the event, but we can also update locally if needed
    } catch (err) {
      console.warn('Backend POST failed, applying optimistic local update:', err.message);
      pushLocalDonation({
        ...donorPayload,
        badgeColor: matchedCategory.badgeColor,
        icon: matchedCategory.icon,
      });
    }
  }, [pushLocalDonation]);

  return {
    totalAmount,
    targetAmount,
    donorCount,
    prasadCount,
    aartiSponsors,
    donors,
    latestDonation,
    isConnected,
    addManualDonation,
  };
}

export default useDonations;
