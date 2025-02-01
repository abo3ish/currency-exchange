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
    startDate: string,
    endDate: string
): Promise<Record<string, APIResponse>> => {
    try {
        const results: Record<string, APIResponse> = {};
        const start = new Date(startDate + 'T00:00:00Z');
        const end = new Date(endDate + 'T00:00:00Z');
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            const cacheKey = `exchange_rates_${base.toLowerCase()}_${dateStr}`;
            
            const cachedRate = await redisClient.get(cacheKey);
            if (cachedRate) {
                results[dateStr] = JSON.parse(cachedRate);
            } else {
                await getExchangeRate(base.toLowerCase(), dateStr);
            }
        }
        
        return results;
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
    to: CurrencyCode,
    amount: number,
    date: string
): Promise<{ result: number }> => {
    try {
        const response = await getExchangeRate(from.toLowerCase(), date);
        if (!response[from.toLowerCase()] || !response[from.toLowerCase()][to.toLowerCase()]) {
            throw new Error('Invalid currency pair');
        }
        
        const rate = response[from.toLowerCase()][to.toLowerCase()];
        const result = amount * rate;
        return { result: Number(result.toFixed(2)) };
    } catch (error) {
        throw new Error('Failed to perform currency conversion');
    }
};
