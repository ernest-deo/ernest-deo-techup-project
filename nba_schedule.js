document.addEventListener('DOMContentLoaded', function() {
    const main = document.querySelector('main') || document.createElement('main');
    main.className = 'main-container';
    main.innerHTML = ''; // Clear existing content

    const h1 = document.createElement('h1');
    h1.textContent = 'NBA Schedule';
    main.appendChild(h1);

    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading';
    loadingElement.textContent = 'Loading schedule...';
    main.appendChild(loadingElement);

    const errorElement = document.createElement('div');
    errorElement.id = 'error';
    errorElement.style.display = 'none';
    errorElement.style.color = 'red';
    main.appendChild(errorElement);

    const tableContainer = document.createElement('div');
    tableContainer.id = 'schedule-table-container';
    main.appendChild(tableContainer);

    if (!document.querySelector('main')) {
        document.body.appendChild(main);
    }

    // Load schedule data
    fetch('nba_schedule.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loadingElement.style.display = 'none';

            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('Invalid data format');
            }
            const table = document.createElement('table');
            table.id = 'schedule-table';

            // Create table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            Object.keys(data[0]).forEach(key => {
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table body
            const tbody = document.createElement('tbody');
            data.forEach(row => {
                const tr = document.createElement('tr');
                Object.values(row).forEach(value => {
                    const td = document.createElement('td');
                    td.textContent = value;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            tableContainer.appendChild(table);
        })
        .catch(error => {
            console.error('Error loading schedule:', error);
            loadingElement.style.display = 'none';
            errorElement.textContent = 'Error loading schedule. Please try again later.';
            errorElement.style.display = 'block';
        });
});