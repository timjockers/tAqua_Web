const statusContainer = document.querySelector(".bottom-status");

function updateStatusHTML() {
    statusContainer.querySelectorAll('span.valve-status').forEach(span => span.remove());

    getJSON('/api/relayConfig').then(conf => {
        for (let v = 0; v < 8; v++) {
            if (conf[v] == 1) {
                const newSpan = document.createElement('span');

                newSpan.classList.add('valve-status');
                newSpan.textContent = v+1;

                statusContainer.appendChild(newSpan);
            }
        }
    });
}

updateStatusHTML();
