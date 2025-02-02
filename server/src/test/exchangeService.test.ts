import { getExchangeRate, exchange } from '../services/exchangeService';
import Immutable from 'immutable';
import { CurrencyCode } from '../types';

// Mock global fetch
global.fetch = jest.fn();

describe('Exchange Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getExchangeRate', () => {
        it('should fetch exchange rates successfully', async () => {
            const mockApiResponse = {
                usd: { eur: 0.85, gbp: 0.73 }
            };
            
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const result = await getExchangeRate('USD', '2024-02-20');
            expect(result).toEqual(mockApiResponse);
        });

        it('should throw error when API call fails', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

            await expect(getExchangeRate('USD', '2024-02-20'))
                .rejects
                .toThrow('Failed to fetch exchange rates: API Error');
        });

        it('should handle invalid date format', async () => {
            (global.fetch as jest.Mock).mockRejectedValue(new Error('Invalid date'));

            await expect(getExchangeRate('USD', 'invalid-date'))
                .rejects
                .toThrow('Failed to fetch exchange rates: API Error');
        });
    });

    describe('exchange', () => {
        it('should convert currency correctly', async () => {
            const mockApiResponse = {
                usd: { eur: 0.85, gbp: 0.73 }
            };
            
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const result = await exchange(
                'usd' as CurrencyCode,
                Immutable.List(['eur', 'gbp'] as CurrencyCode[]),
                100,
                '2024-02-20'
            );

            expect(result).toEqual({
                results: [
                    { currency: 'eur', result: 85.00 },
                    { currency: 'gbp', result: 73.00 }
                ]
            });
        });

        it('should handle decimal amounts correctly', async () => {
            const mockApiResponse = {
                usd: { 
                    eur: 0.85123, 
                    gbp: 0.73456 
                }
            };
            
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockApiResponse)
            });

            const result = await exchange(
                'usd' as CurrencyCode,
                Immutable.List(['eur', 'gbp'] as CurrencyCode[]),
                99.99,
                '2024-02-20'
            );

            expect(result).toEqual({
                results: [
                    { currency: 'eur', result: 85.11 },
                    { currency: 'gbp', result: 73.45 }
                ]
            });
        });

        it('should handle empty target currencies list', async () => {
            await expect(exchange(
                'usd' as CurrencyCode,
                Immutable.List([] as CurrencyCode[]),
                100,
                '2024-02-20'
            )).resolves.toEqual({ results: [] });
        });
    });
});
