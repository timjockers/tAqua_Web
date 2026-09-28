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
