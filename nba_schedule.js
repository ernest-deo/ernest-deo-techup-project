document.addEventListener('DOMContentLoaded', function() {
    fetch('nba_schedule_table.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('schedule-container').innerHTML = data;
            applyAdditionalStyles();
            addScrollers();
        })
        .catch(error => console.error('Error loading schedule table:', error));
});

function applyAdditionalStyles() {
    const table = document.querySelector('table');
    if (!table) {
        console.error('Table not found');
        return;
    }

    // Map of team abbreviations to correct uppercase filenames for .png logos
    const teamAbbreviations = {
        'ATL': 'ATL', // Atlanta Hawks
        'BOS': 'BOS', // Boston Celtics
        'BKN': 'BKN', // Brooklyn Nets
        'CHA': 'CHA', // Charlotte Hornets
        'CHI': 'CHI', // Chicago Bulls
        'CLE': 'CLE', // Cleveland Cavaliers
        'DAL': 'DAL', // Dallas Mavericks
        'DEN': 'DEN', // Denver Nuggets
        'DET': 'DET', // Detroit Pistons
        'GSW': 'GSW', // Golden State Warriors
        'HOU': 'HOU', // Houston Rockets
        'IND': 'IND', // Indiana Pacers
        'LAC': 'LAC', // Los Angeles Clippers
        'LAL': 'LAL', // Los Angeles Lakers
        'MEM': 'MEM', // Memphis Grizzlies
        'MIA': 'MIA', // Miami Heat
        'MIL': 'MIL', // Milwaukee Bucks
        'MIN': 'MIN', // Minnesota Timberwolves
        'NOP': 'NO',  // New Orleans Pelicans
        'NYK': 'NYK', // New York Knicks
        'OKC': 'OKC', // Oklahoma City Thunder
        'ORL': 'ORL', // Orlando Magic
        'PHI': 'PHI', // Philadelphia 76ers
        'PHO': 'PHO', // Phoenix Suns
        'POR': 'POR', // Portland Trail Blazers
        'SAC': 'SAC', // Sacramento Kings
        'SAS': 'SAS', // San Antonio Spurs
        'TOR': 'TOR', // Toronto Raptors
        'UTA': 'UTA', // Utah Jazz
        'WAS': 'WAS'  // Washington Wizards
    };

    // Apply styles to cells
    table.querySelectorAll('td').forEach(cell => {
        if (cell.textContent.trim() !== '') {
            let teamAbbr = cell.textContent.trim().toUpperCase();
            teamAbbr = teamAbbreviations[teamAbbr] || teamAbbr;  // Use mapping if available
            const logoUrl = `/workspaces/ernest-deo-techup-project/logos/${teamAbbr}.png`;

            console.log(`Attempting to load logo for team: ${teamAbbr}`);
            console.log(`Logo URL: ${logoUrl}`);

            fetch(logoUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.blob();
                })
                .then(blob => {
                    const objectURL = URL.createObjectURL(blob);
                    cell.style.backgroundImage = `url('${objectURL}')`;
                    cell.style.backgroundSize = '30px';
                    cell.style.backgroundRepeat = 'no-repeat';
                    cell.style.backgroundPosition = 'center left 5px';
                    cell.style.paddingLeft = '40px';
                    cell.style.color = 'black';
                    console.log(`Successfully loaded logo for team: ${teamAbbr}`);
                })
                .catch(error => {
                    console.error(`Failed to load logo for team ${teamAbbr}:`, error);
                    // Fallback: display team abbreviation if logo fails to load
                    cell.textContent = teamAbbr;
                    cell.style.paddingLeft = '10px';
                });
        }
    });
}

function addScrollers() {
    const container = document.getElementById('schedule-container');
    if (!container) {
        console.error('Schedule container not found');
        return;
    }

    // Create week selector
    const weekSelector = document.createElement('select');
    weekSelector.id = 'weekSelector';
    for (let i = 1; i <= 26; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Week ${i}`;
        weekSelector.appendChild(option);
    }
    container.insertBefore(weekSelector, container.firstChild);

    // Create scroll container
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'scroll-container';
    container.insertBefore(scrollContainer, container.querySelector('table'));
    scrollContainer.appendChild(container.querySelector('table'));

    // Add event listener to week selector
    weekSelector.addEventListener('change', function() {
        const selectedWeek = parseInt(this.value);
        const table = container.querySelector('table');
        const rows = table.querySelectorAll('tr');

        rows.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            const weekCell = row.querySelector('td:first-child');
            if (weekCell) {
                const weekNumber = parseInt(weekCell.textContent);
                row.style.display = (weekNumber === selectedWeek) ? '' : 'none';
            }
        });
    });
}