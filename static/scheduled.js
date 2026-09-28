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
    console.log(weekday_select);
}

// INITIAL CALLS
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.weekday-select').forEach(element => {
        updateWeekdayIconBoxText(element);
    });
});
