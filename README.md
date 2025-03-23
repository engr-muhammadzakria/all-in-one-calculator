# All-in-One Calculator App

![All-in-One Calculator App](public/logo.jpeg)

Welcome to the **All-in-One Calculator App**, a powerful web application powered by advanced AI to simplify your daily calculations with precision and intelligence. Designed with a sleek, user-friendly interface, this app seamlessly integrates three essential tools to meet your diverse needs.

## Features

- **BMI Calculator**:
  - Calculate your Body Mass Index (BMI) based on weight and height inputs.
  - Supports multiple units (kg/cm, lb/ft-in, kg/m).
  - Receive AI-generated, personalized health advice with collapsible sections (e.g., Cardio, Strength, Diet).

- **Age Calculator**:
  - Determine your exact age by entering your birthdate.
  - Unlock AI-driven insights with customized life-stage advice (e.g., Life Advice, Career, Health).

- **Currency Converter**:
  - Convert between over 200 currencies with real-time exchange rates using the Open Exchange Rates API.
  - Dynamically loads all available currencies into dropdowns.
  - Provides AI-powered recommendations on exchange rate trends, travel tips, and economic factors.

- **Additional Features**:
  - Consistent, modern UI across all calculators with loading spinners and collapsible advice sections.
  - "Share Advice" button to share results via the Web Share API or clipboard.
  - Navigation cards for easy access to other calculators.
  - Guided tour using Intro.js to help new users get started.
  - Robust error handling with detailed error messages.

## Tech Stack

- **Frontend**:
  - HTML, CSS, JavaScript
  - Font Awesome for icons
  - Intro.js for guided tours

- **Backend**:
  - Node.js with Express.js
  - Google Generative AI for generating personalized advice
  - Open Exchange Rates API for real-time currency conversion

## Prerequisites

Before running the app, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- A Google Generative AI API key (for generating advice)
- An Open Exchange Rates API key (for currency conversion)

## Setup Instructions

### 1. Clone the Repository:
```bash
git clone https://github.com/your-username/all-in-one-calculator.git
cd all-in-one-calculator
```

### 2. Install Dependencies:
```bash
npm install
```

### 3. Set Up Environment Variables:
Create a `.env` file in the project root and add your API keys:
```
API_KEY=your_google_generative_ai_key
OPEN_EXCHANGE_RATES_APP_ID=your_open_exchange_rates_app_id
```
- To get a Google Generative AI API key, sign up at [Google AI Studio](https://aistudio.google.com) and generate an API key.
- To get an Open Exchange Rates API key, sign up at [Open Exchange Rates](https://openexchangerates.org) and obtain your App ID.

### 4. Run the App:
Start the server:
```bash
npm start
```
The app will be available at [http://localhost:3000](http://localhost:3000).

### 5. Access the App:
Open your browser and navigate to:
- **Homepage**: [http://localhost:3000](http://localhost:3000)
- **BMI Calculator**: [http://localhost:3000/bmi.html](http://localhost:3000/bmi.html)
- **Age Calculator**: [http://localhost:3000/age.html](http://localhost:3000/age.html)
- **Currency Converter**: [http://localhost:3000/currency.html](http://localhost:3000/currency.html)

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Make your changes and commit:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request.

## Acknowledgments

- Google Generative AI for providing AI-powered advice generation.
- Open Exchange Rates for real-time currency conversion data.
- Font Awesome for icons.
- Intro.js for the guided tour feature.

## Contact

For questions or feedback, feel free to reach out:
- **Email**: mzakria7599@gmail.com
- **GitHub**: [engr-muhammadzakria](https://github.com/engr-muhammadzakria)
