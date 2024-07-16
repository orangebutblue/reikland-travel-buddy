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
    const existingPopup = document.querySelector('.popup');

    if (existingPopup) {
        document.body.removeChild(existingPopup);
    }

    const popup = document.createElement('div');
    popup.classList.add('popup', 'box');

    const seasons = ['spring', 'summer', 'autumn', 'winter'];
    const seasonDropdown = document.createElement('div');
    seasonDropdown.classList.add('select');
    const selectElement = document.createElement('select');
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season.toLowerCase();
        option.textContent = season.charAt(0).toUpperCase() + season.slice(1);
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
    buyButton.addEventListener('click', () => {
        resultsContainer.innerHTML = '';
        attemptBuy(locName, popup);
    });

    const sellButton = document.createElement('button');
    sellButton.classList.add('button', 'is-primary');
    sellButton.textContent = 'Attempt Sell';
    sellButton.addEventListener('click', () => attemptSell(locName, popup));

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
