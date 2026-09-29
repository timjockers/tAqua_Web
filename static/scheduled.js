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

// INITIAL CALLS
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.weekday-select').forEach(element => {
        updateWeekdayIconBoxText(element);
    });

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

// SCHEDULED TABLE BUILDER
class ScheduledTable {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        
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
        return;
        const response = await fetch(this.apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        return await response.json();
    }

    createCardTemplate(user) {
        return '';
        return `
            <article class="user-card" data-id="${user.id}">
                <img src="${user.avatar || 'https://placeholder.com'}" alt="${user.name}">
                <h2>${user.name}</h2>
                <p>Email: <a href="mailto:${user.email}">${user.email}</a></p>
                <button data-action="delete" class="btn-delete">Löschen</button>
            </article>
        `;
    }

    render(users) {
        return;
        this.container.innerHTML = '';

        // Alle User-Templates zu einem großen String zusammenfügen
        const htmlStructure = users.map(user => this.createCardTemplate(user)).join('');

        // Performantes Einfügen in das DOM
        this.container.insertAdjacentHTML('beforeend', htmlStructure);
        
        // Optionale Logik: Event-Listener an die neuen Elemente hängen
        this.addEventListeners();
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


const valve1Table = new ScheduledTable('#scheduled-table-1');

