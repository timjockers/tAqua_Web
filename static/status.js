const statusContainer = document.querySelector(".bottom-status");

function updateStatusHTML() {
    getJSON('/api/relayConfig').then(conf => {
        const statusElements = document.querySelectorAll('.valve-status');
        for (let v = 0; v < 8; v++) {
            if (conf[v] == 1) {
                statusElements.item(v).classList.remove("hidden");
            } else {
                statusElements.item(v).classList.add("hidden");
            }
        }
    });
}

updateStatusHTML();
