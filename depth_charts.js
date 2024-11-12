let allDepthCharts = {};

function getLogoUrl(teamAbbreviation) {
    // Convert team abbreviation to uppercase and remove spaces
    const formattedAbbreviation = teamAbbreviation.replace(/\s+/g, '').toUpperCase();

    // Map full team names to abbreviations
    const teamAbbreviations = {
        'ATLANTAHAWKS': 'ATL',
        'BOSTONCELTICS': 'BOS',
        'BROOKLYNNETS': 'BKN',
        'CHARLOTTEHORNETS': 'CHA',
        'CHICAGOBULLS': 'CHI',
        'CLEVELANDCAVALIERS': 'CLE',
        'DALLASMAVERICKS': 'DAL',
        'DENVERNUGGETS': 'DEN',
        'DETROITPISTONS': 'DET',
        'GOLDENSTATEWARRIORS': 'GS',
        'HOUSTONROCKETS': 'HOU',
        'INDIANAPACERS': 'IND',
        'LACLIPPERS': 'LAC',
        'LALAKERS': 'LAL',
        'MEMPHISGRIZZLIES': 'MEM',
        'MIAMIHEAT': 'MIA',
        'MILWAUKEEBUCKS': 'MIL',
        'MINNESOTATIMBERWOLVES': 'MIN',
        'NEWORLEANSPELICANS': 'NO',
        'NEWYORKKNICKS': 'NY',
        'OKLAHOMACITYTHUNDER': 'OKC',
        'ORLANDOMAGIC': 'ORL',
        'PHILADELPHIA76ERS': 'PHI',
        'PHOENIXSUNS': 'PHO',
        'PORTLANDTRAILBLAZERS': 'POR',
        'SACRAMENTOKINGS': 'SAC',
        'SANANTONIOSPURS': 'SA',
        'TORONTORAPTORS': 'TOR',
        'UTAHJAZZ': 'UTA',
        'WASHINGTONWIZARDS': 'WAS'
    };

    // Get the correct abbreviation
    const abbreviation = teamAbbreviations[formattedAbbreviation] || formattedAbbreviation;

    // Return the URL for the logo
    return `./logos/${abbreviation}.png`;
}

function createDepthChart(team, players) {
    const depthChart = document.createElement('div');
    depthChart.classList.add('depth-chart');

    const teamHeader = document.createElement('div');
    teamHeader.classList.add('team-header');

    const teamLogo = document.createElement('img');
    teamLogo.src = getLogoUrl(team);
    teamLogo.alt = `${team} logo`;
    teamLogo.classList.add('team-logo');
    teamLogo.onerror = function() {
        this.style.display = 'none';
    };

    const teamName = document.createElement('h2');
    teamName.textContent = team;
    teamName.classList.add('team-name');

    teamHeader.appendChild(teamLogo);
    teamHeader.appendChild(teamName);
    depthChart.appendChild(teamHeader);

    const positionsContainer = document.createElement('div');
    positionsContainer.classList.add('positions-container');

    Object.entries(players).forEach(([position, playerList]) => {
        const positionElement = document.createElement('div');
        positionElement.classList.add('position');

        const positionName = document.createElement('h3');
        positionName.textContent = position;
        positionElement.appendChild(positionName);

        const playerListElement = document.createElement('ol');
        playerList.forEach((player, index) => {
            const playerItem = document.createElement('li');
            if (index === 0) {
                playerItem.classList.add('starter');
            }
            playerItem.textContent = player;
            playerListElement.appendChild(playerItem);
        });

        positionElement.appendChild(playerListElement);
        positionsContainer.appendChild(positionElement);
    });

    depthChart.appendChild(positionsContainer);
    return depthChart;
}

document.addEventListener('DOMContentLoaded', () => {
    loadDepthCharts();
});

function loadDepthCharts() {
    fetch('depth_charts.json')
        .then(response => response.json())
        .then(data => {
            allDepthCharts = data;
            displayDepthCharts(data);
        })
        .catch(error => console.error('Error loading depth charts:', error));
}

function populateTeamSelect(data) {
    const teamSelect = document.getElementById('team-select');
    Object.keys(data).forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        teamSelect.appendChild(option);
    });
}
function filterDepthCharts() {
    const selectedTeam = document.getElementById('team-select').value;
    const searchTerm = document.getElementById('player-search').value.toLowerCase();

    let filteredData = {};

    if (selectedTeam === 'all') {
        filteredData = { ...allDepthCharts };
    } else {
        filteredData[selectedTeam] = allDepthCharts[selectedTeam];
    }

    if (searchTerm) {
        Object.keys(filteredData).forEach(team => {
            const positions = filteredData[team];
            Object.keys(positions).forEach(position => {
                positions[position] = positions[position].filter(player => 
                    player.toLowerCase().includes(searchTerm)
                );
            });
            if (Object.values(positions).every(arr => arr.length === 0)) {
                delete filteredData[team];
            }
        });
    }

    displayDepthCharts(filteredData);
}

function displayDepthCharts(data) {
    const container = document.getElementById('depth-charts-container');
    container.innerHTML = '';

    if (Object.keys(data).length === 0) {
        container.innerHTML = '<p>No teams or players match the current filters.</p>';
        return;
    }

    const gridContainer = document.createElement('div');
    gridContainer.classList.add('depth-charts-grid');

    Object.entries(data).forEach(([team, players]) => {
        const chart = createDepthChart(team, players);
        gridContainer.appendChild(chart);
    });

    container.appendChild(gridContainer);
}

function adjustForMobile() {
    if (window.innerWidth <= 768) {
        const depthCharts = document.querySelectorAll('.team-depth-chart');
        depthCharts.forEach(chart => {
            chart.style.width = '100%';
        });
    }
}

window.addEventListener('load', adjustForMobile);
window.addEventListener('resize', adjustForMobile);