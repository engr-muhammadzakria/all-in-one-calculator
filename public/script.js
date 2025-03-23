document.addEventListener('DOMContentLoaded', () => {
    // Forms
    const bmiForm = document.getElementById('bmi-form');
    const ageForm = document.getElementById('age-form');
    const currencyForm = document.getElementById('currency-form');

 
// Handle unit selection for height (show/hide feet and inches inputs)
const heightUnitSelect = document.getElementById('height-unit');
const heightInput = document.getElementById('height');
const heightImperialDiv = document.getElementById('height-imperial');

if (heightUnitSelect) {
    heightUnitSelect.addEventListener('change', () => {
        if (heightUnitSelect.value === 'ft-in') {
            heightInput.style.display = 'none';
            heightImperialDiv.style.display = 'flex';
        } else {
            heightInput.style.display = 'block';
            heightImperialDiv.style.display = 'none';
            // Clear feet and inches inputs when switching away
            document.getElementById('height-feet').value = '';
            document.getElementById('height-inches').value = '';
        }
    });
}

// Handle BMI Form submission
if (bmiForm) {
    bmiForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page refresh
        const weightInput = parseFloat(document.getElementById('weight').value);
        const weightUnit = document.getElementById('weight-unit').value;
        const heightUnit = document.getElementById('height-unit').value;
        const resultDiv = document.getElementById('bmi-result');
        const calculateBtn = document.getElementById('calculate-btn');
        const loadingSpinner = document.getElementById('loading-spinner');

        // Show loading spinner and disable the button
        loadingSpinner.style.display = 'block';
        calculateBtn.disabled = true;
        calculateBtn.textContent = 'Calculating...';

        // Hide the result initially
        resultDiv.style.display = 'none';

        // Convert weight to kilograms
        let weight;
        if (weightUnit === 'kg') {
            weight = weightInput;
        } else if (weightUnit === 'lb') {
            weight = weightInput * 0.453592; // Convert pounds to kilograms
        }

        // Convert height to centimeters
        let height;
        if (heightUnit === 'cm') {
            height = parseFloat(document.getElementById('height').value);
        } else if (heightUnit === 'm') {
            height = parseFloat(document.getElementById('height').value) * 100; // Convert meters to centimeters
        } else if (heightUnit === 'ft-in') {
            const feet = parseFloat(document.getElementById('height-feet').value) || 0;
            const inches = parseFloat(document.getElementById('height-inches').value) || 0;
            const totalInches = (feet * 12) + inches;
            height = totalInches * 2.54; // Convert inches to centimeters
        }

        // Validate inputs
        if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
            resultDiv.innerHTML = 'Please enter valid weight and height values.';
            resultDiv.style.display = 'block';
            // Hide spinner and re-enable button
            loadingSpinner.style.display = 'none';
            calculateBtn.disabled = false;
            calculateBtn.textContent = 'Calculate BMI';
            return;
        }

        try {
            const response = await fetch('/api/bmi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ height, weight }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            const advice = result.data.advice;
            // Split the advice into sections based on major headings
            const sections = advice.split(/(?=<h2>)/g);
            let formattedAdvice = '';

           // Process the first part (before the first <h2>) separately
           if (sections[0] && !sections[0].startsWith('<h2>')) {
            formattedAdvice += `<div class="intro">${sections[0]}</div>`;
            sections.shift();
        }

        // Process each section and wrap it in a <details> tag with lazy loading
        sections.forEach((section, index) => {
            const headingMatch = section.match(/<h2>(.*?)<\/h2>/);
            const heading = headingMatch ? headingMatch[1] : 'Section';
            const content = section.replace(/<h2>.*?<\/h2>/, '');

                // Determine the icon based on the section heading
                let icon = '';
                if (heading.includes('Cardio')) {
                    icon = '<i class="fas fa-heart"></i>';
                } else if (heading.includes('Strength')) {
                    icon = '<i class="fas fa-dumbbell"></i>';
                } else if (heading.includes('Diet')) {
                    icon = '<i class="fas fa-utensils"></i>';
                } else if (heading.includes('YouTube')) {
                    icon = '<i class="fab fa-youtube"></i>';
                } else if (heading.includes('Lifestyle')) {
                    icon = '<i class="fas fa-leaf"></i>';
                }

                // Add ARIA attributes and lazy loading
                formattedAdvice += `
                    <details aria-expanded="false" data-content="${encodeURIComponent(content)}">
                        <summary role="button" aria-controls="section-${index}" tabindex="0">${icon} ${heading}</summary>
                        <div id="section-${index}" class="section-content"></div>
                    </details>
                `;
            });

            // Add a special class to the disclaimer section
            formattedAdvice = formattedAdvice.replace(
                /(<p><strong>Disclaimer:<\/strong>.*?<\/p>)/,
                '<div class="disclaimer">$1</div>'
            );

            // Render the advice with the Share button
            resultDiv.innerHTML = `
                <p><strong>BMI:</strong> ${result.data.bmi}</p>
                <div>${formattedAdvice}</div>
                <button id="share-advice" class="share-btn">Share Advice</button>
            `;
            resultDiv.style.display = 'block'; // Show the result

            // Add lazy loading for section content
            document.querySelectorAll('.bmi-result details').forEach(detail => {
                detail.addEventListener('toggle', function () {
                    if (this.open) {
                        const contentDiv = this.querySelector('.section-content');
                        if (!contentDiv.innerHTML) {
                            contentDiv.innerHTML = decodeURIComponent(this.dataset.content);
                        }
                        this.setAttribute('aria-expanded', 'true');
                    } else {
                        this.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // Add event listener for the Share button
            document.getElementById('share-advice').addEventListener('click', () => {
                const adviceText = resultDiv.innerText; // Get plain text for sharing
                const shareData = {
                    title: 'My BMI Advice',
                    text: adviceText,
                    url: window.location.href,
                };

                if (navigator.share) {
                    // Use Web Share API if available
                    navigator.share(shareData)
                        .then(() => console.log('Shared successfully'))
                        .catch(err => console.error('Error sharing:', err));
                } else {
                    // Fallback: Copy to clipboard
                    navigator.clipboard.writeText(adviceText).then(() => {
                        alert('Advice copied to clipboard! You can paste it to share.');
                    });
                }
            });
        } catch (error) {
            console.error('Error calculating BMI:', error);
            resultDiv.innerHTML = 'Error calculating BMI. Please try again.';
            resultDiv.style.display = 'block';
        } finally {
            // Hide spinner and re-enable button regardless of success or failure
            loadingSpinner.style.display = 'none';
            calculateBtn.disabled = false;
            calculateBtn.textContent = 'Calculate BMI';
        }
    });
}
// Handle Age Form submission
if (ageForm) {
    ageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const birthdate = document.getElementById('birthdate').value;
        const resultDiv = document.getElementById('age-result');
        const calculateBtn = document.getElementById('calculate-btn');
        const loadingSpinner = document.getElementById('loading-spinner');

        // Show loading spinner and disable the button
        loadingSpinner.style.display = 'block';
        calculateBtn.disabled = true;
        calculateBtn.textContent = 'Calculating...';

        // Hide the result initially
        resultDiv.style.display = 'none';

        // Validate birthdate
        const birthDate = new Date(birthdate);
        const today = new Date();
        if (isNaN(birthDate.getTime()) || birthDate > today) {
            resultDiv.innerHTML = 'Please enter a valid birthdate in the past.';
            resultDiv.style.display = 'block';
            loadingSpinner.style.display = 'none';
            calculateBtn.disabled = false;
            calculateBtn.textContent = 'Calculate Age';
            return;
        }

        try {
            const response = await fetch('/api/age', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ birthdate }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to calculate age.');
            }

            const advice = result.data.advice;
            // Split the advice into sections based on major headings
            const sections = advice.split(/(?=<h2>)/g);
            let formattedAdvice = '';

            // Process the first part (before the first <h2>) separately
            if (sections[0] && !sections[0].startsWith('<h2>')) {
                formattedAdvice += `<div class="intro">${sections[0]}</div>`;
                sections.shift();
            }

            // Process each section and wrap it in a <details> tag with lazy loading
            sections.forEach((section, index) => {
                const headingMatch = section.match(/<h2>(.*?)<\/h2>/);
                const heading = headingMatch ? headingMatch[1] : 'Section';
                const content = section.replace(/<h2>.*?<\/h2>/, '');

                // Determine the icon based on the section heading
                let icon = '';
                if (heading.includes('Life Advice')) {
                    icon = '<i class="fas fa-book"></i>';
                } else if (heading.includes('Career')) {
                    icon = '<i class="fas fa-briefcase"></i>';
                } else if (heading.includes('Skills')) {
                    icon = '<i class="fas fa-laptop-code"></i>';
                } else if (heading.includes('Health')) {
                    icon = '<i class="fas fa-heartbeat"></i>';
                } else if (heading.includes('Hobbies')) {
                    icon = '<i class="fas fa-paint-brush"></i>';
                }

                // Add ARIA attributes and lazy loading
                formattedAdvice += `
                    <details aria-expanded="false" data-content="${encodeURIComponent(content)}">
                        <summary role="button" aria-controls="section-${index}" tabindex="0">${icon} ${heading}</summary>
                        <div id="section-${index}" class="section-content"></div>
                    </details>
                `;
            });

            // Add a special class to the disclaimer section
            formattedAdvice = formattedAdvice.replace(
                /(<p><strong>Disclaimer:<\/strong>.*?<\/p>)/,
                '<div class="disclaimer">$1</div>'
            );

            // Render the advice with the Share button
            resultDiv.innerHTML = `
                <p><strong>Age:</strong> ${result.data.age}</p>
                <div>${formattedAdvice}</div>
                <button id="share-advice" class="share-btn">Share Advice</button>
            `;
            resultDiv.style.display = 'block';

            // Add lazy loading for section content
            document.querySelectorAll('.age-result details').forEach(detail => {
                detail.addEventListener('toggle', function () {
                    if (this.open) {
                        const contentDiv = this.querySelector('.section-content');
                        if (!contentDiv.innerHTML) {
                            contentDiv.innerHTML = decodeURIComponent(this.dataset.content);
                        }
                        this.setAttribute('aria-expanded', 'true');
                    } else {
                        this.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // Add event listener for the Share button
            document.getElementById('share-advice').addEventListener('click', () => {
                const adviceText = resultDiv.innerText;
                const shareData = {
                    title: 'My Age Advice',
                    text: adviceText,
                    url: window.location.href,
                };

                if (navigator.share) {
                    navigator.share(shareData)
                        .then(() => console.log('Shared successfully'))
                        .catch(err => console.error('Error sharing:', err));
                } else {
                    navigator.clipboard.writeText(adviceText).then(() => {
                        alert('Advice copied to clipboard! You can paste it to share.');
                    });
                }
            });
        } catch (error) {
            console.error('Error calculating age:', error);
            resultDiv.innerHTML = error.message || 'Error calculating age. Please try again.';
            resultDiv.style.display = 'block';
        } finally {
            // Hide spinner and re-enable button
            loadingSpinner.style.display = 'none';
            calculateBtn.disabled = false;
            calculateBtn.textContent = 'Calculate Age';
        }
    });
}

// Handle Currency Form submission
if (currencyForm) {
    currencyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        const resultDiv = document.getElementById('currency-result');
        const convertBtn = document.getElementById('convert-btn');
        const loadingSpinner = document.getElementById('loading-spinner');

        // Show loading spinner and disable the button
        loadingSpinner.style.display = 'block';
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';

        // Hide the result initially
        resultDiv.classList.remove('visible');

        // Validate inputs
        if (isNaN(amount) || amount <= 0) {
            resultDiv.innerHTML = 'Please enter a valid amount greater than 0.';
            resultDiv.classList.add('visible');
            loadingSpinner.style.display = 'none';
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert';
            return;
        }

        if (!from || !to) {
            resultDiv.innerHTML = 'Please select both "From" and "To" currencies.';
            resultDiv.classList.add('visible');
            loadingSpinner.style.display = 'none';
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert';
            return;
        }

        try {
            const response = await fetch('/api/currency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, from, to }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to convert currency.');
            }

            const advice = result.advice;
            // Split the advice into sections based on major headings
            const sections = advice.split(/(?=<h2>)/g);
            let formattedAdvice = '';

            // Process the first part (before the first <h2>) separately
            if (sections[0] && !sections[0].startsWith('<h2>')) {
                formattedAdvice += `<div class="intro">${sections[0]}</div>`;
                sections.shift();
            }

            // Process each section and wrap it in a <details> tag with lazy loading
            sections.forEach((section, index) => {
                const headingMatch = section.match(/<h2>(.*?)<\/h2>/);
                const heading = headingMatch ? headingMatch[1] : `Section ${index + 1}`;
                const content = section.replace(/<h2>.*?<\/h2>/, '');

                // Determine the icon based on the section heading (case-insensitive)
                let icon = '';
                const headingLower = heading.toLowerCase();
                if (headingLower.includes('exchange rate prediction')) {
                    icon = '<i class="fas fa-chart-line"></i>';
                } else if (headingLower.includes('travel tips')) {
                    icon = '<i class="fas fa-plane"></i>';
                } else if (headingLower.includes('economic factors')) {
                    icon = '<i class="fas fa-money-bill-wave"></i>';
                } else if (headingLower.includes('disclaimer')) {
                    icon = '<i class="fas fa-exclamation-circle"></i>';
                } else {
                    icon = '<i class="fas fa-info-circle"></i>'; // Default icon
                }

                // Add ARIA attributes and lazy loading
                formattedAdvice += `
                    <details aria-expanded="false" data-content="${encodeURIComponent(content)}">
                        <summary role="button" aria-controls="section-${index}" tabindex="0">${icon} ${heading}</summary>
                        <div id="section-${index}" class="section-content"></div>
                    </details>
                `;
            });

            // Add a special class to the disclaimer section
            formattedAdvice = formattedAdvice.replace(
                /(<p><strong>Disclaimer:<\/strong>.*?<\/p>)/,
                '<div class="disclaimer">$1</div>'
            );

            // Render the result with the Share button
            resultDiv.innerHTML = `
                <p><strong>Converted Amount:</strong> ${result.convertedAmount} ${to}</p>
                <div>${formattedAdvice}</div>
                <button id="share-advice" class="share-btn">Share Advice</button>
            `;
            resultDiv.classList.add('visible');

            // Add lazy loading for section content
            document.querySelectorAll('.currency-result details').forEach(detail => {
                detail.addEventListener('toggle', function () {
                    if (this.open) {
                        const contentDiv = this.querySelector('.section-content');
                        if (!contentDiv.innerHTML) {
                            const content = decodeURIComponent(this.dataset.content);
                            contentDiv.innerHTML = content;
                        }
                        this.setAttribute('aria-expanded', 'true');
                    } else {
                        this.setAttribute('aria-expanded', 'false');
                    }
                });
            });

            // Add event listener for the Share button
            document.getElementById('share-advice').addEventListener('click', () => {
                const adviceText = resultDiv.innerText;
                const shareData = {
                    title: 'My Currency Conversion Advice',
                    text: adviceText,
                    url: window.location.href,
                };

                if (navigator.share) {
                    navigator.share(shareData)
                        .then(() => console.log('Shared successfully'))
                        .catch(err => console.error('Error sharing:', err));
                } else {
                    navigator.clipboard.writeText(adviceText).then(() => {
                        alert('Advice copied to clipboard! You can paste it to share.');
                    });
                }
            });
        } catch (error) {
            console.error('Error converting currency:', error);
            resultDiv.innerHTML = error.message || 'Error converting currency. Please try again.';
            resultDiv.classList.add('visible');
        } finally {
            // Hide spinner and re-enable button
            loadingSpinner.style.display = 'none';
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert';
        }
    });
}

 

    console.log("All-in-One Calculator App loaded");
});