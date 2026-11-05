/**
 * FORGEOS Indian Locale & Industrial Formatting Utilities
 * Standardized for Indian CNC Manufacturing Environment
 * 
 * Location: Howrah, West Bengal, India
 * Company: SHREE GANESH PRECISION ENGINEERING PVT. LTD.
 */

export const INDIAN_LOCALE_CONFIG = {
  locale: 'en-IN',
  currency: 'INR',
  currencySymbol: '₹',
  timeZone: 'Asia/Kolkata',
  dateFormat: 'DD-MM-YYYY',
  measurementSystem: 'Metric (mm, kg)',
  factory: {
    name: 'SHREE GANESH PRECISION ENGINEERING PVT. LTD.',
    shortName: 'Shree Ganesh Precision',
    location: 'Howrah, West Bengal, India',
    industrialCluster: 'Baltikuri Industrial Area, Howrah - 711113',
    demoGstin: '19ABCDE1234F1Z5 (Illustrative Demo)'
  },
  personnel: {
    productionManager: 'Arindam Chatterjee',
    factoryOwner: 'Rajesh Agarwal',
    floorManager: 'Sourav Das',
    maintenanceSupervisor: 'Vikram Singh',
    qualityManager: 'Priya Sharma'
  }
};

/**
 * Format currency strictly in Indian Rupee (INR) with Indian comma grouping.
 * e.g., 1250000 -> ₹12,50,000 (NEVER ₹1.25M)
 * e.g., 850.5 -> ₹850.50
 */
export const formatINR = (amount: number, includeDecimals: boolean = false): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(amount);
};

/**
 * Format plain numbers using Indian grouping convention.
 * e.g., 125000 -> 1,25,000
 */
export const formatNumberIN = (value: number): string => {
  return new Intl.NumberFormat('en-IN').format(value);
};

/**
 * Format Date into DD-MM-YYYY Indian convention.
 * e.g. "2026-11-05" -> "05-11-2026"
 */
export const formatDateIN = (dateInput: string | Date): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    // If already in DD-MM-YYYY or has custom string, return as is
    if (/^\d{2}-\d{2}-\d{4}/.test(dateInput.toString())) {
      return dateInput.toString();
    }
    return dateInput.toString();
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Format DateTime into Indian Standard Time (IST) convention.
 * e.g. "05-11-2026, 14:30 IST"
 */
export const formatDateTimeIST = (dateInput: string | Date): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return `${dateInput} IST`;
  }
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year}, ${hours}:${minutes} IST`;
};
