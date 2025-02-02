import dotenv from "dotenv";
import { redisClient } from "../utils/redisClient";
import { DateTime } from "luxon";
import Immutable from "immutable";
import { APIResponse, CurrencyCode } from "../types";
dotenv.config();

export const getExchangeRate = async (base: string, date: string): Promise<APIResponse> => {
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
        const data: APIResponse = await response.json();

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
        return data;
    } catch (error) {
        console.log(error)
        throw new Error("Failed to fetch exchange rates");
    }
};

export const exchange = async (
    from: CurrencyCode,
    to: Immutable.List<CurrencyCode>,
    amount: number,
    date: string
): Promise<{ results: { currency: string, result: number }[] }> => {
    try {
        const response: APIResponse = await getExchangeRate(from.toLowerCase(), date);
        
        const results = to.map((targetCurrency: CurrencyCode) => {
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

        return { results: results.toArray() };
    } catch (error) {
        throw new Error('Failed to perform currency conversion');
    }
};
