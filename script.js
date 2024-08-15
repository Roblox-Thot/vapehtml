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
        const windowList = [
            'combatWindow',
            'blatantWindow',
            'renderWindow',
            'utilityWindow',
            'worldWindow',
            'settingsWindow',
        ];
        for (let i in windowList){
            let windowName = windowList[i];
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
            for (let i in windowList){
                let name = windowList[i];
                let elementz = document.getElementById(name)
                makeDraggable(elementz, name+"Top", name+"Left");
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

    // Function to make an element draggable
    async function makeDraggable(element, localStorageKeyTop, localStorageKeyLeft) {
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
                GM_setValue(localStorageKeyTop, `${clampedY}px`);
                GM_setValue(localStorageKeyLeft, `${clampedX}px`);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.cursor = 'move';
        });

        // Restore position from GM storage
        const savedTop = GM_getValue(localStorageKeyTop, '0px');
        const savedLeft = GM_getValue(localStorageKeyLeft, '0px');
        element.style.top = savedTop;
        element.style.left = savedLeft;
    }

    // Check settings and initialize
    async function init() {
        document.addEventListener('DOMContentLoaded', () => {
            createSettingsPanel();
        });
    }

    init();
})();