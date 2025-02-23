// Compat shit
function GM_getValue(LSItemName,defaultValue){
    if(localStorage.getItem(LSItemName) == null){
        return defaultValue
    }else{
        return localStorage.getItem(LSItemName);
    }
}

function GM_setValue(LSItemName,setVar){localStorage.setItem(LSItemName,setVar);}

function GM_addStyle(styleString){
    let settingsElement = document.createElement('style');
    settingsElement.innerHTML = styleString;
    document.head.appendChild(settingsElement);
}

// sourcery skip: avoid-function-declarations-in-blocks
(function() {
    'use strict';

    const windowNameList = [
        'combat',
        'blatant',
        'render',
        'utility',
        'world',

        'settings' // Made last to be on top of other windows
    ];

    // Add styles
    (async function() {
        GM_addStyle(await fetch('style.css').then(e => e.text()));
    })();

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

        // Restore position from storage
        const savedPos = GM_getValue(localStorageKey, '0,0');
        const positions = savedPos.split(',')
        element.style.top = positions[0]+'px';
        element.style.left = positions[1]+'px';
    }

    // Function to create settings panel
    async function createWindows() {
        let debounce = false;
        let combinedHTML = '';

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

        // Make sure the windows exists before trying to make it draggable
        if (vapeHolderElement) {
            for (let i in windowNameList){
                let name = windowNameList[i]+"Window";
                let selectedElement = document.getElementById(name);
                makeDraggable(selectedElement, name);
            }
        }

        vapeHolderElement.style.display = "none";
        // Add event listener for toggling the Vape overlay
        document.addEventListener('keydown', (event) => {
            console.log(event, debounce,!debounce)
            // sourcery skip: use-braces
            if (debounce) return;
            debounce = true; // "keydown" my ass

            if (event.key === "Shift" && event.location==KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
                vapeHolderElement.style.display = vapeHolderElement.style.display === "none" ? "block" : "none";
            }else if (event.key === "Delete") {
                localStorage.clear()
                document.location=document.location;
            }
        });

        document.addEventListener('keyup', () => {
            debounce = false;
        });
        await makeToggles();
    }

    async function makeToggles(){
        for (let i in windowNameList){
            if (windowNameList[i] == "settings") {
              continue
            }

            let windowName = windowNameList[i];
            let window = document.getElementById(windowName+"Window");
            console.log(window.hidden,windowName)
            let toggleButton = document.getElementById(windowName+"Toggle");
            toggleButton.onclick = function(){
                console.log(window.hidden)
                window.style.visibility = window.hidden ? "visible" : "hidden";
                window.hidden = !window.hidden;
                GM_setValue(windowName+"WindowHidden",window.hidden)
            }

            if (GM_getValue(windowName+"WindowHidden", 'true') == 'true'){
                window.hidden = true;
                window.style.visibility = window.hidden ? "hidden" : "visible";
            }
        }
    }

    // Check settings and initialize
    async function init() {
        document.addEventListener('DOMContentLoaded', async () => {
            await createWindows();
        });
    }

    init();
})();
