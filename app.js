/*

This file contains the main custom javascript for the website.

Author: Ben Elwood
Date Created: 12th Sept 2023
Last Modified: 12th Sept 2023

*/

import './styles.css';

// Code to run when the DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
    // Tutorial Sidebar code used on the Portal, Tutorial Tags, Tutorials, Blogs, Blog Tags, and Blog Posts pages.
    function init_tutorial_sidebar () {
        const children = document.querySelectorAll('.tutorial-links a');

        // Check if there are children before running the code.
        if (children.length > 0) {
            children.forEach((child) => {
                const parent_id = child.getAttribute('slug');
                if (parent_id !== '') {
                    const parent = document.getElementById(parent_id);
                    parent.appendChild(child);
                }
            });
        
            //
            
            const parents = document.querySelectorAll('.sidebar-dropdown');
            
            parents[0].classList.add('active');
            const prev_children_wrap = parents[0].querySelector('.sidebar-dropdown-children');
            prev_children_wrap.style.maxHeight = `${(prev_children_wrap.scrollHeight + 16)}px`;
            
            parents.forEach((parent, i) => {
                const children_wrap = parent.querySelector('.sidebar-dropdown-children');
        
                if ((window.location.pathname.indexOf(children_wrap.id) !== -1) && (i !== 0)) {
                    parent.classList.add('active');
                    children_wrap.style.maxHeight = `${(children_wrap.scrollHeight + 16)}px`;
        
                    parents[0].classList.remove('active');
                    prev_children_wrap.style.maxHeight = '0';
                }
        
                parent.addEventListener('click', () => {
                    if (parent.classList.contains('active')) {
                        parent.classList.remove('active');
                        children_wrap.style.maxHeight = '0';
                    } else {
                        parent.classList.add('active');
                        children_wrap.style.maxHeight = `${(children_wrap.scrollHeight + 16)}px`;
                    }
                });
            });
        }    
    }

    init_tutorial_sidebar();

    function init_tutorial_sidebar_search () {
        const input = document.getElementById('sidebar-search');
        console.log(input);
        if (input === null) return;
        const sidebar = document.querySelector('.sidebar-list');
        const dropdowns = sidebar.querySelectorAll('.sidebar-dropdown');

        input.addEventListener('input', () => {
            const active = document.querySelector('.sidebar-dropdown.active');
            const query = input.value.toLowerCase();
            
            dropdowns.forEach((dropdown) => {
                dropdown.classList.add('active');
                const children_wrap = dropdown.querySelector('.sidebar-dropdown-children');

                if (query.length > 2) {

                    if (dropdown.innerHTML.toLowerCase().indexOf(query) === -1) {
                        dropdown.classList.add('disabled');
                    } else {
                        dropdown.classList.remove('disabled');
                        const links = dropdown.querySelectorAll('.tutorial-link');
                        links.forEach((link) => {
                            if ((link.innerText.toLowerCase().indexOf(query) === -1) && (children_wrap.innerText.toLowerCase().indexOf(query) !== -1)) {
                                link.classList.add('disabled');
                            } else {
                                link.classList.remove('disabled');
                            }
                        });
                    }
                } else {
                    dropdown.classList.remove('disabled');
                    if (dropdown !== active) {
                            dropdown.classList.remove('active');
                            dropdown.querySelector('.sidebar-dropdown-children').style.maxHeight = '0';
                    }

                    const disabled_children = dropdown.querySelectorAll('.disabled');

                    disabled_children.forEach((child) => {
                        child.classList.remove('disabled');
                    });
                }

                children_wrap.style.maxHeight = `${(children_wrap.scrollHeight + 16)}px`;
            });
        });
    }

    init_tutorial_sidebar_search();
});