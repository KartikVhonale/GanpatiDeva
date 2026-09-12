import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const CATEGORIES = [
  { category: "महाप्रसाद सेवा", icon: "🍛", badgeColor: "border-amber-400/40 bg-amber-500/20 text-amber-200", isPrasad: true },
  { category: "अखंड दीप & धूप सेवा", icon: "🪔", badgeColor: "border-orange-400/40 bg-orange-500/20 text-orange-200" },
  { category: "दैनिक संध्या महाआरती", icon: "🔔", badgeColor: "border-rose-400/40 bg-rose-500/20 text-rose-200", isAarti: true },
  { category: "मोदक नैवेद्य अर्पण", icon: "🍬", badgeColor: "border-amber-400/40 bg-amber-500/20 text-amber-200" },
  { category: "पुष्पवृष्टी व सजावट", icon: "🌸", badgeColor: "border-rose-400/40 bg-rose-500/20 text-rose-200" },
  { category: "सुवर्ण/रजत छत्र सेवा", icon: "👑", badgeColor: "border-red-400/40 bg-red-500/20 text-red-200" },
];

export function useDonations() {
  const [totalAmount, setTotalAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(500000);
  const [settings, setSettings] = useState({
    targetAmount: 500000,
    upiId: 'mandal.ganpati@upi',
    upiName: 'सार्वजनिक श्री गणेश उत्सव मंडळ',
    qrCodeUrl: '',
    qrCodeNote: 'स्कॅन करा आणि बाप्पाच्या चरणी सेवा अर्पण करा',
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [prasadCount, setPrasadCount] = useState(0);
  const [aartiSponsors, setAartiSponsors] = useState(0);
  const [cashTotal, setCashTotal] = useState(0);
  const [onlineTotal, setOnlineTotal] = useState(0);
  const [donors, setDonors] = useState([]);
  const [latestDonation, setLatestDonation] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Format incoming MongoDB / Backend document to match UI card schema
  const formatBackendDonor = useCallback((doc) => {
    const matchedCategory = CATEGORIES.find(c => c.category === doc.category) || CATEGORIES[0];
    return {
      id: doc._id || doc.id || `donor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: doc.name || 'Anonymous',
      city: doc.city || 'स्थानिक भाविक',
      amount: Number(doc.amount) || 0,
      category: doc.category || 'महाप्रसाद सेवा',
      recordedBy: doc.recordedBy || 'मंडळ स्वयंसेवक',
      paymentMethod: doc.paymentMethod || 'cash',
      time: doc.timestamp 
        ? new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        : 'आत्ताच (Just now)',
      blessing: doc.blessing || 'गणेश कृपेने सर्व मनोरथ पूर्ण होवोत',
      badgeColor: matchedCategory.badgeColor,
      icon: matchedCategory.icon,
    };
  }, []);

  // 1. Function to fetch all numbers of money and donor names from backend
  const fetchInitialDonations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/donations`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.totalVargani !== undefined) {
        setTotalAmount(Number(data.totalVargani) || 0);
      }
      if (data.targetAmount !== undefined) {
        setTargetAmount(Number(data.targetAmount) || 500000);
      }
      if (data.donorCount !== undefined) {
        setDonorCount(Number(data.donorCount) || 0);
      }
      if (data.prasadCount !== undefined) {
        setPrasadCount(Number(data.prasadCount) || 0);
      }
      if (data.aartiSponsors !== undefined) {
        setAartiSponsors(Number(data.aartiSponsors) || 0);
      }
      if (data.cashTotal !== undefined) {
        setCashTotal(Number(data.cashTotal) || 0);
      }
      if (data.onlineTotal !== undefined) {
        setOnlineTotal(Number(data.onlineTotal) || 0);
      }

      if (data.settings) {
        setSettings(data.settings);
        if (data.settings.targetAmount) {
          setTargetAmount(Number(data.settings.targetAmount));
        }
      }
      if (data.pendingRequestsCount !== undefined) {
        setPendingRequestsCount(Number(data.pendingRequestsCount));
      }

      // Extract all donors list from backend
      const donorList = Array.isArray(data.donors) && data.donors.length > 0
        ? data.donors
        : Array.isArray(data.allDonors) && data.allDonors.length > 0
        ? data.allDonors
        : Array.isArray(data.recentDonors)
        ? data.recentDonors
        : [];

      if (donorList.length > 0) {
        setDonors(donorList.map(formatBackendDonor));
      }
    } catch (err) {
      console.warn('Backend REST API fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formatBackendDonor]);

  // =========================================================================
  // REAL-TIME NODE.JS + SOCKET.IO BACKEND CONNECTION
  // =========================================================================
  useEffect(() => {
    let socket;

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

      // Listen for festival settings update
      socket.on('settings_updated', (updatedSettings) => {
        console.log('⚙️ Received live settings update:', updatedSettings);
        setSettings(updatedSettings);
        if (updatedSettings.targetAmount) {
          setTargetAmount(Number(updatedSettings.targetAmount));
        }
      });

      // Listen for stats updates (recalculations)
      socket.on('stats_updated', (stats) => {
        if (stats.targetAmount) setTargetAmount(Number(stats.targetAmount));
        if (stats.totalVargani !== undefined) setTotalAmount(stats.totalVargani);
        if (stats.pendingRequestsCount !== undefined) setPendingRequestsCount(stats.pendingRequestsCount);
      });

      // Listen for devotee online payment request creation
      socket.on('payment_request_created', (data) => {
        console.log('🔔 New payment verification request:', data);
        setPendingRequestsCount((prev) => prev + 1);
      });

      // 3. Listen for new_donation broadcast from backend
      socket.on('new_donation', (data) => {
        console.log(' Live donation received via Socket.io:', data);
        const rawDonation = data.donation || data;
        const formatted = formatBackendDonor(rawDonation);

        // Update all money and donor numbers from backend broadcast
        if (data.totalVargani !== undefined) {
          setTotalAmount(data.totalVargani);
        } else {
          setTotalAmount(prev => prev + formatted.amount);
        }

        if (data.targetAmount !== undefined) {
          setTargetAmount(Number(data.targetAmount));
        }

        if (data.pendingRequestsCount !== undefined) {
          setPendingRequestsCount(Number(data.pendingRequestsCount));
        }

        if (data.donorCount !== undefined) {
          setDonorCount(data.donorCount);
        } else {
          setDonorCount(prev => prev + 1);
        }

        if (data.prasadCount !== undefined) {
          setPrasadCount(data.prasadCount);
        } else if (formatted.category?.includes("महाप्रसाद")) {
          setPrasadCount(prev => prev + Math.max(1, Math.floor(formatted.amount / 50)));
        }

        if (data.aartiSponsors !== undefined) {
          setAartiSponsors(data.aartiSponsors);
        } else if (formatted.category?.includes("आरती")) {
          setAartiSponsors(prev => prev + 1);
        }

        if (data.cashTotal !== undefined) {
          setCashTotal(data.cashTotal);
        }
        if (data.onlineTotal !== undefined) {
          setOnlineTotal(data.onlineTotal);
        }

        setLatestDonation(formatted);

        // Prepend new donor to the full donors list
        setDonors(prev => {
          const exists = prev.some(d => d.id === formatted.id);
          if (exists) return prev;
          return [formatted, ...prev];
        });
      });

      // Listen for deleted donation event from backend (admin deletion)
      socket.on('donation_deleted', (data) => {
        console.log('🗑️ Donation deleted via Socket.io:', data);
        if (data.donationId) {
          setDonors((prev) => prev.filter((d) => String(d.id) !== String(data.donationId) && String(d._id) !== String(data.donationId)));
        }
        if (data.totalVargani !== undefined) setTotalAmount(Number(data.totalVargani));
        if (data.donorCount !== undefined) setDonorCount(Number(data.donorCount));
        if (data.prasadCount !== undefined) setPrasadCount(Number(data.prasadCount));
        if (data.aartiSponsors !== undefined) setAartiSponsors(Number(data.aartiSponsors));
        if (data.cashTotal !== undefined) setCashTotal(Number(data.cashTotal));
        if (data.onlineTotal !== undefined) setOnlineTotal(Number(data.onlineTotal));
      });
    } catch (err) {
      console.error('Socket.io connection error:', err);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [fetchInitialDonations, formatBackendDonor]);

  // Manual donation handler (calls backend POST)
  const addManualDonation = useCallback(async ({ name, city, amount, category, recordedBy, paymentMethod }, authToken) => {
    const matchedCategory = CATEGORIES.find(c => c.category === category) || CATEGORIES[0];
    const numericAmount = parseInt(amount, 10);
    const donorPayload = {
      name: name?.trim() || "Anonymous",
      city: city?.trim() || "स्थानिक भाविक",
      amount: numericAmount,
      category: matchedCategory.category,
      blessing: "गणेश कृपेने सर्व मनोरथ पूर्ण होवोत",
      recordedBy: recordedBy || 'मंडळ स्वयंसेवक',
      paymentMethod: paymentMethod || 'cash',
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
      const result = await res.json();
      return result;
    } catch (err) {
      console.warn('Backend POST failed, applying optimistic update:', err.message);
      const fallbackDonation = {
        id: `donor-${Date.now()}`,
        ...donorPayload,
        time: 'आत्ताच (Just now)',
        badgeColor: matchedCategory.badgeColor,
        icon: matchedCategory.icon,
      };
      setTotalAmount(prev => prev + numericAmount);
      setDonorCount(prev => prev + 1);
      setLatestDonation(fallbackDonation);
      setDonors(prev => [fallbackDonation, ...prev]);
    }
  }, []);

  // Devotee submits online payment verification request
  const submitPaymentRequest = useCallback(async (payload) => {
    const res = await fetch(`${BACKEND_URL}/api/donations/verify-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'पडताळणी विनंती पाठवण्यात त्रुटी आली');
    }
    return data;
  }, []);

  // Admin only: Delete a donation
  const deleteDonation = useCallback(async (donationId, authToken) => {
    if (!authToken) throw new Error('प्रशासक लॉगिन आवश्यक आहे (Admin login required)');
    const res = await fetch(`${BACKEND_URL}/api/admin/donations/${donationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'देणगी हटवण्यात अयशस्वी');
    }

    setDonors((prev) => prev.filter((d) => String(d.id) !== String(donationId) && String(d._id) !== String(donationId)));
    if (data.stats) {
      if (data.stats.totalVargani !== undefined) setTotalAmount(Number(data.stats.totalVargani));
      if (data.stats.donorCount !== undefined) setDonorCount(Number(data.stats.donorCount));
      if (data.stats.prasadCount !== undefined) setPrasadCount(Number(data.stats.prasadCount));
      if (data.stats.aartiSponsors !== undefined) setAartiSponsors(Number(data.stats.aartiSponsors));
      if (data.stats.cashTotal !== undefined) setCashTotal(Number(data.stats.cashTotal));
      if (data.stats.onlineTotal !== undefined) setOnlineTotal(Number(data.stats.onlineTotal));
    }
    return data;
  }, []);

  return {
    totalAmount,
    targetAmount,
    settings,
    pendingRequestsCount,
    donorCount,
    prasadCount,
    aartiSponsors,
    cashTotal,
    onlineTotal,
    donors,
    latestDonation,
    isConnected,
    isLoading,
    addManualDonation,
    submitPaymentRequest,
    deleteDonation,
    refetchDonations: fetchInitialDonations,
  };
}

export default useDonations;
