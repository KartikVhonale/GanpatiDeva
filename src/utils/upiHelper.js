import QRCode from 'qrcode';

/**
 * NPCI UPI Specification Helper
 * Generates official NPCI-compliant UPI deep links and QR codes.
 * 
 * Critical NPCI Compliance Rules:
 * 1. 'pn' (Payee Name) MUST contain only ASCII alphanumeric characters & spaces (max 99 chars).
 *    Using Unicode / Devanagari characters in 'pn' or 'tn' triggers parsing errors in bank switches
 *    (e.g., GPay, PhonePe, Slice, SBM) resulting in "Maximum limit exceeded" / "Invalid merchant".
 * 2. 'pa' (Payee Address / VPA) must be lowercased and clean (e.g., '8484844728@slc').
 * 3. 'cu' MUST be 'INR'.
 * 4. P2P accounts should NOT include merchant parameters like 'mc' or 'mode=02', which cause
 *    banks to enforce zero-limit merchant restrictions on individual accounts.
 */

// Sanitizes payee name to strictly compliant ASCII characters
export function sanitizePayeeName(name, vpa = '') {
  const cleanVpa = String(vpa || '').toLowerCase().trim();
  // If the VPA is the primary admin VPA, default to registered KYC bank name 'kartik'
  if (cleanVpa === '8484844728@slc' || !name || typeof name !== 'string') {
    return 'kartik';
  }
  const asciiClean = name.replace(/[^\x20-\x7E]/g, '').trim();
  if (asciiClean.length >= 2 && !asciiClean.toLowerCase().includes('mandal')) {
    return asciiClean.slice(0, 50);
  }
  return 'kartik';
}

/**
 * Builds an official NPCI-compliant UPI payment URL matching:
 * upi://pay?cu=INR&pa=8484844728@slc&pn=kartik&tn=&am=501.00
 * 
 * @param {string} upiId - Payee VPA (e.g. '8484844728@slc')
 * @param {object} options - { name, note, amount, payeeName }
 * @param {string} scheme - 'upi'
 * @returns {string} - NPCI standard URI
 */
export function buildOfficialUpiUrl(upiId, options = {}, scheme = 'upi') {
  const cleanVpa = String(upiId || '8484844728@slc').toLowerCase().trim();
  const payeeName = options.payeeName || (cleanVpa === '8484844728@slc' ? 'kartik' : sanitizePayeeName(options.name, cleanVpa));
  const rawNote = options.note !== undefined 
    ? options.note.replace(/[^\x20-\x7E]/g, '').trim() 
    : 'ganesh seva';

  // Order strictly matching user verified format: cu=INR&pa=8484844728@slc&pn=kartik&tn=&am=501.00
  const queryParts = [
    'cu=INR',
    `pa=${cleanVpa}`,
    `pn=${encodeURIComponent(payeeName)}`,
    `tn=${encodeURIComponent(rawNote)}`,
  ];

  // Optional amount (strictly decimal formatted, e.g. 501.00)
  if (options.amount && !isNaN(Number(options.amount)) && Number(options.amount) > 0) {
    queryParts.push(`am=${Number(options.amount).toFixed(2)}`);
  }

  const query = queryParts.join('&');
  return `upi://pay?${query}`;
}

/**
 * Generates a high-resolution, offline-capable QR Code Data URL using local QRCode engine
 * @param {string} upiUri - NPCI UPI URI
 * @returns {Promise<string>} - Base64 Data URL or fallback external URL
 */
export async function generateUpiQrDataUrl(upiUri) {
  try {
    const dataUrl = await QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.warn('Local QRCode generation notice, using high-speed fallback:', err.message);
    return `https://api.qrserver.com/v1/create-qr-code/?size=350x350&margin=10&format=png&data=${encodeURIComponent(upiUri)}`;
  }
}
