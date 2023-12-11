document.addEventListener("DOMContentLoaded", function () {
    init_color_picker_fields();
});

function init_color_picker_fields () {

    const wrappers = document.querySelectorAll('.field-2.color, .field.color');
    
    wrappers.forEach(wrapper => {
        const input = wrapper.querySelector('input[type="color"]');
        const output = wrapper.querySelector('.color-value');

        input.addEventListener('change', () => {
            output.innerHTML = input.value;
        });

    });

}

// import Confetti from './confetti.js';

// window.addEventListener('load', () => {
//     // const confetti = new Confetti('.card-step.stylised');
//     // confetti.setCount(75);
//     // confetti.setPower(25);
//     // confetti.setSize(1);
//     // confetti.setFade(false);
//     // confetti.destroyTarget(false);
//     // confetti.start();

//     // Import the Confetti class

//     // Create a new Confetti instance
//     let confetti = new Confetti();

//     // Setup the canvas context
//     confetti.setupCanvasContext();

//     // Setup an element to trigger the confetti on click
//     let button = document.querySelector('.card-step.stylised');
//     confetti.setupElement(button);

//     // Or setup an element to trigger the confetti on scroll
//     // let section = document.querySelector('#mySection');
//     // confetti.setupElementForScroll(section);

//     // Start the update loop
//     confetti.update();
// });