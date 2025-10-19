// === Global Data ===
let allResources = [];
let currentResources = [];
let sortDirection = 1; // 1 = ascending, -1 = descending

// === Load Resources from Google Apps Script ===
async function fetchResources() {
    const response = await fetch("https://immersion-resources.matskye28.workers.dev/"); // same endpoint as before
    const data = await response.json();
    allResources = data;
    populateFilters();
    renderResources(allResources);
}

// === Render the Table ===
function renderResources(list) {
    const tbody = document.querySelector("#resourceTable tbody");
    tbody.innerHTML = "";

    list.forEach(resource => {
        const tr = document.createElement("tr");

        const titleTd = document.createElement("td");
        const link = document.createElement("a");
        link.href = resource.URL;
        link.textContent = resource.Title;
        link.target = "_blank";
        titleTd.appendChild(link);
        tr.appendChild(titleTd);

        const typeTd = document.createElement("td");
        typeTd.textContent = resource.Type;
        tr.appendChild(typeTd);

        const tagsTd = document.createElement("td");
        tagsTd.innerHTML = renderTags(resource.Tags);
        tr.appendChild(tagsTd);

        const descTd = document.createElement("td");
        descTd.textContent = resource.Description || "";
        tr.appendChild(descTd);

        const addedByTd = document.createElement("td");
        addedByTd.textContent = resource.AddedBy || "";
        tr.appendChild(addedByTd);

        tbody.appendChild(tr);
    });

    attachTagListeners();
}

// === Render Tags ===
function renderTags(tagString) {
    if (!tagString) return "";
    return tagString.split(",").map(tag => {
        const clean = tag.trim();
        return `<span class="tag" data-tag="${clean}">${clean}</span>`;
    }).join(" ");
}

// === Attach click handlers to tags ===
function attachTagListeners() {
    document.querySelectorAll(".tag").forEach(tagEl => {
        tagEl.addEventListener("click", () => {
            const tag = tagEl.dataset.tag;
            document.querySelector("#search").value = tag;
            applyFilters();
        });
    });
}

// === Populate filter dropdowns ===
function populateFilters() {
    const typeSelect = document.querySelector("#filterType");
    const uniqueTypes = [...new Set(allResources.map(r => r.Type))].sort();
    uniqueTypes.forEach(type => {
        const opt = document.createElement("option");
        opt.value = type;
        opt.textContent = type;
        typeSelect.appendChild(opt);
    });
}

// === Apply all filters/sorting/search ===
function applyFilters() {
    const search = document.querySelector("#search").value.toLowerCase().trim();
    const typeFilter = document.querySelector("#filterType").value;
    const sortBy = document.querySelector("#sortBy").value;

    currentResources = allResources.filter(r => {
        const matchesSearch =
        !search ||
        r.Title.toLowerCase().includes(search) ||
        (r.Tags && r.Tags.toLowerCase().includes(search));
        const matchesType = !typeFilter || r.Type === typeFilter;
        return matchesSearch && matchesType;
    });

    currentResources.sort((a, b) => {
        const valA = (a[sortBy] || "").toLowerCase();
        const valB = (b[sortBy] || "").toLowerCase();
        return valA.localeCompare(valB) * sortDirection;
    });

    renderResources(currentResources);
}

// === Event Listeners ===
document.querySelector("#search").addEventListener("input", applyFilters);
document.querySelector("#filterType").addEventListener("change", applyFilters);
document.querySelector("#sortBy").addEventListener("change", applyFilters);
document.querySelector("#sortDir").addEventListener("click", () => {
    sortDirection *= -1;
    document.querySelector("#sortDir").textContent = sortDirection === 1 ? "▲" : "▼";
    applyFilters();
});

// === Form Submission ===
document.querySelector("#resourceForm").addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const obj = Object.fromEntries(formData.entries());

    const response = await fetch("https://immersion-resources.matskye28.workers.dev/", {
        method: "POST",
        body: JSON.stringify(obj),
                                 headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();
    document.querySelector("#statusMsg").textContent = result.message || "Added!";
    fetchResources(); // reload list
    e.target.reset();
});

// === Collapsible Form ===
document.querySelector("#toggleForm").addEventListener("click", () => {
    const container = document.querySelector("#formContainer");
    const btn = document.querySelector("#toggleForm");
    const isCollapsed = container.classList.toggle("collapsed");
    btn.textContent = isCollapsed ? "＋ Add a Resource" : "− Hide Form";
});

// === Initialize ===
fetchResources();
