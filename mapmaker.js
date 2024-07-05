"use strict";
const mapWInput = document.querySelector("#mapWidth");
const mapHInput = document.querySelector("#mapHeight");
const mapCode = document.querySelector("#mapCode");
const mapMakerContainer = document.querySelector("#mapMaker");
const mapButton = document.querySelector("#mapBegin");
const encodingResult = document.querySelector("#encodingResult");
function encode(map) {
    const mapString = JSON.stringify(map);
    return btoa(mapString);
}
function decode(code) {
    return JSON.parse(atob(code));
}
mapButton.onclick = () => {
    var _a, _b;
    let mapWidth = parseInt(mapWInput.value);
    let mapHeight = parseInt(mapHInput.value);
    let map = [[]];
    if (mapCode.value) {
        map = decode(mapCode.value);
        mapHeight = map.length;
        mapWidth = map[0].length;
    }
    else {
        if (!mapWidth || mapWidth <= 0)
            throw new Error("Map width must be greater than zero.");
        if (!mapHeight || mapHeight <= 0)
            throw new Error("Map height must be greater than zero.");
    }
    if (map[0].length <= 0) {
        map = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(null));
    }
    console.log(map);
    const editorBar = document.createElement("div");
    editorBar.classList.add("editor-bar");
    editorBar.innerHTML = `
        <div id="redBtn"></div>
        <div id="greenBtn"></div>
        <div id="blueBtn"></div>
        <div id="eraseBtn"></div>
  `;
    (_a = mapMakerContainer.parentNode) === null || _a === void 0 ? void 0 : _a.prepend(editorBar);
    let selectedColor = null;
    const redBtn = document.querySelector("#redBtn");
    const greenBtn = document.querySelector("#greenBtn");
    const blueBtn = document.querySelector("#blueBtn");
    const eraseBtn = document.querySelector("#eraseBtn");
    function resetBorders() {
        redBtn.style.border = "";
        greenBtn.style.border = "";
        blueBtn.style.border = "";
        eraseBtn.style.border = "";
    }
    const borderColor = "white";
    redBtn.onclick = () => {
        selectedColor = "red";
        resetBorders();
        redBtn.style.border = `2px solid ${borderColor}`;
    };
    greenBtn.onclick = () => {
        selectedColor = "green";
        resetBorders();
        greenBtn.style.border = `2px solid ${borderColor}`;
    };
    blueBtn.onclick = () => {
        selectedColor = "blue";
        resetBorders();
        blueBtn.style.border = `2px solid ${borderColor}`;
    };
    eraseBtn.onclick = () => {
        selectedColor = null;
        resetBorders();
        eraseBtn.style.border = `2px solid ${borderColor}`;
    };
    function updateMap() {
        mapMakerContainer.innerHTML = "";
        mapMakerContainer.style.gridTemplateColumns = `repeat(${mapWidth}, 1fr)`;
        mapMakerContainer.style.gridTemplateRows = `repeat(${mapHeight}, 1fr)`;
        for (let col = 0; col < mapHeight; col++) {
            for (let row = 0; row < mapWidth; row++) {
                const box = document.createElement("div");
                box.classList.add("grid-box");
                let cell = map[col][row];
                if (cell !== null) {
                    box.style.background = cell;
                }
                box.onclick = () => {
                    map[col][row] = selectedColor;
                    updateMap();
                };
                mapMakerContainer.appendChild(box);
            }
        }
    }
    const encodeBtn = document.createElement("button");
    encodeBtn.innerHTML = "Encode";
    encodeBtn.onclick = () => {
        encodingResult.innerText = encode(map);
    };
    (_b = mapMakerContainer.parentNode) === null || _b === void 0 ? void 0 : _b.appendChild(encodeBtn);
    updateMap();
};
//# sourceMappingURL=mapmaker.js.map