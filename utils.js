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
