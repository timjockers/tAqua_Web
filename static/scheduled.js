document.addEventListener('click', (event) => {
    const iconBox = event.target.closest('.icon-box');
    
    if (iconBox) {
        iconBoxClicked(iconBox);
    }

    const closeIcon = event.target.closest('.icon-box > .close');
    if (closeIcon) {
        const parentIconBox = closeIcon.closest('.icon-box');
        closeIconBox(parentIconBox);
    }

    // TOGGLE WEEKDAY SELECT
    const weekdaySelect = event.target.closest('.weekday-select > span');
    
    if (weekdaySelect) {
        weekdaySelect.classList.toggle('selected');
        updateWeekdayIconBoxText(weekdaySelect.closest('.weekday-select'));
    }
});

function iconBoxClicked(clickedBox) {
    const isAlreadyExpanded = clickedBox.classList.contains('expanded');

    if (isAlreadyExpanded) {
        return;
    }

    const expandedBoxes = document.querySelectorAll('.icon-box.expanded');
    expandedBoxes.forEach(box => {
        box.classList.remove('expanded');
        box.querySelector('.icon').classList.remove('hidden');
        box.querySelector('.icon-box-text').classList.remove('hidden');
        box.querySelector('.close').classList.add('hidden');
        box.querySelector('.expanded-content').classList.add('hidden');
    });

    const iconSVG = clickedBox.querySelector('.icon');
    const iconBoxText = clickedBox.querySelector('.icon-box-text');
    const closeSVG = clickedBox.querySelector('.close');
    const expandedContent = clickedBox.querySelector('.expanded-content');

    clickedBox.classList.add('expanded');
    iconSVG.classList.add('hidden');
    iconBoxText.classList.add('hidden');
    closeSVG.classList.remove('hidden');
    expandedContent.classList.remove('hidden');
}

function closeIconBox(clickedBox) {
    clickedBox.classList.remove('expanded');

    const iconSVG = clickedBox.querySelector('.icon');
    const iconBoxText = clickedBox.querySelector('.icon-box-text');
    const closeSVG = clickedBox.querySelector('.close');
    const expandedContent = clickedBox.querySelector('.expanded-content');
    iconSVG.classList.remove('hidden');
    iconBoxText.classList.remove('hidden');
    closeSVG.classList.add('hidden');
    expandedContent.classList.add('hidden');
}

// FUNCTIONS - ICONBOX
function updateWeekdayIconBoxText(weekday_select) {
    const iconBox = weekday_select.closest('.icon-box');
    const textObject = iconBox ? iconBox.querySelector('.icon-box-text') : null;

    if (!textObject) {
        return;
    }

    const selectedDays = Array.from(
        weekday_select.closest('.weekday-select')?.querySelectorAll('span.selected') || []
    ).map(day => day.textContent.trim()).join(', ');

    textObject.textContent = selectedDays || 'Select weekday(s)';
}

function updateTimeIconBoxText(time_select) {
    const iconBox = time_select.closest('.icon-box');
    const textObject = iconBox ? iconBox.querySelector('.icon-box-text') : null;

    if (!textObject) {
        return;
    }

    const input = time_select.querySelector('input');
    const value = input?.value.trim() || '';

    textObject.textContent = input && input.checkValidity() && value ? value : 'Select time';
}

function updateDurationIconBoxText(duration_select) {
    const iconBox = duration_select.closest('.icon-box');
    const textObject = iconBox ? iconBox.querySelector('.icon-box-text') : null;

    if (!textObject) {
        return;
    }

    const minuteInput = duration_select.querySelector('input[aria-label="Minutes"]');
    const secondInput = duration_select.querySelector('input[aria-label="Seconds"]');
    const minutes = Number(minuteInput?.value || 0);
    const seconds = Number(secondInput?.value || 0);
    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
        textObject.textContent = 'Select duration';
        return;
    }

    textObject.textContent = `${minutes}m ${seconds}s`;
}

// SCHEDULED TABLE BUILDER
class ScheduledTable {
    constructor(containerSelector, relayNumber) {
        this.container = document.querySelector(containerSelector);
        this.relayNumber = relayNumber;
        
        this.init();
    }

    async init() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="scheduled-row">
                <div class="scheduled-plus tbutton hover-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-plus preview-icon">
                        <path d="M16 18h6 M19 15v6"/>
                        <path d="M16 2v3"/>
                        <path d="M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3"/>
                        <path d="M3 9h18"/>
                        <path d="M8 2v3"/>
                    </svg>
                </div>
            </div>
        `;

        try {
            const eventData = await this.fetchData();
            
            this.render(eventData);
        } catch (error) {
            console.error("Error loading scheduled events from server:", error);
        }
    }

    async fetchData() {
        return await getJSON(`/api/scheduled?relay=${this.relayNumber}`);
    }

    createScheduledRow(event_data) {
        const weekdays = Number(event_data['weekdays']) || 0;

        const sunday = Boolean((weekdays >> 0) & 1);
        const monday = Boolean((weekdays >> 1) & 1);
        const tuesday = Boolean((weekdays >> 2) & 1);
        const wednesday = Boolean((weekdays >> 3) & 1);
        const thursday = Boolean((weekdays >> 4) & 1);
        const friday = Boolean((weekdays >> 5) & 1);
        const saturday = Boolean((weekdays >> 6) & 1);

        return `
            <div class="scheduled-row">
                <div class="scheduled-minus tbutton hover-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-minus preview-icon"><path d="M16 18h6"/><path d="M16 2v3"/><path d="M21 14V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3"/><path d="M3 9h18"/><path d="M8 2v3"/></svg>
                </div>
                <div class="icon-box">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-days preview-icon"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M8 13h.01"/><path d="M12 13h.01"/><path d="M16 13h.01"/><path d="M8 17h.01"/><path d="M12 17h.01"/><path d="M16 17h.01"/></svg>
                    <span class="icon-box-text">--</span>
                    <svg class="close hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up preview-icon"><path d="m18 15-6-6-6 6"/></svg>
                    <div class="expanded-content hidden">
                        <div class="weekday-select">
                            <span${sunday ? ' class=selected' : ''}>Sun</span>
                            <span${monday ? ' class=selected' : ''}>Mon</span>
                            <span${tuesday ? ' class=selected' : ''}>Tue</span>
                            <span${wednesday ? ' class=selected' : ''}>Wed</span>
                            <span${thursday ? ' class=selected' : ''}>Thu</span>
                            <span${friday ? ' class=selected' : ''}>Fri</span>
                            <span${saturday ? ' class=selected' : ''}>Sat</span>
                        </div>
                    </div>
                </div>
                <div class="icon-box">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock preview-icon"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span class="icon-box-text">--</span>
                    <svg class="close hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up preview-icon"><path d="m18 15-6-6-6 6"/></svg>
                    <div class="expanded-content hidden">
                        <div class="time-select">
                            <input type="text" pattern="(?:[01]?\d|2[0-3]):[0-5]\d" placeholder="HH:MM" maxlength="5">
                        </div>
                    </div>
                </div>
                <div class="icon-box">
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hourglass preview-icon"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                    <span class="icon-box-text">--</span>
                    <svg class="close hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up preview-icon"><path d="m18 15-6-6-6 6"/></svg>
                    <div class="expanded-content hidden">
                        <div class="duration-select">
                            <div class="duration-picker">
                                <div class="duration-input-group">
                                    <input id="btn-irr-duration-m" type="number" min="0" max="119" placeholder="0" aria-label="Minutes" value="0">
                                    <span>Min</span>
                                </div>
                                
                                <span class="duration-separator">:</span>
                                
                                <div class="duration-input-group">
                                    <input id="btn-irr-duration-s" type="number" min="0" max="59" placeholder="0" aria-label="Seconds" value="0">
                                    <span>Sec</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    render(event_data) {
        this.container.innerHTML = `
            <div class="scheduled-row">
                <div class="scheduled-plus tbutton hover-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-plus preview-icon">
                        <path d="M16 18h6 M19 15v6"/>
                        <path d="M16 2v3"/>
                        <path d="M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3"/>
                        <path d="M3 9h18"/>
                        <path d="M8 2v3"/>
                    </svg>
                </div>
            </div>
        `;


        const htmlStructure = event_data.map(e => this.createScheduledRow(e)).join('');

        this.container.insertAdjacentHTML('beforeend', htmlStructure);

        this.container.querySelectorAll('.weekday-select').forEach(element => {
            updateWeekdayIconBoxText(element);
        });
        
        // this.addEventListeners();
    }

    addEventListeners() {
        return;
        this.container.addEventListener('click', (event) => {
            const deleteButton = event.target.closest('[data-action="delete"]');
            if (deleteButton) {
                const card = deleteButton.closest('.user-card');
                const userId = card.dataset.id;
                
                alert(`User mit ID ${userId} wird gelöscht.`);
                card.remove(); // Entfernt das Element aus dem HTML
            }
        });
    }
}

// INITIAL CALLS
document.addEventListener('DOMContentLoaded', function() {
    const valve1Table = new ScheduledTable('#scheduled-table-1', 1);
    const valve2Table = new ScheduledTable('#scheduled-table-2', 2);
    const valve3Table = new ScheduledTable('#scheduled-table-3', 3);
    const valve4Table = new ScheduledTable('#scheduled-table-4', 4);
    const valve5Table = new ScheduledTable('#scheduled-table-5', 5);
    const valve6Table = new ScheduledTable('#scheduled-table-6', 6);
    const valve7Table = new ScheduledTable('#scheduled-table-7', 7);
    const valve8Table = new ScheduledTable('#scheduled-table-8', 8);

    document.querySelectorAll('.time-select').forEach(timeSelect => {
        const input = timeSelect.querySelector('input');
        if (!input) {
            return;
        }

        const syncTimeValue = () => {
            input.classList.toggle('selected', input.value.trim() !== '');
            updateTimeIconBoxText(timeSelect);
        };

        input.addEventListener('input', syncTimeValue);
        input.addEventListener('focus', syncTimeValue);
        input.addEventListener('blur', () => {
            input.classList.toggle('selected', input.checkValidity() && input.value.trim() !== '');
            updateTimeIconBoxText(timeSelect);
        });

        syncTimeValue();
    });

    document.querySelectorAll('.duration-select').forEach(durationSelect => {
        const syncDurationValue = () => {
            const groups = durationSelect.querySelectorAll('.duration-input-group');
            groups.forEach(group => {
                const input = group.querySelector('input');
                group.classList.toggle('selected', !!input && input.value.trim() !== '');
            });
            updateDurationIconBoxText(durationSelect);
        };

        durationSelect.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', syncDurationValue);
            input.addEventListener('focus', syncDurationValue);
            input.addEventListener('blur', syncDurationValue);
        });

        syncDurationValue();
    });
});
