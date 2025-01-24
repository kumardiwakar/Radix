var config = {
    cUrl: 'https://api.countrystatecity.in/v1/countries',
    ckey: 'eHg5WkM5VzhrZmgzTmpadm9YejZDZjhLYTlvVFFDOURuMWo1aE9sMQ=='
}

var countrySelect = document.querySelector('.country'),
    stateSelect = document.querySelector('.state'),
    citySelect = document.querySelector('.city');

function loadCountries() {
    let apiEndPoint = config.cUrl;
    countrySelect.innerHTML = '<option value="">Select Country</option>'; // Reset options
    fetch(apiEndPoint, { headers: { "X-CSCAPI-KEY": config.ckey } })
        .then(response => response.json())
        .then(data => {
            data.forEach(country => {
                const option = document.createElement('option');
                option.value = country.name; // Set the country name as the value
                option.textContent = country.name; // Display the country name
                countrySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading countries:', error));

    // Disable dependent dropdowns initially
    stateSelect.disabled = true;
    citySelect.disabled = true;
    stateSelect.style.pointerEvents = 'none';
    citySelect.style.pointerEvents = 'none';
}

function loadStates() {
    stateSelect.disabled = false;
    citySelect.disabled = true;
    stateSelect.style.pointerEvents = 'auto';
    citySelect.style.pointerEvents = 'none';

    const selectedCountry = countrySelect.value; // Get the selected country name

    stateSelect.innerHTML = '<option value="">Select State</option>'; // Reset options
    citySelect.innerHTML = '<option value="">Select City</option>'; // Reset city options

    // Get the country code from the API using its name
    fetch(config.cUrl, { headers: { "X-CSCAPI-KEY": config.ckey } })
        .then(response => response.json())
        .then(data => {
            const country = data.find(c => c.name === selectedCountry); // Find the country by name
            if (!country) return; // Exit if no matching country is found

            // Fetch states for the selected country
            fetch(`${config.cUrl}/${country.iso2}/states`, { headers: { "X-CSCAPI-KEY": config.ckey } })
                .then(response => response.json())
                .then(states => {
                    states.forEach(state => {
                        const option = document.createElement('option');
                        option.value = state.name; // Set the state name as the value
                        option.textContent = state.name; // Display the state name
                        stateSelect.appendChild(option);
                    });
                })
                .catch(error => console.error('Error loading states:', error));
        })
        .catch(error => console.error('Error finding country:', error));
}

function loadCities() {
    citySelect.disabled = false;
    citySelect.style.pointerEvents = 'auto';

    const selectedCountry = countrySelect.value; // Get the selected country name
    const selectedState = stateSelect.value; // Get the selected state name

    citySelect.innerHTML = '<option value="">Select City</option>'; // Reset city options

    // Get the country code from the API using its name
    fetch(config.cUrl, { headers: { "X-CSCAPI-KEY": config.ckey } })
        .then(response => response.json())
        .then(data => {
            const country = data.find(c => c.name === selectedCountry); // Find the country by name
            if (!country) return; // Exit if no matching country is found

            // Fetch states for the selected country
            fetch(`${config.cUrl}/${country.iso2}/states`, { headers: { "X-CSCAPI-KEY": config.ckey } })
                .then(response => response.json())
                .then(states => {
                    const state = states.find(s => s.name === selectedState); // Find the state by name
                    if (!state) return; // Exit if no matching state is found

                    // Fetch cities for the selected state
                    fetch(`${config.cUrl}/${country.iso2}/states/${state.iso2}/cities`, { headers: { "X-CSCAPI-KEY": config.ckey } })
                        .then(response => response.json())
                        .then(cities => {
                            cities.forEach(city => {
                                const option = document.createElement('option');
                                option.value = city.name; // Set the city name as the value
                                option.textContent = city.name; // Display the city name
                                citySelect.appendChild(option);
                            });
                        })
                        .catch(error => console.error('Error loading cities:', error));
                })
                .catch(error => console.error('Error loading states:', error));
        })
        .catch(error => console.error('Error finding country:', error));
}

// Event listeners to trigger loading of states and cities
countrySelect.addEventListener('change', loadStates);
stateSelect.addEventListener('change', loadCities);

// Load countries on page load
window.onload = loadCountries;