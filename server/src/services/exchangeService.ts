import dotenv from "dotenv";
import { redisClient } from "../utils/redisClient";
dotenv.config();

type CurrencyCode = string;

type APIResponse = {
    date: string;
    [key: string]: any; // This allows for dynamic currency keys
};

export const getExchangeRate = async (base: string): Promise<APIResponse> => {
    try {
        if (!redisClient.isReady) {
            await redisClient.connect();
        }

        const cacheKey = `exchange_rates_${base.toLowerCase()}`;
        const cachedRates = await redisClient.get(cacheKey);
        if (cachedRates) {
            return JSON.parse(cachedRates);
        }

        const response = await fetch(
            `https://latest.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`
        );
        const data = await response.json();

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));

        return data;
    } catch (error) {
        throw new Error("Failed to fetch exchange rates");
    }
};

export type { CurrencyCode };

export const exchange = async (
    from: CurrencyCode,
    to: CurrencyCode,
    amount: number
): Promise<{ result: number }> => {
    try {
        const response = await getExchangeRate(from.toLowerCase());
        if (!response[from.toLowerCase()] || !response[from.toLowerCase()][to.toLowerCase()]) {
            throw new Error('Invalid currency pair');
        }
        
        const rate = response[from.toLowerCase()][to.toLowerCase()];
        const result = amount * rate;
        return { result: Number(result.toFixed(2)) };
    } catch (error) {
        throw new Error('Currency conversion failed');
    }
};
