const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const { marked } = require('marked');

router.post('/', async (req, res) => {
    try {
        // Extract height and weight from the request body
        const { height, weight } = req.body;

        // Validate inputs
        if (!height || !weight || isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
            return res.status(400).json({
                error: 'Height and weight must be positive numbers.',
            });
        }

        // Calculate BMI (height is in centimeters, weight is in kilograms)
        const bmi = weight / ((height / 100) ** 2);
        const bmiString = bmi.toFixed(2);

        // Define prompt for Generative AI
        const prompt = `
        A person has a BMI of ${bmi.toFixed(2)}. Provide recommendations in a structured format with the following sections:
        - **Cardio exercises (frequency, intensity, duration)**
        - **Strength training exercises**
        - **Diet plans for breakfast, lunch, dinner, and snacks**
        - **Useful YouTube links for fitness**
        - **Lifestyle tips (hydration, sleep, and stress management)**

         Use clear headings (e.g., <h2>) for each section and format the content with bullet points where appropriate.
        `;

        // Generate response from the model
        const result = await model.generateContent(prompt);

        // Log the raw response for debugging
        console.log('Raw AI response:', JSON.stringify(result, null, 2));

        // Extract and process the content
        const candidates = result.response?.candidates;
        if (!candidates || candidates.length === 0) {
            throw new Error('No candidates found in the AI response.');
        }

        // Extract content from the first candidate
        const contentParts = candidates[0]?.content?.parts;
        if (!contentParts || !Array.isArray(contentParts) || contentParts.length === 0) {
            throw new Error('Invalid or empty content parts in the AI response.');
        }

        // Combine the text from all parts
        const adviceText = contentParts.map(part => part.text).join('\n');
        // Convert Markdown to HTML
        const adviceHtml = marked(adviceText);

        // Respond with the BMI and the AI's advice
        res.status(200).json({
            success: true,
            data: {
                bmi: bmiString,
                advice: adviceHtml,
            },
        });
    } catch (error) {
        console.error('Error generating content:', error.message);

        res.status(500).json({
            success: false,
            error: 'Internal Server Error. Please try again later.',
        });
    }
});

module.exports = router;