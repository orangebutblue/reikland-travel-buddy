function createTableRow(header, value) {
    return `
        <tr>
            <th>${header}</th>
            <td>${value}</td>
        </tr>`;
}

const wealthDescriptions = {
    0: 'Desolate',
    1: 'Impoverished',
    2: 'Poor',
    3: 'Average',
    4: 'Wealthy',
    5: 'Very Rich'
};

const sizeDescriptions = {
    CS: 'City State',
    C: 'City',
    T: 'Town',
    ST: 'Small Town',
    V: 'Village',
    F: 'Fort',
    M: 'Mine'
};

const sizeValues = {
    CS: 6,  // City State
    C: 5,   // City
    T: 4,   // Town
    ST: 3,  // Small Town
    V: 2,   // Village
    F: 2,   // Fort
    M: 1    // Mine
};

function createLocationDetails(locName, locInfo) {
    const garrison = locInfo.garrison !== '-' ? locInfo.garrison : 'None';
    const militia = locInfo.militia !== '-' ? locInfo.militia : 'None';
    const sources = locInfo.source.map(src => `<a href="#" onclick="filterLocations('source', '${src}')">${src}</a>`).join(', ');
    const sizeDescription = sizeDescriptions[locInfo.size] || locInfo.size;

    return `
        <table class="table is-fullwidth">
            <tbody>
                ${createTableRow('Size', `<a href="#" onclick="filterLocations('size', '${locInfo.size}')">${sizeDescription}</a>`)}
                ${createTableRow('Ruler', `<a href="#" onclick="filterLocations('ruler', '${locInfo.ruler}')">${locInfo.ruler}</a>`)}
                ${createTableRow('Population', locInfo.population)}
                ${createTableRow('Wealth', locInfo.wealth)}
                ${createTableRow('Source', `${sources} <button class="button is-small is-rounded is-light" onclick="refreshSource(event, '${locName}')"><i class="fas fa-sync-alt"></i></button>`)}
                ${createTableRow('Garrison', garrison)}
                ${createTableRow('Militia', militia)}
                ${createTableRow('Fief', locInfo.fief)}
                ${createTableRow('Notes', locInfo.notes)}
            </tbody>
        </table>`;
}

function refreshSource(event, locName) {
    const button = event.currentTarget;
    const popup = document.createElement('div');
    popup.classList.add('popup', 'box');

    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const seasonDropdown = document.createElement('div');
    seasonDropdown.classList.add('select');
    const selectElement = document.createElement('select');
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.toLowerCase();
        option.textContent = season;
        selectElement.appendChild(option);
    });
    seasonDropdown.appendChild(selectElement);

    const wealthDescription = wealthDescriptions[locations[locName].wealth];
    const sizeDescription = sizeDescriptions[locations[locName].size] || locations[locName].size;
    const wealthText = document.createElement('p');
    wealthText.textContent = `${locName} is a ${wealthDescription} ${sizeDescription}`;

    const buyButton = document.createElement('button');
    buyButton.classList.add('button', 'is-primary', 'mr-2');
    buyButton.textContent = 'Attempt Buy';
    buyButton.addEventListener('click', () => attemptBuy(locName, popup));

    const sellButton = document.createElement('button');
    sellButton.classList.add('button', 'is-primary');
    sellButton.textContent = 'Attempt Sell';
    sellButton.disabled = true; // Placeholder for future implementation

    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'results-container';

    popup.appendChild(seasonDropdown);
    popup.appendChild(wealthText);
    popup.appendChild(buyButton);
    popup.appendChild(sellButton);
    popup.appendChild(resultsContainer);

    document.body.appendChild(popup);

    const rect = button.getBoundingClientRect();
    popup.style.position = 'absolute';
    popup.style.top = `${rect.top + window.scrollY + button.offsetHeight}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;

    function removePopup(event) {
        if (!popup.contains(event.target) && event.target !== button) {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
            document.removeEventListener('click', removePopup);
        }
    }

    setTimeout(() => document.addEventListener('click', removePopup), 0);
}

function attemptBuy(locName, popup) {
    const locInfo = locations[locName];
    const sizeValue = sizeValues[locInfo.size] || 0;  // Default to 0 if size is not found
    const wealthValue = locInfo.wealth;
    const chance = (sizeValue + wealthValue) * 10;
    const roll = Math.floor(Math.random() * 100) + 1;

    console.log(`Attempting to buy in ${locName}`);
    console.log(`Size: ${locInfo.size}, Wealth: ${locInfo.wealth}`);
    console.log(`Size Value: ${sizeValue}, Wealth Value: ${wealthValue}`);
    console.log(`Chance: ${chance}%`);
    console.log(`Roll: ${roll}`);

    const resultsContainer = popup.querySelector('#results-container');
    resultsContainer.innerHTML = '';

    if (roll <= chance) {
        // Cargo available
        const cargoType = determineCargoType(locInfo);
        const cargoSize = determineCargoSize(locInfo, sizeValue, wealthValue);
        resultsContainer.innerHTML = `
            <p class="has-text-success">Cargo available!</p>
            <p class="has-text-info">Type: ${cargoType}</p>
            <p class="has-text-info">Size: ${cargoSize} Encumbrance Points</p>`;
        // Implement haggling here if needed
    } else {
        resultsContainer.innerHTML = '<p class="has-text-danger">No cargo available for trade.</p>';
    }
}

function determineCargoType(locInfo) {
    // Implement logic to determine the type of cargo
    // For now, returning a placeholder
    return locInfo.source.length > 0 ? locInfo.source[0] : 'Random Cargo';
}

function determineCargoSize(locInfo, sizeValue, wealthValue) {
    const baseSize = sizeValue + wealthValue;
    let roll = Math.floor(Math.random() * 100) + 1;

    console.log(`Original roll for cargo size: ${roll}`);

    if (locInfo.source.includes('Trade')) {
        const reversedRoll = parseInt(roll.toString().split('').reverse().join(''), 10);
        console.log(`Reversed roll: ${reversedRoll}`);
        roll = Math.max(roll, reversedRoll);
    }

    roll = Math.ceil(roll / 10) * 10;
    console.log(`Final roll (rounded to nearest 10): ${roll}`);

    return baseSize * roll;
}

function createLocationBox(loc, locInfo) {
    return `
        <div class="box">
            <article class="message">
                <div class="message-header" onclick="toggleDetails('${loc}')">
                    <p>${loc}</p>
                </div>
                <div id="details-${loc}" class="message-body" style="display: none;">
                    ${createLocationDetails(loc, locInfo)}
                </div>
            </article>
        </div>`;
}

function createDistanceInfo(distance, difficulty) {
    return `
        <div class="has-text-centered">
            <p>distance: ${distance}, difficulty: ${difficulty}</p>
            <p>v</p>
        </div>`;
}

function toggleDetails(id) {
    const details = document.getElementById(`details-${id}`);
    if (details.style.display === "none") {
        details.style.display = "block";
    } else {
        details.style.display = "none";
    }
}

function filterLocations(attribute, value) {
    const pathDiv = document.getElementById('path');
    pathDiv.innerHTML = '';

    Object.keys(locations).forEach(loc => {
        const locInfo = locations[loc];
        if (attribute === 'source') {
            if (!locInfo.source.includes(value)) return;
        } else if (locInfo[attribute] !== value) {
            return;
        }

        const locDetails = `
            <div class="box">
                <article class="message">
                    <div class="message-header" onclick="toggleDetails('${loc}')">
                        <p>${loc}</p>
                    </div>
                    <div id="details-${loc}" class="message-body" style="display: none;">
                        ${createLocationDetails(loc, locInfo)}
                    </div>
                </article>
            </div>`;
        pathDiv.innerHTML += locDetails;
    });
}
