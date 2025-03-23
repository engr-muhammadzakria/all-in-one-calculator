const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();


const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));



// Routes
const bmiRoute = require('./routes/bmi'); // Add this line
const ageRoute = require('./routes/age');
const currencyRoute = require('./routes/currency');

app.use('/api/bmi', bmiRoute); // Add the BMI route
app.use('/api/age', ageRoute);
app.use('/api/currency', currencyRoute);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
