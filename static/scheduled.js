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
        box.querySelector('.close').classList.add('hidden');
    });

    const iconSVG = clickedBox.querySelector('.icon');
    const closeSVG = clickedBox.querySelector('.close');

    clickedBox.classList.add('expanded');
    iconSVG.classList.add('hidden');
    closeSVG.classList.remove('hidden');
}

function closeIconBox(clickedBox) {
    clickedBox.classList.remove('expanded');

    const iconSVG = clickedBox.querySelector('.icon');
    const closeSVG = clickedBox.querySelector('.close');
    iconSVG.classList.remove('hidden');
    closeSVG.classList.add('hidden');
}
