const themes = [
  {
    name: "Classic",
    backgroundColor: "#faf8ef",
    gridBackground: 0xbbada0,
    emptyTile: 0xcdc1b4,
    scoreColor: "#776e65",
    tileTextDark: "#776e65",
    tileTextLight: "#f9f6f2",
    tileColors: {
      2: 0xeee4da,
      4: 0xede0c8,
      8: 0xf2b179,
      16: 0xf59563,
      32: 0xf67c5f,
      64: 0xf65e3b,
      128: 0xedcf72,
      256: 0xedcc61,
      512: 0xedc850,
      1024: 0xedc53f,
      2048: 0xedc22e,
    },
  },
  {
    name: "Dark",
    backgroundColor: "#303030",
    gridBackground: 0x3e3e3e,
    emptyTile: 0x4b4b4b,
    scoreColor: "#ffffff",
    tileTextDark: "#f9f6f2",
    tileTextLight: "#ffffff",
    tileColors: {
      2: 0x4d4d4d,
      4: 0x5c5c5c,
      8: 0x6b8e23,
      16: 0x556b2f,
      32: 0x8b4513,
      64: 0xa0522d,
      128: 0xcd853f,
      256: 0xd2691e,
      512: 0xb22222,
      1024: 0x8b0000,
      2048: 0x800000,
    },
  },
  {
    name: "Blue",
    backgroundColor: "#e0f7fa",
    gridBackground: 0x80deea,
    emptyTile: 0xb2ebf2,
    scoreColor: "#01579b",
    tileTextDark: "#01579b",
    tileTextLight: "#f9f6f2",
    tileColors: {
      2: 0xb3e5fc,
      4: 0x81d4fa,
      8: 0x4fc3f7,
      16: 0x29b6f6,
      32: 0x03a9f4,
      64: 0x039be5,
      128: 0x0288d1,
      256: 0x0277bd,
      512: 0x01579b,
      1024: 0x004c8c,
      2048: 0x003b73,
    },
  },
  {
    name: "Green",
    backgroundColor: "#e8f5e9",
    gridBackground: 0xa5d6a7,
    emptyTile: 0xc8e6c9,
    scoreColor: "#33691e",
    tileTextDark: "#33691e",
    tileTextLight: "#f9f6f2",
    tileColors: {
      2: 0xc5e1a5,
      4: 0xaed581,
      8: 0x9ccc65,
      16: 0x8bc34a,
      32: 0x7cb342,
      64: 0x689f38,
      128: 0x558b2f,
      256: 0x33691e,
      512: 0x2e7d32,
      1024: 0x1b5e20,
      2048: 0x004d40,
    },
  },
  {
    name: "Pastel",
    backgroundColor: "#fce4ec",
    gridBackground: 0xf8bbd0,
    emptyTile: 0xfce4ec,
    scoreColor: "#ad1457",
    tileTextDark: "#ad1457",
    tileTextLight: "#ffffff",
    tileColors: {
      2: 0xf8bbd0,
      4: 0xf48fb1,
      8: 0xf06292,
      16: 0xec407a,
      32: 0xe91e63,
      64: 0xd81b60,
      128: 0xc2185b,
      256: 0xad1457,
      512: 0x880e4f,
      1024: 0x6a1b9a,
      2048: 0x4a148c,
    },
  },
];

let currentThemeIndex = 0;

const config = {
  type: Phaser.AUTO,
  width: 450,
  height: 550,
  backgroundColor: themes[currentThemeIndex].backgroundColor,
  scene: Game2048,
};

const game = new Phaser.Game(config);

window.themes = themes;
window.currentThemeIndex = currentThemeIndex;

function populateThemeSelector() {
  const select = document.getElementById("themeSelector");
  if (!select) return;
  themes.forEach((t, idx) => {
    const option = document.createElement("option");
    option.value = idx;
    option.textContent = t.name;
    select.appendChild(option);
  });
  select.value = currentThemeIndex;
  select.addEventListener("change", () => {
    window.currentThemeIndex = parseInt(select.value, 10);
    game.scene.keys["Game2048"].scene.restart();
  });
}

populateThemeSelector();
