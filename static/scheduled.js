const iconBoxes = document.querySelectorAll('.icon-box');

iconBoxes.forEach(box => {
    box.addEventListener('click', (event) => {
        console.log('Button clicked:', event.target);
    });
});
