// OVERLAY
const overlay = document.querySelector('.overlay');
overlay.addEventListener('click', closeAllPopup);

// SETTINGS-POPUP
const settingsButton = document.querySelector('.settings-button-container');
const settingsPopup = document.querySelector('.settings-popup');

settingsPopup.querySelector('.popup-close-button').addEventListener('click', closeAllPopup);
settingsButton.addEventListener('click', function(event) { openPopup(settingsPopup); });

// RELAIS-CONFIGURATION
function loadConfig() {
    getJSON('/api/relayConfig').then(conf => {
        const valveBtns = document.querySelectorAll('.settings-valve');
        for (let v = 0; v < 8; v++) {
            valveBtns.item(v).dataset.state = conf[v];
        }
    });
}
loadConfig();

document.querySelectorAll('.settings-valve').forEach(valve => {
    valve.addEventListener('click', () => {
        const currentState = valve.getAttribute('data-state');

        s = "0";
        if (currentState === "0") {
            valve.setAttribute('data-state', "1");
            s = "1";
        } else if (currentState === "1") {
            valve.setAttribute('data-state', "2");
            s = "2";
        } else {
            valve.setAttribute('data-state', "0");
        }
        
        writeJSON("/api/relayConfig", "{\"id\": " + valve.getAttribute('data-id') + ", \"status\": " + s + "}");
    });
});

// BTN-IRR-DURATION-CONFIGURATION
const minuteInput = document.getElementById('btn-irr-duration-m');
const secondInput = document.getElementById('btn-irr-duration-s');

let oldIrrTime = -1;

function loadBtnIrrTime() {
    getJSON('/api/buttonIrrigationTime').then(conf => {
        oldIrrTime = conf["seconds"];

        minuteInput.value = Math.floor(oldIrrTime / 60);
        secondInput.value = oldIrrTime % 60;
    });
}
loadBtnIrrTime();

function getDurationSeconds() {
    const minutes = Number(minuteInput.value || 0);
    const seconds = Number(secondInput.value || 0);

    return minutes * 60 + seconds;
}

function saveDuration() {
    const totalSeconds = getDurationSeconds();

    if (oldIrrTime != totalSeconds) {
        oldIrrTime = totalSeconds;
        writeJSON("/api/buttonIrrigationDuration", JSON.stringify({
            seconds: totalSeconds
        }));
    }
}

minuteInput.addEventListener('blur', saveDuration);
secondInput.addEventListener('blur', saveDuration);
