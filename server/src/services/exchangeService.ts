import dotenv from "dotenv";
import { redisClient } from "../utils/redisClient";
dotenv.config();

type CurrencyCode = string;

type APIResponse = {
    date: string;
    [key: string]: any; // This allows for dynamic currency keys
};

export const getExchangeRate = async (base: string, date?: string): Promise<APIResponse> => {
    try {
        if (!redisClient.isReady) {
            await redisClient.connect();
        }

        const cacheKey = `exchange_rates_${base.toLowerCase()}_${date}`;
        
        const cachedRates = await redisClient.get(cacheKey);
        if (cachedRates) {
            return JSON.parse(cachedRates);
        }

        const response = await fetch(
            `https://${date}.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`
        );
        const data = await response.json();

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

        return data;
    } catch (error) {
        throw new Error("Failed to fetch exchange rates");
    }
};

export const getHistoricalRates = async (
    base: string,
    targets: string[],
    startDate: string,
    endDate: string
): Promise<Record<string, APIResponse>> => {
    try {
        const start = new Date(startDate + 'T00:00:00Z');
        const end = new Date(endDate + 'T00:00:00Z');
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }

        const dates: string[] = [];
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(date.toISOString().split('T')[0]);
        }

        const fetchPromises = dates.map(async (dateStr) => {
            const cacheKey = `exchange_rates_${base.toLowerCase()}_${dateStr}`;
            const cachedRate = await redisClient.get(cacheKey);
            
            if (cachedRate) {
                return { dateStr, data: JSON.parse(cachedRate) };
            }
            
            const data = await getExchangeRate(base.toLowerCase(), dateStr);
            return { dateStr, data };
        });

        const results = await Promise.all(fetchPromises);
        return results.reduce((acc, { dateStr, data }) => {
            acc[dateStr] = data;
            return acc;
        }, {} as Record<string, APIResponse>);
    } catch (error) {
        throw new Error("Failed to fetch historical rates");
    }
};

export const storeHistoricalRate = async (base: string, date: string, data: APIResponse) => {
    const cacheKey = `exchange_rates_${base.toLowerCase()}_${date}`;
    await redisClient.setEx(cacheKey, 30 * 24 * 3600, JSON.stringify(data));
};

export type { CurrencyCode };

export const exchange = async (
    from: CurrencyCode,
    to: CurrencyCode[],
    amount: number,
    date: string
): Promise<{ results: { currency: string, result: number }[] }> => {
    try {
        const response = await getExchangeRate(from.toLowerCase(), date);
        
        const results = to.map(targetCurrency => {
            if (!response[from.toLowerCase()] || !response[from.toLowerCase()][targetCurrency.toLowerCase()]) {
                throw new Error(`Invalid currency pair: ${from}-${targetCurrency}`);
            }
            
            const rate = response[from.toLowerCase()][targetCurrency.toLowerCase()];
            const result = amount * rate;
            return {
                currency: targetCurrency,
                result: Number(result.toFixed(2))
            };
        });

        return { results };
    } catch (error) {
        throw new Error('Failed to perform currency conversion');
    }
};
