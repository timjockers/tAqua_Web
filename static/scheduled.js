document.addEventListener('click', (event) => {
    if (event.target.matches('.icon-box')) {
        iconBoxClicked(event);
    }
});

function iconBoxClicked(event) {
    const isAlreadyExpanded = clickedBox.classList.contains('expanded');

    const expandedBoxes = document.querySelectorAll('.icon-box.expanded');
    expandedBoxes.forEach(box => {
        box.classList.remove('expanded');
    });

    if (!isAlreadyExpanded) {
        clickedBox.classList.add('expanded');
    }
}
