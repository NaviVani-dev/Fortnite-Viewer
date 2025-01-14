async function getShop() {
  const url = "https://fortnite-api.com/v2/shop";
  const root = document.getElementById("root");
  const loadingScreen = document.getElementById("loading-div");
  let json;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`ERROR!!!!!: ${response.status}`);
    }

    json = await response.json();
  } catch (error) {
    console.error("WHAAAAT", error.message);
    const loadingImg = loadingScreen.querySelector("img");
    const loadingText = loadingScreen.querySelector("p");
    loadingImg.src = "./src/assets/images/error.png";
    loadingText.textContent = "Error al cargar la tienda!";
  } finally {
    let shopEntries = json.data.entries;
    shopEntries.forEach((entry) => {
      const categoryName = entry.layout.name;
      const isBundle = !!entry.bundle;

      // gets the type of entry on the shop
      const entryTypes = {
        brItems: "brItem",
        tracks: "track",
        instruments: "instrument",
        cars: "cars",
      };
      const entryType =
        Object.keys(entryTypes).find((key) => !!entry[key]) || "unknown";

      // get the name
      const nameMapping = {
        brItems: entry.brItems?.[0]?.name,
        tracks: entry.tracks?.[0]?.title,
        instruments: entry.instruments?.[0]?.name,
        cars: entry.cars?.[0]?.name,
      };
      const entryName = isBundle
        ? entry.bundle.name
        : nameMapping[entryType] || "Unknown Item";

      //gets the object type, not the entry type, ex. Pickaxe, Backbling, etc
      const objectMapping = {
        brItems: entry.brItems?.[0]?.type.displayValue,
        tracks: "Jam Track",
        instruments: entry.instruments?.[0]?.type.displayValue,
        cars: entry.cars?.[0]?.type.displayValue,
      };
      const objectType = isBundle
        ? entry.bundle.info
        : objectMapping[entryType] || "Unknown Type";

      // gets the entry image
      const imageMapping = {
        brItems: entry.brItems?.[0]?.images?.icon,
        tracks: entry.tracks?.[0]?.albumArt,
        instruments: entry.instruments?.[0]?.images?.large,
        cars: entry.cars?.[0]?.images?.large,
      };
      const entryImage = isBundle
        ? entry.bundle.image
        : imageMapping[entryType] || "./src/assets/images/noitem.png";

      //gets the colors of the background
      const entryColors = entry.colors && Object.values(entry.colors);
      setEntryCategory(categoryName);

      const entryData = {
        name: entryName,
        category: categoryName,
        type: objectType,
        regularPrice: entry.regularPrice,
        finalPrice: entry.finalPrice,
        artist: entryType == "tracks" && entry.tracks?.[0].artist,
        banner: entry.banner && entry.banner.value,
        bannerIntensity: entry.banner && entry.banner.intensity,
        image: entryImage,
        bgColors: entryColors,
      };

      console.log(entry);
      createItem(entryData);
    });
    const jamTracks = document.getElementById("jamtracks-container");
    const shopContainer = document.getElementById("shop-container");
    root.removeChild(loadingScreen);
    shopContainer.removeChild(jamTracks);
    shopContainer.appendChild(jamTracks);
  }
}

function setEntryCategory(categoryName) {
  const categoryId = categoryName.replace(/\s+/g, "").toLowerCase();

  if (!document.getElementById(categoryId)) {
    const shopDiv = document.getElementById("shop-container");
    const categoryDiv = document.createElement("div");
    categoryDiv.setAttribute("class", "shop-category");
    categoryDiv.setAttribute("id", `${categoryId}-container`);

    categoryDiv.innerHTML = `
      <h1>${categoryName}</h1>
      <div id="${categoryId}" class="container"></div>
    `;
    shopDiv.appendChild(categoryDiv);
  }
}

function createItem(item) {
  const categoryId = item.category.replace(/\s+/g, "").toLowerCase();
  const categoryDiv = document.getElementById(categoryId);
  const itemDiv = document.createElement("div");
  itemDiv.setAttribute("class", "shop-item");
  if (item.bgColors) {
    itemDiv.setAttribute(
      "style",
      `background-image: linear-gradient(#${item.bgColors[0]}, #${item.bgColors[1]});`,
    );
  }

  const detailsStyle =
    item.bgColors &&
    `style="background-image: linear-gradient(#ffffff00, #${item.bgColors[item.bgColors.length - 1]});"`;

  const bannerDiv = item.banner
    ? `<div class="banner" style="background-color: ${item.bannerIntensity == "High" ? "#f7ff19" : "white"};">${item.banner}</div>`
    : "";
  const artistDiv = item.artist ? `<p class="artist">${item.artist}</p>` : "";
  const regularPriceDiv =
    item.regularPrice !== item.finalPrice
      ? `<p class="regular-price">${item.regularPrice}</p>`
      : "";
  itemDiv.innerHTML = `
    ${bannerDiv}
    <img src="${item.image}" />
    <div class="details" ${detailsStyle}>
        ${artistDiv}
        <h1>${item.name}</h1>
        <p class="type">${item.type}</p>
        <div class="price">
            <svg viewBox="0 0 20 20">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    fill="currentColor"
                    d="M10,20c5.5,0,10-4.5,10-10c0-5.5-4.5-10-10-10C4.5,0,0,4.5,0,10C0,15.5,4.5,20,10,20z M5,4.8
            c0.7,3,1.6,6.6,2.5,10.7c3,0,4.5,0.1,4.5,0.1l2.5-11.2h-3l-1.7,9c-0.6-2.7-1.1-5.5-1.6-8.6L5,4.8z"
                ></path>
            </svg>
            <p>${item.finalPrice}</p>
            ${regularPriceDiv}
        </div>
    </div>
  `;
  categoryDiv.appendChild(itemDiv);
}
getShop();
