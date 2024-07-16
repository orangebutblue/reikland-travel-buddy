function CSVToArray(strData, strDelimiter = ',') {
    const objPattern = new RegExp((
        `(${strDelimiter}|\\r?\\n|\\r|^)` +
        `(?:"([^"]*(?:""[^"]*)*)"|([^"\\${strDelimiter}\\r\\n]*))`
    ), "gi");

    const arrData = [[]];
    let arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {
        const strMatchedDelimiter = arrMatches[1];

        if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
            arrData.push([]);
        }

        const strMatchedValue = arrMatches[2] ?
            arrMatches[2].replace(new RegExp('""', 'g'), '"') :
            arrMatches[3];

        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return arrData;
}

function createTableRow(header, value) {
    return `
        <tr>
            <th>${header}</th>
            <td>${value}</td>
        </tr>`;
}

const wealthDescriptions = {
    0: 'Desolate',
    1: 'Squalid',
    2: 'Poor',
    3: 'Average',
    4: 'Bustling',
    5: 'Prosperous'
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
    CS: 6,
    C: 5,
    T: 4,
    ST: 3,
    V: 2,
    F: 2,
    M: 1
};