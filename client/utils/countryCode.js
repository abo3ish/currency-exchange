const currencyToCountry = {
  // Major Fiat Currencies
  'USD': 'US', // United States Dollar
  'EUR': 'EU', // Euro
  'GBP': 'GB', // British Pound
  'JPY': 'JP', // Japanese Yen
  'AUD': 'AU', // Australian Dollar
  'CAD': 'CA', // Canadian Dollar
  'CHF': 'CH', // Swiss Franc
  'CNY': 'CN', // Chinese Yuan
  'HKD': 'HK', // Hong Kong Dollar
  'NZD': 'NZ', // New Zealand Dollar
  'SEK': 'SE', // Swedish Krona
  'KRW': 'KR', // South Korean Won
  'SGD': 'SG', // Singapore Dollar
  'NOK': 'NO', // Norwegian Krone
  'MXN': 'MX', // Mexican Peso
  'INR': 'IN', // Indian Rupee
  'RUB': 'RU', // Russian Ruble
  'ZAR': 'ZA', // South African Rand
  'TRY': 'TR', // Turkish Lira
  'BRL': 'BR', // Brazilian Real
  'TWD': 'TW', // Taiwan Dollar
  'DKK': 'DK', // Danish Krone
  'PLN': 'PL', // Polish Złoty
  'THB': 'TH', // Thai Baht
  'IDR': 'ID', // Indonesian Rupiah
  'HUF': 'HU', // Hungarian Forint
  'CZK': 'CZ', // Czech Koruna
  'ILS': 'IL', // Israeli Shekel
  'CLP': 'CL', // Chilean Peso
  'PHP': 'PH', // Philippine Peso
  'AED': 'AE', // UAE Dirham
  'SAR': 'SA', // Saudi Riyal
  'MYR': 'MY', // Malaysian Ringgit
  'RON': 'RO', // Romanian Leu
  
  // Middle Eastern Currencies
  'KWD': 'KW', // Kuwaiti Dinar
  'QAR': 'QA', // Qatari Riyal
  'BHD': 'BH', // Bahraini Dinar
  'OMR': 'OM', // Omani Rial
  
  // Asian Currencies
  'VND': 'VN', // Vietnamese Dong
  'BDT': 'BD', // Bangladeshi Taka
  'PKR': 'PK', // Pakistani Rupee
  
  // African Currencies
  'NGN': 'NG', // Nigerian Naira
  'KES': 'KE', // Kenyan Shilling
  'EGP': 'EG', // Egyptian Pound
  
  // Other Regional Currencies
  'ARS': 'AR', // Argentine Peso
  'COP': 'CO', // Colombian Peso
  'PEN': 'PE', // Peruvian Sol
  'MAD': 'MA', // Moroccan Dirham
  'BGN': 'BG', // Bulgarian Lev
  'HRK': 'HR', // Croatian Kuna
  'ISK': 'IS', // Icelandic Króna
  
  // Cryptocurrencies (using their primary country of origin or regulatory base)
  'BTC': 'US', // Bitcoin (using US as default)
  'ETH': 'CH', // Ethereum (Swiss foundation)
  'BNB': 'MT', // Binance Coin (Malta)
  'XRP': 'US', // Ripple (US-based company)
  'SOL': 'US', // Solana (US-based)
  'ADA': 'CH', // Cardano (Swiss foundation)
  'DOT': 'CH', // Polkadot (Swiss foundation)
  'USDT': 'HK', // Tether (Hong Kong)
  'USDC': 'US', // USD Coin (US-based)
  'BUSD': 'US', // Binance USD (US-based)
}

export const getCountryCode = (currencyCode) => {
  return currencyToCountry[currencyCode] || null
}
