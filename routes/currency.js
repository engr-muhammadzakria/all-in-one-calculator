const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const OPEN_EXCHANGE_RATES_APP_ID = process.env.OPEN_EXCHANGE_RATES_APP_ID;
const OPEN_EXCHANGE_RATES_URL = `https://openexchangerates.org/api/latest.json?app_id=${OPEN_EXCHANGE_RATES_APP_ID}`;

router.post('/', async (req, res) => {
    const { amount, from, to } = req.body;

    // Validate inputs
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Please provide a valid amount greater than 0.' });
    }
    if (!from || !to) {
        return res.status(400).json({ error: 'Please provide both "from" and "to" currencies.' });
    }

    try {
        // Dynamically import node-fetch
        const { default: fetch } = await import('node-fetch');

        // Fetch the latest exchange rates from Open Exchange Rates
        const response = await fetch(OPEN_EXCHANGE_RATES_URL);
        const data = await response.json();

        // Check if the request was successful
        if (!data.rates) {
            return res.status(500).json({ error: 'Failed to fetch exchange rates.', details: data });
        }

        // Get the rates for the "from" and "to" currencies
        const fromRate = data.rates[from];
        const toRate = data.rates[to];

        // Validate currency codes
        if (!fromRate || !toRate) {
            return res.status(400).json({ error: 'Invalid or unsupported currency code.', details: { from, to } });
        }

        // Open Exchange Rates uses USD as the base currency by default
        // To convert fromCurrency to toCurrency:
        // 1. Convert fromCurrency to USD: amountInUSD = amount / fromRate
        // 2. Convert USD to toCurrency: amountInToCurrency = amountInUSD * toRate
        const amountInUSD = amount / fromRate;
        const convertedAmount = amountInUSD * toRate;
        const conversionRate = toRate / fromRate;

        // Generate advice using Google Generative AI
        const prompt = `
        A user is converting ${amount} ${from} to ${to}, resulting in ${convertedAmount.toFixed(2)} ${to} at a conversion rate of ${conversionRate}.
        Provide advice in a structured format with the following sections:
        - **Exchange Rate Prediction**: Predict whether the exchange rate might improve or worsen in the near future and suggest whether to exchange now or wait.
        - **Travel Tips**: If applicable, provide tips for using the converted currency while traveling (e.g., local payment preferences, currency exchange tips).
        - **Economic Factors**: Highlight any economic factors that might affect the exchange rate (e.g., inflation, interest rates).
        - **Disclaimer**: Include a disclaimer about the accuracy of the prediction and advice.

        Use clear headings (e.g., <h2>) for each section and format the content with bullet points where appropriate.
        `;
        const result = await model.generateContent(prompt);
        const advice = result.response.text();

        res.json({ success: true, convertedAmount: convertedAmount.toFixed(2), advice });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.', details: error.message });
    }
});

module.exports = router;