const RATES_API = 'https://open.er-api.com/v6/latest/USD';

// Static fallback rates (approximate typical indexes) in case the currency rate API is unreachable or offline
export const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  INR: 83.5,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  INR: '₹',
};

export interface ExchangeRates {
  USD: number;
  [key: string]: number;
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  if (typeof window === 'undefined') {
    return FALLBACK_RATES as ExchangeRates;
  }

  // Check sessionStorage cache first
  try {
    const cached = sessionStorage.getItem('nichecalc_exchange_rates');
    const cacheTime = sessionStorage.getItem('nichecalc_exchange_rates_time');
    
    // Cache remains valid for 6 hours
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 6 * 60 * 60 * 1000) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('sessionStorage is not available for caching exchange rates.');
  }

  try {
    const res = await fetch(RATES_API);
    if (!res.ok) throw new Error('API response error');
    const data = await res.json();
    const rates = data.rates;
    
    // Filter to only our supported currencies
    const filteredRates: ExchangeRates = {
      USD: 1,
      EUR: rates.EUR || FALLBACK_RATES.EUR,
      GBP: rates.GBP || FALLBACK_RATES.GBP,
      CAD: rates.CAD || FALLBACK_RATES.CAD,
      INR: rates.INR || FALLBACK_RATES.INR,
    };

    try {
      sessionStorage.setItem('nichecalc_exchange_rates', JSON.stringify(filteredRates));
      sessionStorage.setItem('nichecalc_exchange_rates_time', Date.now().toString());
    } catch (e) {}

    return filteredRates;
  } catch (err) {
    console.warn('Failed to fetch live exchange rates, falling back to local defaults.', err);
    return FALLBACK_RATES as ExchangeRates;
  }
}
