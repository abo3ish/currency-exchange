import Immutable from 'immutable';
import { DateTime } from 'luxon';
import { batchGetCachedData, batchSetCachedData } from '../utils/redisClient';
import { APIResponse, CurrencyCode } from '../types';
import { getExchangeRate } from './exchangeService';

// const BATCH_SIZE = 100; // Increased batch size
const MAX_RETRIES = 2;
const RETRY_DELAY = 500; // 1 second

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  base: string,
  dateStr: string,
  retries = 0
): Promise<APIResponse> => {
  try {
    return await getExchangeRate(base, dateStr);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      console.log(
        `Retrying fetch for ${dateStr} (attempt ${retries + 1}/${MAX_RETRIES})`
      );
      await wait(RETRY_DELAY * (retries + 1));
      return fetchWithRetry(base, dateStr, retries + 1);
    }
    throw error;
  }
};

const formatDate:  = (date: string) => {
  return DateTime.fromISO(date).toFormat('yyyy-MM-dd');
};

const checkCacheForDates = async (
  dates: Immutable.List<string>,
  base: string
) => {
  console.time(`cache-check-total-${dates.size}`);
  const cacheKeys = dates
    .map(
      (dateStr) => `exchange_rates_${base.toLowerCase()}_${formatDate(dateStr)}`
    )
    .toArray();

  const cachedResults = await batchGetCachedData(cacheKeys);
  const results = cachedResults.map(({ key, value }) => {
    const keyParts = key.split('_');
    const dateStr = keyParts[keyParts.length - 1]; // Get the last part which is the date
    return {
      base,
      dateStr,
      cached: value,
    };
  });

  console.timeEnd(`cache-check-total-${dates.size}`);
  return Immutable.List(results);
};

const fetchMissingRates = async (
  missingDates: Immutable.List<{ dateStr: string }>,
  base: string
) => {
  // Create all promises at once
  const allPromises = missingDates.map(async ({ dateStr }) => {
    try {
      const formattedDate = formatDate(dateStr);
      const data = await fetchWithRetry(base, formattedDate);
      return { dateStr: formattedDate, data };
    } catch (error) {
      console.error(`Failed to fetch rates for ${dateStr}:`, error);
      return {
        dateStr,
        data: {
          [base.toLowerCase()]: {},
          success: false,
          date: dateStr,
        },
      };
    }
  });

  // Resolve all promises concurrently
  const results = await Promise.all(allPromises);

  // Store all results in one batch
  await storeHistoricalRate(results, base);

  return Immutable.List(results);
};

const generateDateRange = (
  startDate: string,
  endDate: string
): Immutable.List<string> => {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  if (!start.isValid || !end.isValid) {
    throw new Error('Invalid date format. Use ISO format (e.g., 2023-01-01)');
  }

  return Immutable.Range(0, end.diff(start, 'days').days + 1).reduce(
    (acc: Immutable.List<string>, curr: number) => {
      const date = start.plus({ days: curr }).toFormat('yyyy-MM-dd');
      return acc.push(date);
    },
    Immutable.List()
  );
};

export const getHistoricalRates = async (
  base: string,
  startDate: string,
  endDate: string
): Promise<Immutable.Map<string, APIResponse>> => {
  try {
    if (!base || !startDate || !endDate) {
      throw new Error('Missing required parameters');
    }

    const dates = generateDateRange(startDate, endDate);
    if (dates.size === 0) {
      throw new Error('Invalid date range');
    }

    const cacheChecks = await checkCacheForDates(dates, base);
    const needsFetch = Immutable.List(
      cacheChecks.filter((item) => !item.cached)
    );
    console.time(`fetch-missing-${needsFetch.size}`);
    const fetchedRates = await fetchMissingRates(needsFetch, base);
    console.timeEnd(`fetch-missing-${needsFetch.size}`);

    const results = [
      ...cacheChecks
        .filter((item) => item.cached)
        .map((item) => ({
          dateStr: item.dateStr,
          data: item.cached,
        })),
      ...fetchedRates,
    ];

    return Immutable.Map<string, APIResponse>(
      results.map(({ dateStr, data }) => [dateStr, data])
    );
  } catch (error) {
    console.error('Historical rates fetch error:', error);
    const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch historical rates: ${errorMessage}`);
  }
};

export const storeHistoricalRate = async (
  batchResults: {
    dateStr: string;
    data: APIResponse;
  }[],
  base: string
) => {
  const cacheData = batchResults.map(({ dateStr, data }) => ({
    key: `exchange_rates_${base}_${dateStr}`,
    data,
    ttl: 30 * 24 * 3600,
  }));
  await batchSetCachedData(cacheData);
};

export const filterHistoricalRates = (
  data: Immutable.Map<string, APIResponse>,
  base: string,
  targetCurrencies: Immutable.List<CurrencyCode>
): Immutable.Map<string, Immutable.Map<string, any>> => {
  return data.map((rates, date) => {
    const ratesData = rates[base.toLowerCase()] || {};
    const ratesList = targetCurrencies.map((targetCurrency) => ({
      from: base.toLowerCase(),
      to: targetCurrency.toLowerCase(),
      rate: ratesData[targetCurrency.toLowerCase()] || null,
    }));

    return Immutable.Map({
      date,
      rates: ratesList.toArray(),
    });
  });
};
