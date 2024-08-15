// Compat shit
function GM_getValue(v,d){
    if(localStorage.getItem(v) == null){
        return d
    }else{
        return localStorage.getItem(v);
    }
}

function GM_setValue(i,v){localStorage.setItem(i,v);}

function GM_addStyle(s){
    let settingsElement = document.createElement('style');
    settingsElement.innerHTML = s;
    document.head.appendChild(settingsElement);
}

// sourcery skip: avoid-function-declarations-in-blocks
(function() {
    'use strict';

    // Add styles
    ( async function() {
        GM_addStyle(await fetch('style.css').then(e => e.text()));
    })();

    // Function to create settings panel
    async function createSettingsPanel() {
        let debounce = false;
        let combinedHTML = '';

        const windowNameList = [
            'combat',
            'blatant',
            'render',
            'utility',
            'world',

            'settings', // Made last to be on top of other windows
        ];

        // Make one big HTML element to inject into a new div
        for (let i in windowNameList){
            let windowName = windowNameList[i]+"Window";
            combinedHTML += `<div id="${windowName}" class="vape-window">`;
            combinedHTML += await fetch('windows/'+windowName+".html").then(e => e.text());
            combinedHTML += `</div>`;
        }

        const vapeHolderElement = document.createElement('div');
        vapeHolderElement.innerHTML = combinedHTML;
        vapeHolderElement.style.position = "relative";
        vapeHolderElement.style.zIndex = "9999";
        document.body.appendChild(vapeHolderElement);

        // Make sure settingsElement exists before trying to make it draggable
        if (vapeHolderElement) {
            for (let i in windowNameList){
                let name = windowNameList[i]+"Window";
                console.log(name)
                let selectedElement = document.getElementById(name)
                makeDraggable(selectedElement, name);
            }
        }

        // Add event listener for toggling the settings panel
        document.addEventListener('keydown', (event) => {
            console.log(debounce,!debounce)
            // sourcery skip: use-braces
            if (debounce) return;
            debounce = true; // "keydown" my ass

            if (event.key === "Shift" && event.location==KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
                vapeHolderElement.style.display = vapeHolderElement.style.display === "none" ? "block" : "none";
            }
        });

        document.addEventListener('keyup', () => {
            debounce = false;
        });
    }

    // Function to make an element draggable (base from somewhere)
    async function makeDraggable(element, localStorageKey) {
        let isDragging = false;
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;
                const rect = element.getBoundingClientRect();
                const parentRect = document.documentElement.getBoundingClientRect();

                // Prevent the element from being dragged out of the viewport
                const maxX = parentRect.width - rect.width;
                const maxY = parentRect.height - rect.height;

                const clampedX = Math.max(0, Math.min(newX, maxX));
                const clampedY = Math.max(0, Math.min(newY, maxY));

                element.style.left = `${clampedX}px`;
                element.style.top = `${clampedY}px`;

                // Save the position in GM storage
                GM_setValue(localStorageKey, `${clampedY},${clampedX}`);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.cursor = 'move';
        });

        // Restore position from GM storage
        const savedPos = GM_getValue(localStorageKey, '0,0');
        const positions = savedPos.split(',')
        element.style.top = positions[0]+'px';
        element.style.left = positions[1]+'px';
    }

    // Check settings and initialize
    async function init() {
        document.addEventListener('DOMContentLoaded', () => {
            createSettingsPanel();
        });
    }

    init();
})();