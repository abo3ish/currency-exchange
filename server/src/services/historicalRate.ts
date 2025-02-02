import Immutable from "immutable";
import { DateTime } from "luxon";
import { getCachedData, setCachedData } from "../utils/redisClient";
import { APIResponse, CurrencyCode } from "../types";
import { getExchangeRate } from "./exchangeService";

const checkDateCache = async (dateStr: string, base: string) => {
    const cacheKey = `exchange_rates_${base}_${dateStr}`;
    const cachedRate = await getCachedData(cacheKey);
    return {
        dateStr,
        cached: cachedRate ? JSON.parse(cachedRate) : null
    };
};

const checkCacheForDates = async (dates: Immutable.List<string>, base: string) => {
    const checks = await Promise.all(
        dates.map(dateStr => checkDateCache(dateStr, base)).toArray()
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

const generateDateRange = (startDate: string, endDate: string): Immutable.List<string> => {
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);
    
    return Immutable.Range(0, end.diff(start, 'days').days + 1)
        .reduce((acc: Immutable.List<string>, curr: number) => {
            const date = start.plus({ days: curr }).toFormat('yyyy-MM-dd');
            return acc.push(date);
        }, Immutable.List());
};

export const getHistoricalRates = async (
    base: string,
    startDate: string,
    endDate: string
): Promise<Immutable.Map<string, APIResponse>> => {
    try {
        const dates = generateDateRange(startDate, endDate);
        
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
    await setCachedData(cacheKey, data, 30 * 24 * 3600);
};

export const filterHistoricalRates = (
    data: Immutable.Map<string, APIResponse>,
    base: string,
    targetCurrencies: Immutable.List<CurrencyCode>
): Immutable.Map<string, Immutable.Map<string, any>> => {
    return data.map((rates, date) => {
        const ratesData = rates[base.toLowerCase()] || {};
        const ratesList = targetCurrencies.map(targetCurrency => ({
            from: base.toLowerCase(),
            to: targetCurrency.toLowerCase(),
            rate: ratesData[targetCurrency.toLowerCase()] || null
        }));

        return Immutable.Map({
            date,
            rates: ratesList.toArray()
        });
    });
};