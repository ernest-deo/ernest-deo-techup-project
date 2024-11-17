let allDepthCharts = {};

function createDepthChart(team, players) {
    const depthChart = document.createElement('div');
    depthChart.classList.add('depth-chart');

    const teamHeader = document.createElement('div');
    teamHeader.classList.add('team-header');

    const teamName = document.createElement('h2');
    teamName.textContent = team;
    teamName.classList.add('team-name');

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

function displayDepthCharts(data) {
    const container = document.getElementById('depth-charts-container');
    container.innerHTML = '';

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