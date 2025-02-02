import { exchange } from "./services/exchangeService";
import express from "express";
import cors from "cors";
import { Request, Response } from "express";
import { DateTime } from "luxon";
import Immutable from "immutable";
import { CurrencyCode } from "./types";
import { getHistoricalRates } from "./services/historicalRate";

const app = express();
app.use(express.json(), cors());

app.get('/', (_, res) => {
    return res.send('Hello World');
})


app.post('/exchange', async (req: Request, res: Response) => {
    try {
        const { from, to, amount, date } = req.body;
        if (!from || !to || !amount) {
            return res.status(400).json({ error: 'Missing parameters. Required: from, to, amount' });
        }

        const targetCurrencies = Array.isArray(to) ? Immutable.List<CurrencyCode>(to) : Immutable.List<CurrencyCode>([to]);
        
        let dateToUse = date;
        if (dateToUse) {
            const parsedDate = DateTime.fromISO(dateToUse);
            if (!parsedDate.isValid) {
                return res.status(400).json({ error: 'Invalid date format' });
            }
        } else {
            dateToUse = DateTime.now().toFormat('yyyy-MM-dd');
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount)) {
            return res.status(400).json({ error: 'Amount must be a valid number' });
        }

        const result = await exchange(
            from,
            targetCurrencies,
            parsedAmount,
            dateToUse
        );
        
        return res.json(result);
    } catch (error) {
        console.error('Exchange error:', error);
        return res.status(500).json({ error: 'Currency conversion failed' });
    }
});

app.get('/history', async (req: Request, res: Response) => {
    if (!req.query.base || !req.query.target || !req.query.start || !req.query.end) {
        return res.status(400).json({ error: 'Missing parameters. Required: base, start, end' });
    }

    const base = req.query.base.toString();
    const target = req.query.target;
    const startDate = req.query.start.toString();
    const endDate = req.query.end.toString();

    // Validate date format
    if (!DateTime.fromISO(startDate).isValid || !DateTime.fromISO(endDate).isValid) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    const targetCurrencies = target ? (Array.isArray(target) ? target : [target]) : [];
    
    try {
        const data = await getHistoricalRates(base.toLowerCase(), startDate, endDate);
        
        const filteredData = data.reduce((acc, rates, date) => {
            const ratesData = (rates as Record<string, Record<string, number>>)[base] || {};
            return acc.set(date, Immutable.Map({
                date,
                rates: Immutable.List(targetCurrencies).map(targetCurrency => 
                    Immutable.Map({
                        from: base,
                        to: targetCurrency,
                        rate: ratesData[targetCurrency as string] || null
                    })
                )
            }));
        }, Immutable.Map()).toJS();

        return res.json(filteredData);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Failed to fetch historical rates' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
