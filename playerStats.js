let allPlayers = [];
let currentSort = { column: null, direction: 'asc' };
let percentiles = {};
let playersSevenDays = [];
let playersFourteenDays = [];


// Map of team abbreviations to full names
const teamNames = {
    'ATL': 'Atlanta Hawks',
    'BOS': 'Boston Celtics',
    'BKN': 'Brooklyn Nets',
    'CHA': 'Charlotte Hornets',
    'CHI': 'Chicago Bulls',
    'CLE': 'Cleveland Cavaliers',
    'DAL': 'Dallas Mavericks',
    'DEN': 'Denver Nuggets',
    'DET': 'Detroit Pistons',
    'GS': 'Golden State Warriors',
    'HOU': 'Houston Rockets',
    'IND': 'Indiana Pacers',
    'LAC': 'Los Angeles Clippers',
    'LAL': 'Los Angeles Lakers',
    'MEM': 'Memphis Grizzlies',
    'MIA': 'Miami Heat',
    'MIL': 'Milwaukee Bucks',
    'MIN': 'Minnesota Timberwolves',
    'NO': 'New Orleans Pelicans',
    'NY': 'New York Knicks',
    'OKC': 'Oklahoma City Thunder',
    'ORL': 'Orlando Magic',
    'PHI': 'Philadelphia 76ers',
    'PHO': 'Phoenix Suns',
    'POR': 'Portland Trail Blazers',
    'SAC': 'Sacramento Kings',
    'SA': 'San Antonio Spurs',
    'TOR': 'Toronto Raptors',
    'UTA': 'Utah Jazz',
    'WAS': 'Washington Wizards'
};


document.addEventListener('DOMContentLoaded', loadStats);
document.getElementById('player-count-filter').addEventListener('change', filterData);
document.getElementById('team-filter').addEventListener('change', filterData);
document.getElementById('position-filter').addEventListener('change', filterData);
document.getElementById('search').addEventListener('input', filterData);
document.getElementById('min-mpg').addEventListener('input', filterData);
document.getElementById('time-period-filter').addEventListener('change', filterData);
document.querySelectorAll('#stats-table th').forEach(headerCell => {
    headerCell.addEventListener('click', () => {
        const column = headerCell.dataset.sort;
        sortTable(column);
    });
});


function loadStats() {
    Promise.all([
        fetch('playerStats.json'),
        fetch('playerStats_Seven.json'),
        fetch('playerStats_Fourteen.json')
    ])
    .then(responses => Promise.all(responses.map(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })))
    .then(([seasonData, sevenDaysData, fourteenDaysData]) => {
        console.log('Data received:', seasonData, sevenDaysData, fourteenDaysData);
        if (!seasonData || seasonData.length === 0 ||
            !sevenDaysData || sevenDaysData.length === 0 ||
            !fourteenDaysData || fourteenDaysData.length === 0) {
            throw new Error('No data available');
        }


        allPlayers = processData(seasonData);
        playersSevenDays = processData(sevenDaysData);
        playersFourteenDays = processData(fourteenDaysData);


        populateTeamFilter(allPlayers);
        filterData();
    })
    .catch(error => {
        console.error('Error:', error);
        const errorMessage = error.message === 'No data available'
            ? 'No player data is currently available. Please check back later.'
            : 'Error loading data. Please try again later.';
        document.querySelector('#stats-table tbody').innerHTML =
            `<tr><td colspan="15">${errorMessage}</td></tr>`;
        disableFilters();
    });
}


function processData(data) {
    return data
        .filter(player => player.POS && player.PLAYER && player.TEAM)
        .sort((a, b) => parseInt(a['R#']) - parseInt(b['R#']));
}


function disableFilters() { // Disable all filters when there's an error loading the data or in process of updating display data.
    const filters = ['player-count-filter', 'team-filter', 'position-filter', 'search', 'min-mpg'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.disabled = true;
        }
    });
}


function populateTeamFilter(data) {
    const teams = [...new Set(data.map(player => player.TEAM))].sort();
    const teamFilter = document.getElementById('team-filter');
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = teamNames[team] || team;
        teamFilter.appendChild(option);
    });
}


function filterData() {
    const teamFilter = document.getElementById('team-filter').value;
    const positionFilter = document.getElementById('position-filter').value;
    const searchFilter = document.getElementById('search').value.toLowerCase();
    const minMpgFilter = parseFloat(document.getElementById('min-mpg').value) || 0;
    const playerCountFilter = parseInt(document.getElementById('player-count-filter').value);
    const timePeriodFilter = document.getElementById('time-period-filter').value;


    let playersToFilter;
    switch (timePeriodFilter) {
        case 'seven':
            playersToFilter = playersSevenDays;
            break; // exits or terminate the current loop or switch statement
        case 'fourteen':
            playersToFilter = playersFourteenDays;
            break;
        default:
            playersToFilter = allPlayers;
    }


    let filteredPlayers = playersToFilter.filter(player => { // filters the players based on user-selected criteria, limits the number of displayed players, calculates new percentiles for the filtered data, and then updates the display with the filtered results.
        const playerPositions = player.POS ? player.POS.split(',').map(pos => pos.trim()) : [];
        return (
            (teamFilter === '' || player.TEAM === teamFilter) &&
            (positionFilter === '' || playerPositions.includes(positionFilter)) &&
            (player.PLAYER.toLowerCase().includes(searchFilter)) &&
            (parseFloat(player.MPG) >= minMpgFilter)
        );
    });


    filteredPlayers = filteredPlayers.slice(0, playerCountFilter); // limits the number of displayed players to the user-selected count


    console.log('Filtered players:', filteredPlayers);
    calculatePercentiles(filteredPlayers);
    displayData(filteredPlayers);
}


function calculatePercentiles(players) {
    const stats = ['FG%', 'FT%', '3PM', 'PTS', 'TREB', 'AST', 'STL', 'BLK', 'TO'];
    percentiles = {};


    stats.forEach(stat => {
        let values;
        if (stat === 'FG%' || stat === 'FT%') {
            values = players.map(player => parseFloat(player[stat])).filter(val => !isNaN(val)).sort((a, b) => a - b);
        } else {
            values = players.map(player => parseFloat(player[stat])).sort((a, b) => a - b);
        }
        percentiles[stat] = {
            min: values[0],
            max: values[values.length - 1],
            median: values[Math.floor(values.length / 2)],
            q1: values[Math.floor(values.length * 0.25)],
            q3: values[Math.floor(values.length * 0.75)]
        };
    });
}


function getColorStyle(value, stat) {
    if (!percentiles[stat]) return '';


    const { min, max, q1, median, q3 } = percentiles[stat];
    let hue, saturation, lightness;


    // Convert percentage strings to numbers for FG% and FT%
    if (stat === 'FG%' || stat === 'FT%') {
        value = parseFloat(value);
    }
    // Determine the percentile of the value
    let percentile;
    if (value <= q1) {
        percentile = (value - min) / (q1 - min) * 25;
    } else if (value <= median) {
        percentile = 25 + (value - q1) / (median - q1) * 25;
    } else if (value <= q3) {
        percentile = 50 + (value - median) / (q3 - median) * 25;
    } else {
        percentile = 75 + (value - q3) / (max - q3) * 25;
    }


    if (stat === 'TO') {
        // For TO (Turnovers), lower is better
        hue = 120 - percentile * 1.2; // 120 (green) to 0 (red)
    } else {
        // For all other stats, higher is better
        hue = percentile * 1.2; // 0 (red) to 120 (green)
    }


    // Adjust saturation and lightness for more vivid colors
    saturation = 70 + percentile * 0.3; // 70% to 100%
    lightness = 65 - Math.abs(percentile - 50) * 0.3; // 50% to 65%


    return `background-color: hsla(${hue}, ${saturation}%, ${lightness}%, 0.6);`;
}


function displayData(players) {
    if (!players || players.length === 0) {
        console.error('No players data to display');
        document.querySelector('#stats-table tbody').innerHTML =
            '<tr><td colspan="15">No players match the current filters.</td></tr>';
        return;
    }
    if (!percentiles || Object.keys(percentiles).length === 0) {
        console.error('Percentiles have not been calculated');
        return;
    }
    const tbody = document.querySelector('#stats-table tbody');
    tbody.innerHTML = '';


    const timePeriod = document.getElementById('time-period-filter').value;
    let timePeriodText;
    switch (timePeriod) {
        case 'seven':
            timePeriodText = 'Last 7 Days';
            break;
        case 'fourteen':
            timePeriodText = 'Last 14 Days';
            break;
        default:
            timePeriodText = 'Season';
    }
    document.getElementById('player-stats-title').textContent = `Top-200 Player Average Ranking (${timePeriodText})`;


    // Apply sticky classes to header cells
    const headerCells = document.querySelectorAll('#stats-table th');
    headerCells[0].classList.add('sticky-col', 'first-col');
    headerCells[1].classList.add('sticky-col', 'second-col');
    players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sticky-col first-col">${player['R#']}</td>
            <td class="sticky-col second-col">${player.PLAYER}</td>
            <td>${player.POS}</td>
            <td>${player.TEAM}</td>
            <td>${player.GP}</td>
            <td>${player.MPG}</td>
            <td style="${getColorStyle(player['FG%'], 'FG%')}">${player['FG%']}</td>
            <td style="${getColorStyle(player['FT%'], 'FT%')}">${player['FT%']}</td>
            <td style="${getColorStyle(player['3PM'], '3PM')}">${player['3PM']}</td>
            <td style="${getColorStyle(player.PTS, 'PTS')}">${player.PTS}</td>
            <td style="${getColorStyle(player.TREB, 'TREB')}">${player.TREB}</td>
            <td style="${getColorStyle(player.AST, 'AST')}">${player.AST}</td>
            <td style="${getColorStyle(player.STL, 'STL')}">${player.STL}</td>
            <td style="${getColorStyle(player.BLK, 'BLK')}">${player.BLK}</td>
            <td style="${getColorStyle(player.TO, 'TO')}">${player.TO}</td>
        `;
        tbody.appendChild(row);
    });
}


function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }


    const sortedPlayers = [...allPlayers].sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];


        if (column === 'PLAYER') {
            return currentSort.direction === 'asc'
                ? valueA.localeCompare(valueB) // localeCompare is used to sort player names alphabetically in a way that respects language-specific sorting rules
                : valueB.localeCompare(valueA);
        }


        valueA = parseFloat(valueA);
        valueB = parseFloat(valueB);


        if (isNaN(valueA)) valueA = 0;
        if (isNaN(valueB)) valueB = 0;


        return currentSort.direction === 'asc' ? valueA - valueB : valueB - valueA;
    });


    displayData(sortedPlayers);


    // Update sort indicators
    document.querySelectorAll('#stats-table th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });


    const header = document.querySelector(`th[data-sort="${column}"]`);
    header.classList.add(`sort-${currentSort.direction}`);
}
