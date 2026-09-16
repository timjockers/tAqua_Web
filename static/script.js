function loadConfig() {
    getJSON('/api/relayConfig').then(conf => {
        document.getElementById("rc").textContent = JSON.stringify(conf);
    });
}
loadConfig();