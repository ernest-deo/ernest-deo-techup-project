let allDepthCharts = {};

function getLogoUrl(teamAbbreviation) {
    // Assuming your logos are in a 'logos' folder at the root of your project
    return `./logos/${teamAbbreviation.toUpperCase()}.png`;
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
    // Add an error handler in case the logo doesn't load
    teamLogo.onerror = function() {
        this.style.display = 'none';
    };

    const teamName = document.createElement('h2');
    teamName.textContent = team;
    teamName.classList.add('team-name');

    teamHeader.appendChild(teamLogo);
    teamHeader.appendChild(teamName);
    depthChart.appendChild(teamHeader);

    // ... rest of the function remains the same
}
document.addEventListener('DOMContentLoaded', () => {
    loadDepthCharts();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('team-select').addEventListener('change', filterDepthCharts);
    document.getElementById('player-search').addEventListener('input', filterDepthCharts);
}

function loadDepthCharts() {
    fetch('depth_charts.json')
        .then(response => response.json())
        .then(data => {
            allDepthCharts = data;
            populateTeamSelect(data);
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

    Object.entries(data).forEach(([team, players]) => {
        const chart = createDepthChart(team, players);
        container.appendChild(chart);
    });
}