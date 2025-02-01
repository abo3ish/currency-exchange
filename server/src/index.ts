import { getExchangeRate, exchange, CurrencyCode } from "./services/exchangeService";
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
        const { from, to, amount } = req.body;
        if (!from || !to || !amount) {
            return res.status(400).json({ error: 'Missing parameters. Required: from, to, amount' });
        }

        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount)) {
            return res.status(400).json({ error: 'Amount must be a valid number' });
        }

        const result = await exchange(
            from as CurrencyCode,
            to as CurrencyCode,
            parsedAmount
        );
        
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Currency conversion failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
