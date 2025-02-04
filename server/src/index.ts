import { exchange } from './services/exchangeService';
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { DateTime } from 'luxon';
import Immutable from 'immutable';
import { CurrencyCode } from './types';
import {
  getHistoricalRates,
  filterHistoricalRates,
} from './services/historicalRate';

const app = express();
app.use(express.json(), cors());

app.get('/', (_, res) => {
  return res.send('Hello World');
});

app.post('/exchange', async (req: Request, res: Response) => {
  try {
    const { from, to, amount, date } = req.body;
    if (!from || !to || !amount) {
      return res
        .status(400)
        .json({ error: 'Missing parameters. Required: from, to, amount' });
    }

    const fromLower = from.toLowerCase() as CurrencyCode;
    const parsedAmount = Number(amount);
    const targetCurrencies = Array.isArray(to)
      ? Immutable.List<CurrencyCode>(to.map((t) => t.toLowerCase()))
      : Immutable.List<CurrencyCode>([to.toLowerCase()]);

    if (isNaN(parsedAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    let dateToUse = date;
    if (dateToUse) {
      const parsedDate = DateTime.fromISO(dateToUse);
      if (!parsedDate.isValid) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    } else {
      dateToUse = DateTime.now().toFormat('yyyy-MM-dd');
    }

    const results = await exchange(
      fromLower,
      targetCurrencies,
      parsedAmount,
      dateToUse
    );

    return res.json({results});
  } catch (error) {
    console.error('Exchange error:', error);
    return res.status(500).json({ error: 'Currency conversion failed' });
  }
});

app.get('/history', async (req: Request, res: Response) => {
  if (
    !req.query.base ||
		!req.query.target ||
		!req.query.start ||
		!req.query.end
  ) {
    return res
      .status(400)
      .json({ error: 'Missing parameters. Required: base, start, end' });
  }

  const startDate = req.query.start.toString();
  const endDate = req.query.end.toString();

  // Validate date format
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  if (!start.isValid || !end.isValid) {
    return res
      .status(400)
      .json({ error: 'Invalid date format. Use YYYY-MM-DD' });
  }

  // Check if date range exceeds 9 months
  const monthsDiff = end.diff(start, 'months').months;
  if (monthsDiff > 9 || monthsDiff < 0) {
    return res
      .status(400)
      .json({
        error:
					'Date range must not exceed 9 months and end date must be after start date',
      });
  }

  const base = req.query.base.toString();
  const target = req.query.target;

  const targetCurrencies = target
    ? Array.isArray(target)
      ? Immutable.List<CurrencyCode>(target.map((t) => t.toString()))
      : Immutable.List<CurrencyCode>([target.toString()])
    : Immutable.List<CurrencyCode>();

  try {
    const data = await getHistoricalRates(
      base.toLowerCase(),
      startDate,
      endDate
    );
    const filteredData = filterHistoricalRates(data, base, targetCurrencies);
    return res.json(filteredData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to fetch historical rates' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
