const API_URL = "https://script.google.com/macros/s/AKfycbxKhOP0RS1kK1eZPmoh2PtuxfMDjiknZKVjcE4W6fm77zZCjHxyiud0WDvReVo9BaKN/exec";

const form = document.getElementById("resourceForm");
const tableBody = document.querySelector("#resourceTable tbody");
const searchInput = document.getElementById("search");
const statusMsg = document.getElementById("statusMsg");

async function fetchResources() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    renderTable(data);
  } catch (err) {
    console.error("Error fetching resources:", err);
  }
}

function renderTable(data) {
  tableBody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");

    const titleCell = document.createElement("td");
    const link = document.createElement("a");
    link.href = row.URL;
    link.target = "_blank";
    link.textContent = row.Title;
    titleCell.appendChild(link);
    tr.appendChild(titleCell);

    tr.innerHTML += `
      <td>${row.Type}</td>
      <td>${row.Tags}</td>
      <td>${row.Description}</td>
      <td>${row.AddedBy}</td>
    `;

    tableBody.appendChild(tr);
  });

  // Store data for filtering
  window._resourceData = data;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const result = await res.json();
    if (result.status === "success") {
      statusMsg.textContent = "✅ Resource added successfully!";
      form.reset();
      fetchResources();
    } else {
      statusMsg.textContent = "⚠️ Failed to add resource.";
    }
  } catch (err) {
    statusMsg.textContent = "❌ Error submitting resource.";
    console.error(err);
  }
});

searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const data = window._resourceData || [];
  const filtered = data.filter(row =>
    (row.Title && row.Title.toLowerCase().includes(query)) ||
    (row.Tags && row.Tags.toLowerCase().includes(query))
  );
  renderTable(filtered);
});

fetchResources();
