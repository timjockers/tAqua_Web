const statusContainer = document.querySelector(".bottom-status");
const scheduledPopupWrapper = document.querySelector(".popup-wrapper-scheduled-popup");

function updateStatusHTML() {
    getJSON('/api/relayConfig').then(conf => {
        const statusElements = statusContainer.querySelectorAll('.valve-status');
        
        const scheduledPElements = scheduledPopupWrapper.querySelectorAll('.popup-content');

        for (let v = 0; v < 8; v++) {
            if (conf[v] == 1) {
                statusElements.item(v).classList.remove("hidden");
                scheduledPElements.item(v).classList.remove("hidden");
            } else {
                statusElements.item(v).classList.add("hidden");
                scheduledPElements.item(v).classList.add("hidden");
            }
        }
    });
}

updateStatusHTML();


const eventSource = new EventSource("/api/status");

eventSource.onmessage = function(event) {
    const status = JSON.parse(event.data);
    
    console.log("New Data:", status);
    
    for (let i = 0; i <= 7; i++) {
        const el = document.getElementById(`irrigation-status-${i}`);
        el.classList.remove('y');
        el.classList.remove('g');

        if (status[`${i}`] == 1) {
            el.classList.add('y');
        } else if (status[`${i}`] == 2) {
            el.classList.add('g');
        }
    }
};

eventSource.onerror = function(err) {
    console.error("SSE-Verbindungsfehler:", err);
};