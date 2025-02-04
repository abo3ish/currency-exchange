import dotenv from 'dotenv';
import Immutable from 'immutable';
import { APIResponse, CurrencyCode } from '../types';
dotenv.config();

export interface ExchangeResult {
  currency: CurrencyCode;
  result: number;
}

export const getExchangeRate = async (base: string, date: string): Promise<APIResponse> => {
  try {
    const response = await fetch(
      `https://${date}.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`
    );
    const data: APIResponse = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to fetch exchange rates: API Error');
  }
};

export const exchange = async (
  from: CurrencyCode,
  to: Immutable.List<CurrencyCode>,
  amount: number,
  date: string
): Promise<ExchangeResult[]> => {
  const response: APIResponse = await getExchangeRate(from, date);
    
  const results = to.map((targetCurrency: CurrencyCode) => {
    if (!response[from] || !response[from][targetCurrency]) {
      throw new Error(`Invalid currency pair: ${from}-${targetCurrency}`);
    }
        
    const rate = response[from][targetCurrency];
    const result = amount * rate;
    return {
      currency: targetCurrency,
      result: Number(result.toFixed(2)),
    };
  });

  return results.toArray();
};
