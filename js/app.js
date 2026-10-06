let specimens = [];

let currentCategory = "all";

const specimenGrid =
    document.getElementById("specimenGrid");

const searchInput =
    document.getElementById("searchInput");

const noResults =
    document.getElementById("noResults");

const viewerModal =
    document.getElementById("viewerModal");

const closeModal =
    document.getElementById("closeModal");

const modelViewer =
    document.getElementById("modelViewer");

const modalTitle =
    document.getElementById("modalTitle");

const modalScientificName =
    document.getElementById("modalScientificName");

const modalId =
    document.getElementById("modalId");

const modalPart =
    document.getElementById("modalPart");

const modalLocation =
    document.getElementById("modalLocation");

const modalDescription =
    document.getElementById("modalDescription");

const downloadButtons =
    document.getElementById("downloadButtons");


/* =========================
   Load database
========================= */

async function loadSpecimens() {

    try {

        const response =
            await fetch("data/specimens.json");

        if (!response.ok) {
            throw new Error(
                "specimens.jsonを読み込めませんでした。"
            );
        }

        specimens =
            await response.json();

        displaySpecimens();

    } catch (error) {

        console.error(error);

        specimenGrid.innerHTML = `
            <p>
                標本データを読み込めませんでした。
            </p>
        `;
    }
}


/* =========================
   Display specimens
========================= */

function displaySpecimens() {

    const keyword =
        searchInput.value
            .trim()
            .toLowerCase();

    const filtered =
        specimens.filter(specimen => {

            const categoryMatch =
                currentCategory === "all" ||
                specimen.category === currentCategory;

            const searchTarget = [
                specimen.id,
                specimen.name,
                specimen.scientificName,
                specimen.part,
                specimen.location
            ]
                .join(" ")
                .toLowerCase();

            const searchMatch =
                keyword === "" ||
                searchTarget.includes(keyword);

            return categoryMatch &&
                   searchMatch;
        });


    specimenGrid.innerHTML = "";


    if (filtered.length === 0) {

        noResults.classList.remove("hidden");

        return;
    }


    noResults.classList.add("hidden");


    filtered.forEach(specimen => {

        const card =
            document.createElement("article");

        card.className =
            "specimen-card";


        card.innerHTML = `

            <div class="card-viewer">

                <model-viewer
                    src="${specimen.model}"
                    camera-controls
                    auto-rotate
                    shadow-intensity="1"
                    environment-image="neutral"
                    alt="${specimen.name}">
                </model-viewer>

            </div>

            <div class="card-info">

                <h2>
                    ${specimen.name}
                </h2>

                <p class="scientific-name">
                    ${specimen.scientificName}
                </p>

                <p class="specimen-number">
                    標本番号：${specimen.id}
                </p>

                <button
                    class="view-button"
                    data-id="${specimen.id}">
                    詳細を見る
                </button>

            </div>
        `;


        specimenGrid.appendChild(card);
    });


    document
        .querySelectorAll(".view-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openViewer(
                        button.dataset.id
                    );

                }
            );

        });
}


/* =========================
   Open viewer
========================= */

function openViewer(id) {

    const specimen =
        specimens.find(
            item => item.id === id
        );

    if (!specimen) {
        return;
    }


    modelViewer.src =
        specimen.model;

    modelViewer.alt =
        specimen.name;


    modalTitle.textContent =
        specimen.name;

    modalScientificName.textContent =
        specimen.scientificName;

    modalId.textContent =
        specimen.id;

    modalPart.textContent =
        specimen.part;

    modalLocation.textContent =
        specimen.location;

    modalDescription.textContent =
        specimen.description;


    /* ダウンロード */

    downloadButtons.innerHTML = "";


    if (
        specimen.downloads &&
        specimen.downloads.length > 0
    ) {

        specimen.downloads.forEach(file => {

            const link =
                document.createElement("a");

            link.href =
                file.url;

            link.download = "";

            link.className =
                "download-button";

            link.textContent =
                `${file.format} をダウンロード`;

            downloadButtons.appendChild(link);

        });

    } else {

        downloadButtons.innerHTML = `
            <p>
                現在ダウンロードデータはありません。
            </p>
        `;
    }


    viewerModal.classList.remove("hidden");

    document.body.style.overflow =
        "hidden";
}


/* =========================
   Close viewer
========================= */

function closeViewer() {

    viewerModal.classList.add("hidden");

    modelViewer.removeAttribute("src");

    document.body.style.overflow =
        "";
}


closeModal.addEventListener(
    "click",
    closeViewer
);


/* モーダル外をクリック */

viewerModal.addEventListener(
    "click",
    event => {

        if (
            event.target === viewerModal
        ) {
            closeViewer();
        }

    }
);


/* Escキー */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !viewerModal.classList.contains("hidden")
        ) {

            closeViewer();
        }

    }
);


/* =========================
   Search
========================= */

searchInput.addEventListener(
    "input",
    displaySpecimens
);


/* =========================
   Category
========================= */

document
    .querySelectorAll(".category-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".category-btn"
                    )
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                currentCategory =
                    button.dataset.category;


                displaySpecimens();

            }
        );

    });


/* =========================
   Start
========================= */

loadSpecimens();