const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { marked } = require('marked');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Function to calculate exact age
function calculateAge(birthdate) {
    const birthDate = new Date(birthdate);
    const today = new Date();

    // Validate birthdate
    if (isNaN(birthDate.getTime()) || birthDate > today) {
        throw new Error('Invalid birthdate. Please provide a valid date in the past.');
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust if the current month/day is before the birth month/day
    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

router.post('/', async (req, res) => {
    try {
        const { birthdate } = req.body;

        // Validate birthdate
        if (!birthdate) {
            return res.status(400).json({
                success: false,
                error: 'Birthdate is required.',
            });
        }

        // Calculate exact age
        const age = calculateAge(birthdate);

        // Format age string
        const ageString = `${age.years} years, ${age.months} months, ${age.days} days`;

        // Define prompt for Generative AI
        const prompt = `
        A person is ${age.years} years old. Provide life advice and trending skills for someone of this age in a structured format with the following sections:
        - **Life Advice**
        - **Career Tips**
        - **Trending Skills to Learn**
        - **Health and Wellness**
        - **Hobbies and Interests**
        - **Disclaimer**

        Use clear headings (e.g., <h2>) for each section and format the content with bullet points where appropriate.
        `;

        // Generate response from the model
        const result = await model.generateContent(prompt);

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

        // Respond with the age and the AI's advice
        res.status(200).json({
            success: true,
            data: {
                age: ageString,
                advice: adviceHtml,
            },
        });
    } catch (error) {
        console.error('Error generating content:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal Server Error. Please try again later.',
        });
    }
});

module.exports = router;