document.addEventListener('DOMContentLoaded', function() {
    const weekTabs = document.getElementById('week-tabs');
    const scheduleTable = document.getElementById('schedule-table');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');

    if (!weekTabs || !scheduleTable || !loadingElement || !errorElement) {
        console.error('One or more required elements are missing from the DOM');
        return;
    }

    const weekDates = [
        { start: "Oct 21", end: "Oct 27" },
        { start: "Oct 28", end: "Nov 3" },
        { start: "Nov 4", end: "Nov 10" },
        { start: "Nov 11", end: "Nov 17" },
        { start: "Nov 18", end: "Nov 24" },
        { start: "Nov 25", end: "Dec 1" },
        { start: "Dec 2", end: "Dec 15" },
        { start: "Dec 16", end: "Dec 22" },
        { start: "Dec 23", end: "Dec 29" },
        { start: "Dec 30", end: "Jan 5" },
        { start: "Jan 6", end: "Jan 12" },
        { start: "Jan 13", end: "Jan 19" },
        { start: "Jan 20", end: "Jan 26" },
        { start: "Jan 27", end: "Feb 2" },
        { start: "Feb 3", end: "Feb 9" },
        { start: "Feb 10", end: "Feb 23" },
        { start: "Feb 24", end: "Mar 2" },
        { start: "Mar 3", end: "Mar 9" },
        { start: "Mar 10", end: "Mar 16" },
        { start: "Mar 17", end: "Mar 23" },
    ];
    function createWeekTabs() {
        const fragment = document.createDocumentFragment();
        weekDates.forEach((week, index) => {
            const tab = document.createElement('button');
            tab.textContent = `Week ${index + 1} (${week.start} - ${week.end})`;
            tab.addEventListener('click', () => loadWeekSchedule(index + 1));
            fragment.appendChild(tab);
        });
        weekTabs.appendChild(fragment);
    }

    function loadWeekSchedule(weekNumber) {
        highlightActiveTab(weekNumber);
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        scheduleTable.innerHTML = '';

        fetch(`nba_schedule/nba_scheduleW${weekNumber}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                loadingElement.style.display = 'none';
                createScheduleTable(data, weekNumber);
            })
            .catch(error => {
                console.error('Error loading schedule:', error);
                loadingElement.style.display = 'none';
                errorElement.textContent = `Error loading schedule for week ${weekNumber}. Please try again later.`;
                errorElement.style.display = 'block';
            });
    }

    function createScheduleTable(data, weekNumber) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
    
        // Create header row
        const headerRow = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
    
        // Create body rows
        data.forEach(row => {
            const tr = document.createElement('tr');
            let isTeamRow = false;
            Object.entries(row).forEach(([key, value]) => {
                const td = document.createElement('td');
                if (key === 'Team' && typeof value === 'string' && value.trim() !== '') {
                    if (value === 'Team' || value.startsWith('# Games Played')) {
                        td.textContent = value;
                        isTeamRow = true;
                    } else {
                        td.textContent = value; // Simply set the text content to the team name
                    }
                } else {
                    td.textContent = value;
                }
                tr.appendChild(td);
            });
    
            if (isTeamRow) {
                tr.classList.add('bold-header');
            }
            tbody.appendChild(tr);
        });
    
        table.appendChild(thead);
        table.appendChild(tbody);
        scheduleTable.innerHTML = '';
        scheduleTable.appendChild(table);
    }

function highlightActiveTab(weekNumber) {
    const tabs = weekTabs.getElementsByTagName('button');
    Array.from(tabs).forEach((tab, index) => {
        if (index + 1 === weekNumber) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

    createWeekTabs();
    loadWeekSchedule(1); // Load Week 1 by default
});
// Add this function to your existing JavaScript
function adjustForMobile() {
    if (window.innerWidth <= 768) {
        const table = document.getElementById('schedule-table');
        if (table) {
            const headerRow = table.querySelector('tr');
            if (headerRow) {
                const firstCell = headerRow.cells[0];
                firstCell.style.position = 'sticky';
                firstCell.style.left = '0';
                firstCell.style.backgroundColor = '#fff';
                firstCell.style.zIndex = '1';
            }

            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const firstCell = row.cells[0];
                if (firstCell) {
                    firstCell.style.position = 'sticky';
                    firstCell.style.left = '0';
                    firstCell.style.backgroundColor = '#fff';
                    firstCell.style.zIndex = '1';
                }
            });
        }
    }
}

// Call this function after loading the schedule
window.addEventListener('load', adjustForMobile);
window.addEventListener('resize', adjustForMobile);

