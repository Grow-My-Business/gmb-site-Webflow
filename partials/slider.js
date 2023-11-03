import Splide from '@splidejs/splide';
// import { custom_transition } from './custom_transition.js';

document.addEventListener( 'DOMContentLoaded', function () {
    var splide = new Splide( '.splide', {
        type     : 'loop',
        autoWidth: true,
        arrows: true,
        pagination: false,
        autoplay: true,
        speed: 700,
        gap: 30,
        breakpoints: {
            992: {
                gap: 20,
                arrows: false,
            },
        }

      }).mount();
});