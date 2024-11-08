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
                        const container = document.createElement('div');
                        container.style.display = 'flex';
                        container.style.alignItems = 'center';

                        const logo = document.createElement('img');
                        logo.src = getLogoUrl(value);
                        logo.alt = `${value} logo`;
                        logo.style.width = '30px';
                        logo.style.marginRight = '10px';
                        container.appendChild(logo);

                        container.appendChild(document.createTextNode(value));
                        td.appendChild(container);
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

    // Add this function to get the logo URL
    function getLogoUrl(teamName) {
        const teamAbbreviations = {
            'Atlanta Hawks': 'ATL',
            'Boston Celtics': 'BOS',
            'Brooklyn Nets': 'BKN',
            'Charlotte Hornets': 'CHA',
            'Chicago Bulls': 'CHI',
            'Cleveland Cavaliers': 'CLE',
            'Dallas Mavericks': 'DAL',
            'Denver Nuggets': 'DEN',
            'Detroit Pistons': 'DET',
            'Golden State Warriors': 'GS',
            'Houston Rockets': 'HOU',
            'Indiana Pacers': 'IND',
            'Los Angeles Clippers': 'LAC',
            'Los Angeles Lakers': 'LAL',
            'Memphis Grizzlies': 'MEM',
            'Miami Heat': 'MIA',
            'Milwaukee Bucks': 'MIL',
            'Minnesota Timberwolves': 'MIN',
            'New Orleans Pelicans': 'NO',
            'New York Knicks': 'NY',
            'Oklahoma City Thunder': 'OKC',
            'Orlando Magic': 'ORL',
            'Philadelphia 76ers': 'PHI',
            'Phoenix Suns': 'PHO',
            'Portland Trail Blazers': 'POR',
            'Sacramento Kings': 'SAC',
            'San Antonio Spurs': 'SA',
            'Toronto Raptors': 'TOR',
            'Utah Jazz': 'UTA',
            'Washington Wizards': 'WAS'
        };

        const abbreviation = teamAbbreviations[teamName];
        if (abbreviation) {
            return `./logos/${abbreviation}.png`;
        } else {
            console.warn(`No logo found for team: ${teamName}`);
            return './logos/default.png';  // You should add a default logo image
        }
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