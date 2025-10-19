export type Currency = 'AUD' | 'USD' | 'EUR' | 'GBP'

export interface CurrencyConfig {
  code: Currency
  symbol: string
  name: string
  rate: number
}

export const CURRENCIES: Record<Currency, Omit<CurrencyConfig, 'rate'>> = {
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' }
}

export const EXCHANGE_RATES: Record<Currency, number> = {
  AUD: 1, // Base currency
  USD: parseFloat(import.meta.env.VITE_EXCHANGE_RATE_USD) || 0.65,
  EUR: parseFloat(import.meta.env.VITE_EXCHANGE_RATE_EUR) || 0.61,
  GBP: parseFloat(import.meta.env.VITE_EXCHANGE_RATE_GBP) || 0.52
}

export const convertPrice = (priceAUD: number, toCurrency: Currency): number => {
  return priceAUD * EXCHANGE_RATES[toCurrency]
}

export const formatPrice = (price: number, currency: Currency): string => {
  const currencyConfig = CURRENCIES[currency]

  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  }).format(price)
}

export const formatPriceWithSymbol = (price: number, currency: Currency): string => {
  const currencyConfig = CURRENCIES[currency]
  return `${currencyConfig.symbol}${price.toFixed(2)}`
}

export const calculateGST = (amount: number, currency: Currency): number => {
  // GST only applies to Australian customers
  if (currency !== 'AUD') return 0
  return amount * 0.1 // 10% GST
}

export const getDefaultCurrency = (): Currency => {
  // Try to detect user's location/preference
  const savedCurrency = localStorage.getItem('preferred-currency') as Currency
  if (savedCurrency && Object.keys(CURRENCIES).includes(savedCurrency)) {
    return savedCurrency
  }

  // Default to AUD for Australian timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (timezone.includes('Australia')) {
    return 'AUD'
  }

  return 'AUD' // Default to AUD
}

export const setCurrencyPreference = (currency: Currency): void => {
  localStorage.setItem('preferred-currency', currency)
}