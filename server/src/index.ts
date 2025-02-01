import { exchange, CurrencyCode, getHistoricalRates } from "./services/exchangeService";
import express from "express";
import cors from "cors";
import { Request, Response } from "express";

const app = express();
app.use(express.json(), cors());

app.get('/', (req, res) => {
    return res.send('Hello World');
})


app.post('/exchange', async (req: Request, res: Response) => {
    try {
        const { from, to, amount, date } = req.body;
        if (!from || !to || !amount) {
            return res.status(400).json({ error: 'Missing parameters. Required: from, to, amount' });
        }
        let dateToUse = date;
        if (dateToUse) {
            const parsedDate = new Date(dateToUse + 'T00:00:00Z');
            if (isNaN(parsedDate.getTime())) {
                throw new Error('Invalid date format');
            }
        } else {
            const today = new Date();
            dateToUse = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }


        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount)) {
            return res.status(400).json({ error: 'Amount must be a valid number' });
        }

        const result = await exchange(
            from as CurrencyCode,
            to as CurrencyCode,
            parsedAmount,
            dateToUse
        );
        
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Currency conversion failed' });
    }
});

app.get('/history', async (req: Request, res: Response) => {
    const { base, target, start, end } = req.query;
    const data = await getHistoricalRates(base as string, start as string, end as string);
    return res.send(data);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
