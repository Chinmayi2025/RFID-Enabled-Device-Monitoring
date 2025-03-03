// Initialize the Temperature Chart
const temperatureCtx = document.getElementById('temperatureChart').getContext('2d');
const temperatureChart = new Chart(temperatureCtx, {
    type: 'line',
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Temperature (°C)',
            data: [22, 23, 24, 23, 25, 24, 26],
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.2)',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true }
        },
        scales: {
            x: { title: { display: true, text: 'Days of the Week' } },
            y: { title: { display: true, text: 'Temperature (°C)' } }
        }
    }
});

// Initialize the Power Usage Chart
const powerCtx = document.getElementById('powerChart').getContext('2d');
const powerChart = new Chart(powerCtx, {
    type: 'bar',
    data: {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Power Usage (kW)',
            data: [1.0, 1.2, 1.1, 1.3, 1.2, 1.4, 1.5],
            backgroundColor: '#28a745',
            borderColor: '#28a745',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: { enabled: true }
        },
        scales: {
            x: { title: { display: true, text: 'Days of the Week' } },
            y: { title: { display: true, text: 'Power Usage (kW)' } }
        }
    }
});
