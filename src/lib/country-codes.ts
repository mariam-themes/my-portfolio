export interface CountryCode {
  nameAr: string;
  nameEn: string;
  code: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  // ── Gulf Cooperation Council (GCC) ──
  { nameAr: 'السعودية', nameEn: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { nameAr: 'الإمارات', nameEn: 'UAE', code: '+971', flag: '🇦🇪' },
  { nameAr: 'الكويت', nameEn: 'Kuwait', code: '+965', flag: '🇰🇼' },
  { nameAr: 'قطر', nameEn: 'Qatar', code: '+974', flag: '🇶🇦' },
  { nameAr: 'البحرين', nameEn: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { nameAr: 'عُمان', nameEn: 'Oman', code: '+968', flag: '🇴🇲' },

  // ── Arab Countries ──
  { nameAr: 'مصر', nameEn: 'Egypt', code: '+20', flag: '🇪🇬' },
  { nameAr: 'الأردن', nameEn: 'Jordan', code: '+962', flag: '🇯🇴' },
  { nameAr: 'العراق', nameEn: 'Iraq', code: '+964', flag: '🇮🇶' },
  { nameAr: 'المغرب', nameEn: 'Morocco', code: '+212', flag: '🇲🇦' },
  { nameAr: 'الجزائر', nameEn: 'Algeria', code: '+213', flag: '🇩🇿' },
  { nameAr: 'تونس', nameEn: 'Tunisia', code: '+216', flag: '🇹🇳' },
  { nameAr: 'لبنان', nameEn: 'Lebanon', code: '+961', flag: '🇱🇧' },
  { nameAr: 'سوريا', nameEn: 'Syria', code: '+963', flag: '🇸🇾' },
  { nameAr: 'فلسطين', nameEn: 'Palestine', code: '+970', flag: '🇵🇸' },
  { nameAr: 'اليمن', nameEn: 'Yemen', code: '+967', flag: '🇾🇪' },
  { nameAr: 'ليبيا', nameEn: 'Libya', code: '+218', flag: '🇱🇾' },
  { nameAr: 'السودان', nameEn: 'Sudan', code: '+249', flag: '🇸🇩' },
  { nameAr: 'موريتانيا', nameEn: 'Mauritania', code: '+222', flag: '🇲🇷' },
  { nameAr: 'الصومال', nameEn: 'Somalia', code: '+252', flag: '🇸🇴' },
  { nameAr: 'جيبوتي', nameEn: 'Djibouti', code: '+253', flag: '🇩🇯' },
  { nameAr: 'جزر القمر', nameEn: 'Comoros', code: '+269', flag: '🇰🇲' },

  // ── Major International ──
  { nameAr: 'الولايات المتحدة', nameEn: 'USA', code: '+1', flag: '🇺🇸' },
  { nameAr: 'بريطانيا', nameEn: 'UK', code: '+44', flag: '🇬🇧' },
  { nameAr: 'كندا', nameEn: 'Canada', code: '+1', flag: '🇨🇦' },
  { nameAr: 'تركيا', nameEn: 'Turkey', code: '+90', flag: '🇹🇷' },
  { nameAr: 'ألمانيا', nameEn: 'Germany', code: '+49', flag: '🇩🇪' },
  { nameAr: 'فرنسا', nameEn: 'France', code: '+33', flag: '🇫🇷' },
  { nameAr: 'أستراليا', nameEn: 'Australia', code: '+61', flag: '🇦🇺' },
  { nameAr: 'ماليزيا', nameEn: 'Malaysia', code: '+60', flag: '🇲🇾' },
  { nameAr: 'هولندا', nameEn: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { nameAr: 'إسبانيا', nameEn: 'Spain', code: '+34', flag: '🇪🇸' },
  { nameAr: 'إيطاليا', nameEn: 'Italy', code: '+39', flag: '🇮🇹' },
  { nameAr: 'السويد', nameEn: 'Sweden', code: '+46', flag: '🇸🇪' },
  { nameAr: 'سويسرا', nameEn: 'Switzerland', code: '+41', flag: '🇨🇭' },
];

/**
 * Cleans any phone number format and returns a valid WhatsApp URL.
 * Handles:
 * - Numbers with country code: "+966 50 123 4567" -> "https://wa.me/966501234567"
 * - Numbers with double zeros: "00201012345678" -> "https://wa.me/201012345678"
 * - Saudi local numbers: "0501234567" -> "https://wa.me/966501234567"
 * - Egyptian local numbers: "01012345678" -> "https://wa.me/201012345678"
 */
export function getWhatsAppUrl(phone: string): string {
  if (!phone) return '';

  let cleaned = phone.trim();

  // If starts with 00, remove the 00
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // Remove non-digit characters except leading plus if any
  cleaned = cleaned.replace(/[^0-9]/g, '');

  // If user entered a local 10-digit Saudi number starting with 05
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    cleaned = '966' + cleaned.substring(1);
  } else if (cleaned.startsWith('5') && cleaned.length === 9) {
    // Saudi number without leading zero (e.g. 501234567)
    cleaned = '966' + cleaned;
  } else if (cleaned.startsWith('01') && cleaned.length === 11) {
    // Egyptian local number starting with 01
    cleaned = '20' + cleaned.substring(1);
  }

  return `https://wa.me/${cleaned}`;
}

