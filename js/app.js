// ========================================
// Animal 3D Database
// app.js
// ========================================

let specimens = [];

let currentCategory = "all";
let currentSpecies = "all";
let currentSearch = "";


// ========================================
// 初期化
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    loadSpecimens();

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            currentSearch = event.target.value.trim().toLowerCase();
            renderSpecimens();
        });
    }
});


// ========================================
// specimens.json 読み込み
// ========================================

async function loadSpecimens() {
    try {
        const response = await fetch("data/specimens.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `specimens.json の読み込みに失敗しました: ${response.status}`
            );
        }

        specimens = await response.json();

        console.log("読み込んだ標本データ:", specimens);

        createCategoryButtons();
        createSpeciesButtons();
        renderSpecimens();

    } catch (error) {
        console.error("標本データの読み込みエラー:", error);

        const grid = document.getElementById("specimenGrid");

        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <p>標本データを読み込めませんでした。</p>
                    <p>${escapeHtml(error.message)}</p>
                </div>
            `;
        }
    }
}


// ========================================
// カテゴリー名
// ========================================

function getCategoryName(category) {

    const categoryNames = {
        bear: "クマ",
        fox: "キツネ",
        raccoon_dog: "タヌキ",
        deer: "シカ",
        serow: "ニホンカモシカ"
    };

    return categoryNames[category] || category;
}


// ========================================
// カテゴリーボタン作成
// ========================================

function createCategoryButtons() {

    const container = document.getElementById("categoryButtons");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const buttonAll = document.createElement("button");

    buttonAll.type = "button";
    buttonAll.className = "filter-button active";
    buttonAll.textContent = "すべて";

    buttonAll.addEventListener("click", () => {

        currentCategory = "all";
        currentSpecies = "all";

        updateCategoryButtons();
        createSpeciesButtons();
        renderSpecimens();
    });

    container.appendChild(buttonAll);


    // 登録されているカテゴリーを取得
    const categories = [
        ...new Set(
            specimens
                .map(specimen => specimen.category)
                .filter(Boolean)
        )
    ];


    categories.forEach(category => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "filter-button";
        button.dataset.category = category;
        button.textContent = getCategoryName(category);

        button.addEventListener("click", () => {

            currentCategory = category;
            currentSpecies = "all";

            updateCategoryButtons();
            createSpeciesButtons();
            renderSpecimens();
        });

        container.appendChild(button);
    });
}


// ========================================
// カテゴリーボタン状態更新
// ========================================

function updateCategoryButtons() {

    const buttons = document.querySelectorAll(
        "#categoryButtons .filter-button"
    );

    buttons.forEach(button => {

        const category = button.dataset.category;

        if (
            currentCategory === "all" &&
            !category
        ) {
            button.classList.add("active");
        }
        else if (
            category &&
            category === currentCategory
        ) {
            button.classList.add("active");
        }
        else {
            button.classList.remove("active");
        }
    });
}


// ========================================
// 種類ボタン作成
// ========================================

function createSpeciesButtons() {

    const container = document.getElementById("speciesButtons");

    if (!container) {
        return;
    }

    container.innerHTML = "";


    // 現在のカテゴリーに該当する標本
    let filteredSpecimens = specimens;

    if (currentCategory !== "all") {
        filteredSpecimens = specimens.filter(
            specimen => specimen.category === currentCategory
        );
    }


    // species の一覧
    const speciesList = [
        ...new Set(
            filteredSpecimens
                .map(specimen => specimen.species)
                .filter(Boolean)
        )
    ];


    // 種類が存在しない場合
    if (speciesList.length === 0) {
        return;
    }


    // すべて
    const buttonAll = document.createElement("button");

    buttonAll.type = "button";
    buttonAll.className = "filter-button";

    if (currentSpecies === "all") {
        buttonAll.classList.add("active");
    }

    buttonAll.textContent = "すべて";

    buttonAll.addEventListener("click", () => {

        currentSpecies = "all";

        updateSpeciesButtons();
        renderSpecimens();
    });

    container.appendChild(buttonAll);


    // 各species
    speciesList.forEach(species => {

        const specimen = filteredSpecimens.find(
            item => item.species === species
        );

        const button = document.createElement("button");

        button.type = "button";
        button.className = "filter-button";
        button.dataset.species = species;

        if (currentSpecies === species) {
            button.classList.add("active");
        }

        button.textContent =
            specimen?.name || species;

        button.addEventListener("click", () => {

            currentSpecies = species;

            updateSpeciesButtons();
            renderSpecimens();
        });

        container.appendChild(button);
    });
}


// ========================================
// 種類ボタン状態更新
// ========================================

function updateSpeciesButtons() {

    const buttons = document.querySelectorAll(
        "#speciesButtons .filter-button"
    );

    buttons.forEach(button => {

        const species = button.dataset.species;

        if (
            currentSpecies === "all" &&
            !species
        ) {
            button.classList.add("active");
        }
        else if (
            species &&
            species === currentSpecies
        ) {
            button.classList.add("active");
        }
        else {
            button.classList.remove("active");
        }
    });
}


// ========================================
// 標本表示
// ========================================

function renderSpecimens() {

    const grid = document.getElementById("specimenGrid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";


    // ----------------------------------------
    // カテゴリーで絞り込み
    // ----------------------------------------

    let filtered = specimens;

    if (currentCategory !== "all") {

        filtered = filtered.filter(
            specimen =>
                specimen.category === currentCategory
        );
    }


    // ----------------------------------------
    // speciesで絞り込み
    // ----------------------------------------

    if (currentSpecies !== "all") {

        filtered = filtered.filter(
            specimen =>
                specimen.species === currentSpecies
        );
    }


    // ----------------------------------------
    // 検索
    // ----------------------------------------

    if (currentSearch) {

        filtered = filtered.filter(specimen => {

            const searchText = [
                specimen.id,
                specimen.name,
                specimen.scientificName,
                specimen.part,
                specimen.location,
                specimen.description,
                specimen.category,
                specimen.species
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchText.includes(currentSearch);
        });
    }


    // ----------------------------------------
    // 該当なし
    // ----------------------------------------

    if (filtered.length === 0) {

        grid.innerHTML = `
            <div class="no-results">
                <p>該当する標本がありません。</p>
            </div>
        `;

        return;
    }


    // ----------------------------------------
    // speciesごとにグループ化
    // ----------------------------------------

    const speciesGroups = new Map();

    filtered.forEach(specimen => {

        const key =
            specimen.species ||
            specimen.category ||
            "other";

        if (!speciesGroups.has(key)) {
            speciesGroups.set(key, []);
        }

        speciesGroups.get(key).push(specimen);
    });


    // ----------------------------------------
    // 表示
    // ----------------------------------------

    speciesGroups.forEach((group, species) => {

        const firstSpecimen = group[0];

        // 種類タイトル
        const speciesSection =
            document.createElement("section");

        speciesSection.className =
            "species-section";


        const speciesTitle =
            document.createElement("h2");

        speciesTitle.className =
            "species-title";

        speciesTitle.textContent =
            firstSpecimen.name ||
            species;


        speciesSection.appendChild(speciesTitle);


        // 標本グリッド
        const specimenGrid =
            document.createElement("div");

        specimenGrid.className =
            "specimen-grid";


        group.forEach(specimen => {

            const card =
                createSpecimenCard(specimen);

            specimenGrid.appendChild(card);
        });


        speciesSection.appendChild(specimenGrid);

        grid.appendChild(speciesSection);
    });
}


// ========================================
// 標本カード作成
// ========================================

function createSpecimenCard(specimen) {

    const card =
        document.createElement("article");

    card.className =
        "specimen-card";


    // ----------------------------------------
    // 3D Viewer
    // ----------------------------------------

    const viewer =
        document.createElement("model-viewer");

    viewer.className =
        "specimen-viewer";

    viewer.setAttribute(
        "camera-controls",
        ""
    );

    viewer.setAttribute(
        "auto-rotate",
        ""
    );

    viewer.setAttribute(
        "shadow-intensity",
        "1"
    );

    viewer.setAttribute(
        "loading",
        "lazy"
    );

    viewer.setAttribute(
        "touch-action",
        "pan-y"
    );

    viewer.setAttribute(
        "ar",
        ""
    );

    viewer.setAttribute(
        "ar-modes",
        "webxr scene-viewer quick-look"
    );


    // GLB読み込み
    if (specimen.model) {

        viewer.src = specimen.model;

    } else {

        console.warn(
            `3Dモデルのパスがありません: ${specimen.id}`
        );
    }


    // GLB読み込みエラー
    viewer.addEventListener(
        "error",
        event => {

            console.error(
                `3Dモデル読み込みエラー: ${specimen.id}`,
                event
            );
        }
    );


    card.appendChild(viewer);


    // ----------------------------------------
    // 情報
    // ----------------------------------------

    const info =
        document.createElement("div");

    info.className =
        "specimen-info";


    // 標本名
    const title =
        document.createElement("h3");

    title.textContent =
        specimen.name || "標本";

    info.appendChild(title);


    // ID
    if (specimen.id) {

        const id =
            document.createElement("p");

        id.className =
            "specimen-id";

        id.textContent =
            specimen.id;

        info.appendChild(id);
    }


    // 学名
    if (specimen.scientificName) {

        const scientificName =
            document.createElement("p");

        scientificName.className =
            "scientific-name";

        scientificName.textContent =
            specimen.scientificName;

        info.appendChild(scientificName);
    }


    // 部位
    if (specimen.part) {

        const part =
            document.createElement("p");

        part.textContent =
            `部位：${specimen.part}`;

        info.appendChild(part);
    }


    // 採集地
    if (specimen.location) {

        const location =
            document.createElement("p");

        location.textContent =
            `場所：${specimen.location}`;

        info.appendChild(location);
    }


    // 説明
    if (specimen.description) {

        const description =
            document.createElement("p");

        description.className =
            "specimen-description";

        description.textContent =
            specimen.description;

        info.appendChild(description);
    }


    card.appendChild(info);


    // ----------------------------------------
    // ダウンロード
    // ----------------------------------------

    if (
        specimen.downloads &&
        specimen.downloads.length > 0
    ) {

        const downloadContainer =
            document.createElement("div");

        downloadContainer.className =
            "download-buttons";


        specimen.downloads.forEach(download => {

            if (!download.url) {
                return;
            }

            const link =
                document.createElement("a");

            link.className =
                "download-button";

            link.href =
                download.url;

            link.download = "";

            link.textContent =
                `ダウンロード ${download.format || download.name || ""}`;


            downloadContainer.appendChild(link);
        });


        info.appendChild(downloadContainer);
    }


    return card;
}


// ========================================
// HTMLエスケープ
// ========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
