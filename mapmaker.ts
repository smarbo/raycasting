const mapWInput = document.querySelector("#mapWidth") as HTMLInputElement;
const mapHInput = document.querySelector("#mapHeight") as HTMLInputElement;
const mapCode = document.querySelector("#mapCode") as HTMLInputElement;
const mapMakerContainer = document.querySelector("#mapMaker") as HTMLDivElement;
const mapButton = document.querySelector("#mapBegin") as HTMLButtonElement;
const encodingResult = document.querySelector(
  "#encodingResult",
) as HTMLHeadingElement;

function encode(map: Array<Array<string | null>>): string {
  const mapString = JSON.stringify(map);
  return btoa(mapString);
}

function decode(code: string): Array<Array<string | null>> {
  return JSON.parse(atob(code));
}

mapButton.onclick = () => {
  let mapWidth = parseInt(mapWInput.value);
  let mapHeight = parseInt(mapHInput.value);
  let map: Array<Array<string | null>> = [[]];

  if (mapCode.value) {
    map = decode(mapCode.value);
    mapHeight = map.length;
    mapWidth = map[0].length;
  } else {
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

  mapMakerContainer.parentNode?.prepend(editorBar);

  let selectedColor: string | null = null;

  const redBtn = document.querySelector("#redBtn") as HTMLDivElement;
  const greenBtn = document.querySelector("#greenBtn") as HTMLDivElement;
  const blueBtn = document.querySelector("#blueBtn") as HTMLDivElement;
  const eraseBtn = document.querySelector("#eraseBtn") as HTMLDivElement;

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
        if (cell !== null){
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

  mapMakerContainer.parentNode?.appendChild(encodeBtn);
  updateMap();
};
