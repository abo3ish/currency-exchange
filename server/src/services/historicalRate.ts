import Immutable from "immutable";
import { DateTime } from "luxon";
import { redisClient } from "../utils/redisClient";
import { APIResponse } from "../types";
import { getExchangeRate } from "./exchangeService";

const checkCacheForDates = async (dates: Immutable.List<string>, base: string) => {
    const checks = await Promise.all(
        dates.map(async (dateStr) => {
            const cacheKey = `exchange_rates_${base}_${dateStr}`;
            const cachedRate = await redisClient.get(cacheKey);
            return {
                dateStr,
                cached: cachedRate ? JSON.parse(cachedRate) : null
            };
        }).toArray()
    );
    return Immutable.List(checks);
};

const fetchMissingRates = async (
    missingDates: Immutable.List<{ dateStr: string }>, 
    base: string
) => {
    const fetched = await Promise.all(
        missingDates.map(async ({ dateStr }) => {
            const data = await getExchangeRate(base, dateStr);
            return { dateStr, data };
        }).toArray()
    );
    return Immutable.List(fetched);
};

export const getHistoricalRates = async (
    base: string,
    startDate: string,
    endDate: string
): Promise<Immutable.Map<string, APIResponse>> => {
    try {
        const start = DateTime.fromISO(startDate);
        const end = DateTime.fromISO(endDate);
        
        const dates = Immutable.Range(0, end.diff(start, 'days').days + 1)
            .reduce((acc: Immutable.List<string>, curr: number) => {
                const date = start.plus({ days: curr }).toFormat('yyyy-MM-dd');
                return acc.push(date);
            }, Immutable.List());

        const cacheChecks = await checkCacheForDates(dates, base);
        const needsFetch = Immutable.List(cacheChecks.filter(item => !item.cached));
        const fetchedRates = await fetchMissingRates(needsFetch, base);

        const results = [
            ...cacheChecks.filter(item => item.cached).map(item => ({ 
                dateStr: item.dateStr, 
                data: item.cached 
            })),
            ...fetchedRates
        ];

        return Immutable.Map<string, APIResponse>(
            results.map(({ dateStr, data }) => [dateStr, data])
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to fetch historical rates: ${errorMessage}`);
    }
};

export const storeHistoricalRate = async (base: string, date: string, data: APIResponse) => {
    const cacheKey = `exchange_rates_${base}_${date}`;
    await redisClient.setEx(cacheKey, 30 * 24 * 3600, JSON.stringify(data));
};