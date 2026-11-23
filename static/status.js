const statusContainer = document.querySelector('.bottom-status');
const statusSVG = statusContainer.querySelector('.bottom-status-info');
const statusPopupCheck = statusContainer.querySelector('.bottom-popup-checkmark');
const statusPopupX = statusContainer.querySelector('.bottom-popup-x');
const statusPopupText = statusContainer.querySelector('.status-popup-text');
const scheduledPopupWrapper = document.querySelector('.popup-wrapper-scheduled-popup');

function updateStatusHTML() {
    getJSON('/api/relayConfig').then(conf => {
        const statusElements = statusContainer.querySelectorAll('.valve-status');
        
        const scheduledPElements = scheduledPopupWrapper.querySelectorAll('.popup-content');

        for (let v = 0; v < 8; v++) {
            statusElements.item(v).classList.remove("popup-open");
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

function showStatusPopup(valve_status_element) {
    const statusElements = statusContainer.querySelectorAll('.valve-status');
    statusElements.forEach(el => {
        if (el != valve_status_element) { 
            el.classList.add("hidden");
        }
    })

    statusSVG.classList.add("hidden");
    statusPopupCheck.classList.remove("hidden");
    statusPopupX.classList.remove("hidden");
    statusPopupText.classList.remove("hidden");

    valve_status_element.classList.add("popup-open");
    if (valve_status_element.classList.contains('y')) {
        statusPopupText.innerHTML = "Cancel queued irrigation event?";
    } else if (valve_status_element.classList.contains('g')) {
        statusPopupText.innerHTML = "Stop active irrigation?";
    } else {
        statusPopupText.innerHTML = "Add manual irrigation event?";
    }
}

function hideStatusPopup() {
    updateStatusHTML();

    statusSVG.classList.remove("hidden");
    statusPopupCheck.classList.add("hidden");
    statusPopupX.classList.add("hidden");
    statusPopupText.classList.add("hidden");
}

function sendStatusPopupAction() {
    const valve = Number(statusContainer.querySelector('.valve-status:not(.hidden)').innerHTML) - 1;

    writeJSON('/api/buttonPressAction', JSON.stringify({
        button: valve
    }));

    hideStatusPopup();
}

statusContainer.querySelectorAll('.valve-status').forEach(valve => {
    valve.addEventListener('click', () => {
        showStatusPopup(valve);
    });
});
statusPopupX.addEventListener('click', hideStatusPopup);
statusPopupCheck.addEventListener('click', sendStatusPopupAction);
updateStatusHTML();

////////////////////////////////////////

function updateQueueInformation(queueEvents) {
    if (queueEvents == null) {
        return;
    }

    const containers = document.querySelectorAll('.container-queued-events');

    containers.forEach((container) => {
        if (!Array.isArray(queueEvents) || queueEvents.length === 0) {
            container.innerHTML = `
                <span>No events in the Queue.</span>
            `;
        } else {
            container.innerHTML = "";

            let evN = 0;
            const infinity = container.classList.contains('infinity');

            queueEvents.forEach(event => {
                evN += 1;
                if (infinity || (!infinity && evN < 3)) {
                    const relayStr = event?.relay != null
                        ? `<span class="valve-status y">${event.relay + 1}</span>`
                        : "";

                    const durationStr = event?.duration != null
                        ? `<div class="duration-info-box">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
                            <span>${Number(Math.floor(event.duration / 60))}m ${Number(event.duration % 60)}s</span>
                        </div>`
                        : "";

                    container.insertAdjacentHTML("beforeend", `
                        <div class="event-overview">
                            ${relayStr}
                            ${durationStr}
                        </div>
                    `);
                }
            });

            if (!infinity && evN >= 3) {
                container.insertAdjacentHTML("beforeend", `<span class="more-events queued" data-default="+${evN-2} more" data-hover="show all"></span>`);
            }
        }
    });
}

function getNext24HoursEvents() {
    const now = new Date();

    const nowDay1 = now.getDay();
    const nowDay2 = (nowDay1 + 1) % 7;

    const nowTime = now.getHours() * 60 + now.getMinutes();

    let validEvents = [];

    scheduledEventsStorage.forEach(event => {
        const t = event.start;
        const wd = event.weekdays;

        if (t > nowTime && Boolean((wd >> nowDay1) & 1)) {
            event["dynamic_append_time"] = t - nowTime;
            validEvents.push(event);
        } else if (t <= nowTime && Boolean((wd >> nowDay2) & 1)) {
            event["dynamic_append_time"] = t + 24 * 60 - nowTime;
            validEvents.push(event);
        }
    });

    validEvents.sort((a, b) => 
        (a.dynamic_append_time - b.dynamic_append_time) || (a.relay - b.relay)
    );

    return validEvents;
}

let scheduledEventsStorage = [];

function updateScheduledInformation() {
    const nextEvents = getNext24HoursEvents();
    
    if (nextEvents == null) {
        return;
    }

    const containers = document.querySelectorAll('.container-scheduled-events');

    containers.forEach((container) => {
        if (Array.isArray(nextEvents) && nextEvents.length === 0) {
            container.innerHTML = `
                <span>Nothing scheduled for the next 24 hours.</span>
            `;
        } else {
            container.innerHTML = "";

            let evN = 0;
            const infinity = container.classList.contains('infinity');

            nextEvents.forEach(event => {
                evN += 1;
                if (infinity || (!infinity && evN < 3)) {
                    const appendTimeStr = event?.dynamic_append_time != null
                        ? `<div class="append-time-info-box">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-timer preview-icon"><line x1="10" x2="14" y1="2" y2="2"/><line class="timer-hand" x1="12" x2="12" y1="14" y2="10"/><circle cx="12" cy="14" r="8"/></svg>
                            <span>${Math.floor(event.dynamic_append_time / 60) !== 0 ? `${Math.floor(event.dynamic_append_time / 60)}h ` : ""}${Number(event.dynamic_append_time % 60)}m</span> 
                        </div>`
                        : "";

                    const relayStr = event?.relay != null
                        ? `<span class="valve-status">${event.relay + 1}</span>`
                        : "";

                    const durationStr = event?.duration != null
                        ? `<div class="duration-info-box">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
                            <span>${Number(Math.floor(event.duration / 60))}m ${Number(event.duration % 60)}s</span>
                        </div>`
                        : "";

                    container.insertAdjacentHTML("beforeend", `
                        <div class="event-overview">
                            ${appendTimeStr}
                            ${relayStr}
                            ${durationStr}
                        </div>
                    `);
                }
            });

            if (!infinity && evN >= 3) {
                container.insertAdjacentHTML("beforeend", `<span class="more-events scheduled" data-default="+${evN-2} more" data-hover="show all"></span>`);
            }
        }
    });
}

function onMinuteChange(callback, bufferMs = 50) {
    function scheduleNext() {
        const now = new Date();
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + bufferMs;

        setTimeout(() => {
            callback(new Date());
            scheduleNext();
        }, msUntilNextMinute);
    }

    scheduleNext();
}


onMinuteChange((time) => {
    updateScheduledInformation();
});


const eventSource = new EventSource("/api/status");

eventSource.onmessage = function(event) {
    const status = JSON.parse(event.data);
    
    irrigationStatusChanged = false;

    for (let i = 0; i <= 7; i++) {
        const el = document.getElementById(`irrigation-status-${i}`);

        type_before = 0;
        if (el.classList.contains('y')) {
            type_before = 1;
        } else if (el.classList.contains('g')) {
            type_before = 2;
        }

        el.classList.remove('y');
        el.classList.remove('g');

        if (status["irrigationStatus"][i] == 1) {
            el.classList.add('y');

            el.style = `--percent: ${100 - status["irrigationProgress"][i]}%;`;

            if (type_before != 1) { irrigationStatusChanged = true; }
        } else if (status["irrigationStatus"][i] == 2) {
            el.classList.add('g');

            if (type_before != 2) { irrigationStatusChanged = true; }
        }
    }

    if (irrigationStatusChanged) {
        hideStatusPopup();
    }

    //////////

    updateQueueInformation(status["queueInformation"]);
    scheduledEventsStorage = status["scheduledInformation"];
    updateScheduledInformation();
};

eventSource.onerror = function(err) {
    console.error("SSE-Connectionerror:", err);
};
