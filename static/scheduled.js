document.addEventListener('click', (event) => {
    const iconBox = event.target.closest('.icon-box');
    
    if (iconBox) {
        iconBoxClicked(iconBox);
    }
});

function iconBoxClicked(clickedBox) {
    const isAlreadyExpanded = clickedBox.classList.contains('expanded');

    const expandedBoxes = document.querySelectorAll('.icon-box.expanded');
    expandedBoxes.forEach(box => {
        box.classList.remove('expanded');
    });

    const iconSVG = clickedBox.querySelector('.icon');
    const closeSVG = clickedBox.querySelector('.close');

    if (!isAlreadyExpanded) {
        clickedBox.classList.add('expanded');
        iconSVG.classList.add('hidden');
        closeSVG.classList.remove('hidden');
    } else {
        closeSVG.classList.add('hidden');
        iconSVG.classList.remove('hidden');
    }
}
