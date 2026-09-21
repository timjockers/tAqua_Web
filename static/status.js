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
