document.addEventListener('DOMContentLoaded', function() {
    fetch('nba_schedule_with_styles.json')
        .then(response => response.json())
        .then(data => {
            displaySchedule(data);
        })
        .catch(error => console.error('Error:', error));
});

/**
 * Displays the NBA schedule data in a table format with applied styles.
 * 
 * @param {Object} data - The schedule data object containing columns, data, and styles.
 * @param {string[]} data.columns - An array of column names for the table headers.
 * @param {Object[]} data.data - An array of objects, each representing a row in the table.
 * @param {Object} data.styles - An object containing style information for specific cells.
 * @returns {void} This function does not return a value, it directly manipulates the DOM.
 */
function displaySchedule(data) {
    const table = document.getElementById('schedule-table');
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    // Create table headers
    data.columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
    });

    // Create table body
    const tbody = table.createTBody();
    data.data.forEach((row, rowIndex) => {
        const tr = tbody.insertRow();
        data.columns.forEach((column, columnIndex) => {
            const td = tr.insertCell();
            td.textContent = row[column] || '';

            // Apply styles if available
            const cellStyle = data.styles[`${String.fromCharCode(65 + columnIndex)}${rowIndex + 2}`];
            if (cellStyle) {
                if (cellStyle.font.bold) td.style.fontWeight = 'bold';
                if (cellStyle.font.color) td.style.color = cellStyle.font.color;
                if (cellStyle.fill.bgcolor) td.style.backgroundColor = cellStyle.fill.bgcolor;
                if (cellStyle.alignment) td.style.textAlign = cellStyle.alignment;
            }
        });
    });
}