const mapWInput = document.querySelector("#mapWidth") as HTMLInputElement;
const mapHInput = document.querySelector("#mapHeight") as HTMLInputElement;
const mapCode = document.querySelector("#mapCode") as HTMLInputElement;
const mapMakerContainer = document.querySelector("#mapMaker") as HTMLDivElement;
const mapButton = document.querySelector("#mapBegin") as HTMLButtonElement;
const encodingResult = document.querySelector(
  "#encodingResult",
) as HTMLHeadingElement;

function encode(map: MakerScene): string {
  const mapString = JSON.stringify(map);
  return btoa(mapString);
}

function decode(code: string): MakerScene {
  return JSON.parse(atob(code));
}

function decodeMakerMap(encoded: string): MakerScene {
  let scene: MakerScene = JSON.parse(atob(encoded));
  let result: MakerScene = [];

  for (let y = 0; y < scene.length; y++) {
    let row: Array<ImageURL | EncodedColor | null> = [];
    for (let x = 0; x < scene[y].length; x++) {
      let cell = scene[y][x];
      if (cell && 'r' in cell && 'g' in cell && 'b' in cell && 'a' in cell) {
        row.push(Color.fromObject(cell as EncodedColor));
      } else if (cell && (cell as ImageURL).url) {
        row.push(cell);
      } else{
        row.push(null);
      }
    }
    result.push(row);
  }
  return result;
}


type MakerScene = Array<Array<EncodedColor | ImageURL | null>>;

mapButton.onclick = () => {
  let mapWidth = parseInt(mapWInput.value);
  let mapHeight = parseInt(mapHInput.value);
  var map: MakerScene = [[]];

  if (mapCode.value) {
    map = decodeMakerMap(mapCode.value);
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


  mapMakerContainer.parentNode?.prepend(editorBar);

  let selected: Color | ImageURL | null = null;

  const redBtn = document.querySelector("#redBtn") as HTMLDivElement;
  const greenBtn = document.querySelector("#greenBtn") as HTMLDivElement;
  const blueBtn = document.querySelector("#blueBtn") as HTMLDivElement;
  const eraseBtn = document.querySelector("#eraseBtn") as HTMLDivElement;
  const imageURL = document.querySelector("#imageURL") as HTMLInputElement;
  const loadImage = document.querySelector("#loadImage") as HTMLButtonElement;
  const barItems = document.querySelector("#barItems") as HTMLDivElement;
  let imageBtn: HTMLDivElement | undefined = undefined;

  loadImage.onclick = () => {
    let url = imageURL.value;
    let urlObj: ImageURL = {
      url: url,
    };
    resetBorders();
    imageBtn = document.createElement("div");
    imageBtn.style.backgroundImage = `url(${url})`;
    imageBtn.style.backgroundRepeat = `no-repeat`;
    imageBtn.style.backgroundSize = `cover`;
    imageBtn.onclick = () => {
      resetBorders();
      if(imageBtn) imageBtn.style.border = `2px solid ${borderColor}`;
      selected = urlObj;
    }
    imageBtn.style.border = `2px solid ${borderColor}`;
    barItems.append(imageBtn);
    selected = urlObj;
  }

  function resetBorders() {
    redBtn.style.border = "";
    greenBtn.style.border = "";
    blueBtn.style.border = "";
    eraseBtn.style.border = "";
    if(imageBtn) imageBtn.style.border = "";
  }

  const borderColor = "white";

  redBtn.onclick = () => {
    selected = Color.red();
    resetBorders();
    redBtn.style.border = `2px solid ${borderColor}`;
  };
  greenBtn.onclick = () => {
    selected = Color.green();
    resetBorders();
    greenBtn.style.border = `2px solid ${borderColor}`;
  };
  blueBtn.onclick = () => {
    selected = Color.blue();
    resetBorders();
    blueBtn.style.border = `2px solid ${borderColor}`;
  };
  eraseBtn.onclick = () => {
    selected = null;
    resetBorders();
    eraseBtn.style.border = `2px solid ${borderColor}`;
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
        if (cell instanceof Color) {
          box.style.background = cell.toStyle();
        } else if (cell && (cell as ImageURL).url) {
          box.style.backgroundImage = `url(${(cell as ImageURL).url})`;
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
