import RGBA from "./Color.js";
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
function decodeMakerMap(encoded) {
    let scene = JSON.parse(atob(encoded));
    let result = [];
    for (let y = 0; y < scene.length; y++) {
        let row = [];
        for (let x = 0; x < scene[y].length; x++) {
            let cell = scene[y][x];
            if (cell && 'r' in cell && 'g' in cell && 'b' in cell && 'a' in cell) {
                row.push(RGBA.fromObject(cell));
            }
            else if (cell && cell.url) {
                row.push(cell);
            }
            else {
                row.push(null);
            }
        }
        result.push(row);
    }
    return result;
}
mapButton.onclick = () => {
    var _a;
    let mapWidth = parseInt(mapWInput.value);
    let mapHeight = parseInt(mapHInput.value);
    var map = [[]];
    if (mapCode.value) {
        map = decodeMakerMap(mapCode.value);
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
    const editorBar = document.createElement("div");
    editorBar.classList.add("editor-bar");
    editorBar.innerHTML = `
          <input id="imageURL" placeholder="Image URL" /><button id="loadImage">Load</button>
        <div id="barItems">
          <div id="redBtn"></div>
          <div id="greenBtn"></div>
          <div id="blueBtn"></div>
          <div id="eraseBtn"></div>
        </div>
  `;
    (_a = mapMakerContainer.parentNode) === null || _a === void 0 ? void 0 : _a.prepend(editorBar);
    let selected = null;
    const redBtn = document.querySelector("#redBtn");
    const greenBtn = document.querySelector("#greenBtn");
    const blueBtn = document.querySelector("#blueBtn");
    const eraseBtn = document.querySelector("#eraseBtn");
    const imageURL = document.querySelector("#imageURL");
    const loadImage = document.querySelector("#loadImage");
    const barItems = document.querySelector("#barItems");
    let imageBtn = undefined;
    loadImage.onclick = () => {
        let url = imageURL.value;
        let urlObj = {
            url: url,
        };
        resetBorders();
        imageBtn = document.createElement("div");
        imageBtn.style.backgroundImage = `url(${url})`;
        imageBtn.style.backgroundRepeat = `no-repeat`;
        imageBtn.style.backgroundSize = `cover`;
        imageBtn.onclick = () => {
            resetBorders();
            if (imageBtn)
                imageBtn.style.border = `2px solid ${borderRGBA}`;
            selected = urlObj;
        };
        imageBtn.style.border = `2px solid ${borderRGBA}`;
        barItems.append(imageBtn);
        selected = urlObj;
    };
    function resetBorders() {
        redBtn.style.border = "";
        greenBtn.style.border = "";
        blueBtn.style.border = "";
        eraseBtn.style.border = "";
        if (imageBtn)
            imageBtn.style.border = "";
    }
    const borderRGBA = "white";
    redBtn.onclick = () => {
        selected = RGBA.red();
        resetBorders();
        redBtn.style.border = `2px solid ${borderRGBA}`;
    };
    greenBtn.onclick = () => {
        selected = RGBA.green();
        resetBorders();
        greenBtn.style.border = `2px solid ${borderRGBA}`;
    };
    blueBtn.onclick = () => {
        selected = RGBA.blue();
        resetBorders();
        blueBtn.style.border = `2px solid ${borderRGBA}`;
    };
    eraseBtn.onclick = () => {
        selected = null;
        resetBorders();
        eraseBtn.style.border = `2px solid ${borderRGBA}`;
    };
    function updateMap() {
        mapMakerContainer.innerHTML = "";
        mapMakerContainer.style.gridTemplateColumns = `repeat(${mapWidth}, 1fr)`;
        mapMakerContainer.style.gridTemplateRows = `repeat(${mapHeight}, 1fr)`;
        console.log(map);
        for (let col = 0; col < mapHeight; col++) {
            for (let row = 0; row < mapWidth; row++) {
                const box = document.createElement("div");
                box.classList.add("grid-box");
                let cell = map[col][row];
                if (cell instanceof RGBA) {
                    box.style.background = cell.toStyle();
                }
                else if (cell && cell.url) {
                    box.style.backgroundImage = `url(${cell.url})`;
                    box.style.backgroundRepeat = `no-repeat`;
                    box.style.backgroundSize = `cover`;
                }
                box.onclick = () => {
                    map[col][row] = selected;
                    updateMap();
                };
                mapMakerContainer.appendChild(box);
            }
        }
        encodingResult.innerText = encode(map);
    }
    updateMap();
};
//# sourceMappingURL=mapmaker.js.map