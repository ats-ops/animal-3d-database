// ==============================
// Animal 3D Database
// app.js
// ==============================

let specimens = [];
let currentCategory = "all";
let currentSpecies = "all";
let currentSearch = "";


// ==============================
// 初期化
// ==============================

document.addEventListener("DOMContentLoaded", () => {

    loadSpecimens();

    // 検索
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            currentSearch = event.target.value.toLowerCase().trim();
            renderSpecimens();
        });
    }

    // モーダル閉じる
    const closeModal = document.getElementById("closeModal");
    const modal = document.getElementById("viewerModal");

    if (closeModal) {
        closeModal.addEventListener("click", closeViewer);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeViewer();
            }
        });
    }

    // Escキー
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeViewer();
        }
    });
});


// ==============================
// JSON読み込み
// ==============================

async function loadSpecimens() {

    try {

        const response = await fetch("data/specimens.json");

        if (!response.ok) {
            throw new Error(
                `specimens.jsonの読み込みに失敗しました: ${response.status}`
            );
        }

        specimens = await response.json();

        console.log("標本データ:", specimens);

        createCategoryButtons();
        renderSpecimens();

    } catch (error) {

        console.error(error);

        const grid = document.getElementById("specimenGrid");

        if (grid) {
            grid.innerHTML = `
                <p class="error">
                    標本データを読み込めませんでした。
                </p>
            `;
        }
    }
}


// ==============================
// カテゴリボタン生成
// ==============================

function createCategoryButtons() {

    const container =
        document.getElementById("categoryButtons");

    if (!container) return;

    container.innerHTML = "";

    // 登録されているカテゴリ
    const categories = [
        ...new Set(
            specimens.map(specimen => specimen.category)
        )
    ];

    // 「すべて」
    const allButton =
        document.createElement("button");

    allButton.textContent = "すべて";
    allButton.className = "category-button active";
    allButton.dataset.category = "all";

    allButton.addEventListener("click", () => {

        currentCategory = "all";
        currentSpecies = "all";

        updateCategoryButtonState();
        createSpeciesButtons();
        renderSpecimens();

    });

    container.appendChild(allButton);


    // カテゴリ
    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.textContent =
            getCategoryName(category);

        button.className =
            "category-button";

        button.dataset.category =
            category;

        button.addEventListener("click", () => {

            currentCategory = category;
            currentSpecies = "all";

            updateCategoryButtonState();
            createSpeciesButtons();
            renderSpecimens();

        });

        container.appendChild(button);
    });

    createSpeciesButtons();
}


// ==============================
// カテゴリ名
// ==============================

function getCategoryName(category) {

    const names = {

        bear: "クマ",

        fox: "キツネ",

        raccoon_dog: "タヌキ",

        deer: "シカ",

        serow: "ニホンカモシカ"

    };

    return names[category] || category;
}


// ==============================
// 種ボタン生成
// ==============================

function createSpeciesButtons() {

    const container =
        document.getElementById("speciesButtons");

    if (!container) return;

    container.innerHTML = "";

    let filtered = specimens;

    // カテゴリで絞る
    if (currentCategory !== "all") {

        filtered = specimens.filter(
            specimen =>
                specimen.category === currentCategory
        );
    }


    // species と name の組み合わせ
    const speciesMap = new Map();

    filtered.forEach(specimen => {

        if (!specimen.species) return;

        if (!speciesMap.has(specimen.species)) {

            speciesMap.set(
                specimen.species,
                specimen.name
            );
        }
    });


    const speciesList =
        [...speciesMap.entries()];


    // 1種類以下なら種ボタンを表示しない
    if (speciesList.length <= 1) {

        container.style.display = "none";

        return;
    }

    container.style.display = "flex";


    // 「すべて」
    const allButton =
        document.createElement("button");

    allButton.textContent = "すべて";
    allButton.className =
        "species-button active";

    allButton.dataset.species = "all";

    allButton.addEventListener("click", () => {

        currentSpecies = "all";

        updateSpeciesButtonState();
        renderSpecimens();

    });

    container.appendChild(allButton);


    // 種ボタン
    speciesList.forEach(([species, name]) => {

        const button =
            document.createElement("button");

        button.textContent = name;

        button.className =
            "species-button";

        button.dataset.species =
            species;

        button.addEventListener("click", () => {

            currentSpecies = species;

            updateSpeciesButtonState();
            renderSpecimens();

        });

        container.appendChild(button);
    });
}


// ==============================
// カテゴリボタン状態
// ==============================

function updateCategoryButtonState() {

    const buttons =
        document.querySelectorAll(
            ".category-button"
        );

    buttons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.category ===
                currentCategory
        );

    });
}


// ==============================
// 種ボタン状態
// ==============================

function updateSpeciesButtonState() {

    const buttons =
        document.querySelectorAll(
            ".species-button"
        );

    buttons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.species ===
                currentSpecies
        );

    });
}


// ==============================
// 標本表示
// ==============================

function renderSpecimens() {

    const grid =
        document.getElementById("specimenGrid");

    if (!grid) return;

    grid.innerHTML = "";


    // ------------------------------
    // フィルター
    // ------------------------------

    const filtered =
        specimens.filter(specimen => {

            // カテゴリ
            if (
                currentCategory !== "all" &&
                specimen.category !==
                    currentCategory
            ) {
                return false;
            }


            // 種
            if (
                currentSpecies !== "all" &&
                specimen.species !==
                    currentSpecies
            ) {
                return false;
            }


            // 検索
            if (currentSearch) {

                const text = [

                    specimen.id,

                    specimen.name,

                    specimen.species,

                    specimen.scientificName,

                    specimen.part,

                    specimen.location,

                    specimen.description

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                if (!text.includes(currentSearch)) {

                    return false;

                }
            }


            return true;

        });


    // ------------------------------
    // 該当なし
    // ------------------------------

    if (filtered.length === 0) {

        grid.innerHTML = `
            <p class="no-results">
                該当する標本がありません。
            </p>
        `;

        return;
    }


    // ------------------------------
    // 種ごとにグループ化
    // ------------------------------

    const groups = {};

    filtered.forEach(specimen => {

        const species =
            specimen.species ||
            "unknown";

        if (!groups[species]) {

            groups[species] = [];

        }

        groups[species].push(specimen);

    });


    // ------------------------------
    // 種ごとに表示
    // ------------------------------

    Object.entries(groups).forEach(
        ([species, items]) => {

            // 種名
            const title =
                document.createElement("h2");

            title.className =
                "species-title";

            title.textContent =
                items[0].name || species;

            grid.appendChild(title);


            // 個体カード用グリッド
            const speciesGrid =
                document.createElement("div");

            speciesGrid.className =
                "species-grid";


            // 個体
            items.forEach(specimen => {

                const card =
                    createSpecimenCard(
                        specimen
                    );

                speciesGrid.appendChild(card);

            });


            grid.appendChild(speciesGrid);

        }
    );
}


// ==============================
// 標本カード
// ==============================

function createSpecimenCard(specimen) {

    const card =
        document.createElement("article");

    card.className =
        "specimen-card";


    // ------------------------------
    // 3Dモデル
    // ------------------------------

    const viewer =
        document.createElement("model-viewer");

    viewer.src = specimen.model;

    viewer.alt =
        `${specimen.name} ${specimen.id} の3Dモデル`;

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


    // モデル読み込みエラー
    viewer.addEventListener(
        "error",
        () => {

            console.error(
                "3Dモデルの読み込みに失敗:",
                specimen.model
            );

        }
    );


    // クリック
    viewer.addEventListener(
        "click",
        () => {

            openViewer(specimen);

        }
    );


    // ------------------------------
    // カード情報
    // ------------------------------

    const info =
        document.createElement("div");

    info.className =
        "specimen-info";


    // 名前
    const name =
        document.createElement("h3");

    name.textContent =
        `${specimen.name} #${specimen.id}`;


    // 学名
    const scientificName =
        document.createElement("p");

    scientificName.className =
        "scientific-name";

    scientificName.textContent =
        specimen.scientificName || "";


    // 部位
    const part =
        document.createElement("p");

    part.textContent =
        `部位：${specimen.part || "―"}`;


    // 採取地
    const location =
        document.createElement("p");

    location.textContent =
        `採取地：${specimen.location || "―"}`;


    // 詳細ボタン
    const button =
        document.createElement("button");

    button.className =
        "view-button";

    button.textContent =
        "3Dモデルを見る";

    button.addEventListener(
        "click",
        () => {

            openViewer(specimen);

        }
    );


    // 組み立て
    info.appendChild(name);
    info.appendChild(scientificName);
    info.appendChild(part);
    info.appendChild(location);
    info.appendChild(button);

    card.appendChild(viewer);
    card.appendChild(info);


    return card;
}


// ==============================
// モーダルを開く
// ==============================

function openViewer(specimen) {

    const modal =
        document.getElementById(
            "viewerModal"
        );

    const modalViewer =
        document.getElementById(
            "modalViewer"
        );

    const modalTitle =
        document.getElementById(
            "modalTitle"
        );

    const modalScientificName =
        document.getElementById(
            "modalScientificName"
        );

    const modalPart =
        document.getElementById(
            "modalPart"
        );

    const modalLocation =
        document.getElementById(
            "modalLocation"
        );

    const modalDescription =
        document.getElementById(
            "modalDescription"
        );

    const downloadContainer =
        document.getElementById(
            "downloadButtons"
        );


    if (!modal) {

        console.error(
            "viewerModalが見つかりません"
        );

        return;
    }


    // ------------------------------
    // 3Dモデル
    // ------------------------------

    if (modalViewer) {

        // 一度モデルを解除
        modalViewer.removeAttribute(
            "src"
        );

        // 次のモデルを設定
        modalViewer.src =
            specimen.model;

        modalViewer.alt =
            `${specimen.name} ${specimen.id} の3Dモデル`;


        console.log(
            "3Dモデル読み込み:",
            specimen.model
        );


        modalViewer.addEventListener(
            "error",
            () => {

                console.error(
                    "モーダル3Dモデル読み込み失敗:",
                    specimen.model
                );

            },
            { once: true }
        );

    }


    // ------------------------------
    // 情報
    // ------------------------------

    if (modalTitle) {

        modalTitle.textContent =
            `${specimen.name} #${specimen.id}`;

    }


    if (modalScientificName) {

        modalScientificName.textContent =
            specimen.scientificName || "";

    }


    if (modalPart) {

        modalPart.textContent =
            `部位：${specimen.part || "―"}`;

    }


    if (modalLocation) {

        modalLocation.textContent =
            `採取地：${specimen.location || "―"}`;

    }


    if (modalDescription) {

        modalDescription.textContent =
            specimen.description || "";

    }


    // ------------------------------
    // ダウンロード
    // ------------------------------

    if (downloadContainer) {

        downloadContainer.innerHTML = "";


        if (
            specimen.downloads &&
            specimen.downloads.length > 0
        ) {

            specimen.downloads.forEach(
                file => {

                    const link =
                        document.createElement("a");

                    link.href =
                        file.url;

                    link.textContent =
                        `${file.format} をダウンロード`;

                    link.className =
                        "download-button";

                    link.setAttribute(
                        "download",
                        ""
                    );

                    downloadContainer.appendChild(
                        link
                    );

                }
            );

        } else {

            downloadContainer.innerHTML =
                "<p>ダウンロードファイルはありません。</p>";

        }

    }


    // ------------------------------
    // モーダル表示
    // ------------------------------

    modal.classList.add("active");

    document.body.style.overflow =
        "hidden";
}


// ==============================
// モーダルを閉じる
// ==============================

function closeViewer() {

    const modal =
        document.getElementById(
            "viewerModal"
        );

    if (!modal) return;


    modal.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";


    // 3Dモデルを解除
    const viewer =
        document.getElementById(
            "modalViewer"
        );

    if (viewer) {

        viewer.removeAttribute(
            "src"
        );

    }
}
