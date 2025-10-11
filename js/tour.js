const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

const btn = document.getElementById('master-menu-btn');
const menu = document.getElementById('master-menu');
const caret = document.getElementById('master-caret');

btn.addEventListener("click", (e) => {
    e.stopPropagation();

    // toggle open/close
    menu.classList.toggle('hidden');
    caret.classList.toggle('rotate-180');

});
// Close when clicking outside
document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
        caret.classList.remove('rotate-180');
    }
});

function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // animate in
    // requestAnimationFrame(() => toast.classList.add('show'));
    toast.classList.add('show')
    // auto-hide
    setTimeout(() => {
        toast.classList.remove('show');
        // toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

// LogOut
function logOut(e) {
    e.preventDefault();
    // Clear login data from storage
    localStorage.setItem("isLoggedIn", "false");
    showToast(`Logout successfull!`, 'success', 1200);
    // Redirect to login page
    setTimeout(() => {
        // replace() so Back button can't resurrect a protected page
        window.location.replace("index.html");
    }, 900);
}

const APIKEY = "12345678@";
const BASE_URL = "https://hotelapi.shriyanshnath.com";
const PROPERTY_API = `${BASE_URL}/api/property`;
const TOUR_API = `${BASE_URL}/api/tour`;
const DELETE_TOUR_API = `${BASE_URL}/api/Delete_Tour`;

let tours = [];
let properties = [];
let editIndex = -1;
let currentPage = 1;
const pageSize = 5;

// UUID generator
function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (
            +c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
        ).toString(16)
    );
}

// Show message in msgBox
function showMessage(msg, type = "success") {
    const box = document.getElementById("msgBox");
    box.textContent = msg;
    box.className = `block p-3 rounded text-center text-sm ${type === "success"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
        }`;
    setTimeout(() => box.classList.add("hidden"), 3000);
}

// Fetch properties for dropdown only
async function fetchProperties() {
    try {
        const res = await fetch(`${PROPERTY_API}?APIKEY=${APIKEY}`);
        properties = await res.json();
        const select = document.getElementById("tourProperty");
        select.innerHTML = '<option value="">Select property</option>';
        properties.forEach(
            (p) =>
                (select.innerHTML += `<option value="${p.Id}">${p.PropertyName}</option>`)
        );
    } catch {
        document.getElementById("tourProperty").innerHTML =
            '<option value="">Failed to load properties</option>';
        showMessage("Error fetching properties", "error");
    }
}

// Get property name by ID
function getPropertyName(id) {
    const prop = properties.find((p) => p.Id === id);
    return prop ? prop.PropertyName : id;
}

// Fetch all tours (no filter)
async function fetchAllTours() {
    try {
        const res = await fetch(`${TOUR_API}?APIKEY=${APIKEY}`);
        return await res.json();
    } catch {
        showMessage("Error fetching tours", "error");
        return [];
    }
}

// Save tour
async function saveTour(tourObj) {
    try {
        const res = await fetch(`${TOUR_API}?APIKEY=${APIKEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tourObj),
        });
        return await res.json();
    } catch {
        showMessage("Error saving tour", "error");
        return null;
    }
}

// Delete tour
async function deleteTourById(id) {
    try {
        const url = `${DELETE_TOUR_API}?APIKEY=${APIKEY}&id=${id}`;
        const res = await fetch(url, { method: "POST" }); // No headers
        if (!res.ok) throw new Error("Delete failed");
        return await res.json(); // returns {}
    } catch {
        showMessage("Error deleting tour", "error");
        return null;
    }
}

// Render table
function renderTable() {
    const tbody = document.querySelector("#tourTable tbody");
    tbody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    const pagedTours = tours.slice(start, start + pageSize);
    pagedTours.forEach((t, i) => {
        tbody.innerHTML += `
      <tr>
        <td class="border px-3 py-2">${t.TourName}</td>
        <td class="border px-3 py-2">${t.SacCode}</td>
        <td class="border px-3 py-2">${getPropertyName(t.PropertyId)}</td>
        <td class="border px-3 py-2">${t.TourDescription}</td>
        <td class="border px-3 py-2 text-center">
          <button class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded mr-1" onclick="startEdit(${start + i
            })">Edit</button>
          <button class="bg-red-300 text-red-800 px-2 py-1 rounded" onclick="handleDelete('${t.Id
            }')">Delete</button>
        </td>
      </tr>`;
    });
    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(tours.length / pageSize);
    const pag = document.getElementById("pagination");
    pag.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        pag.innerHTML += `<button onclick="gotoPage(${i})" class="px-3 py-1 rounded ${i === currentPage ? "bg-green-500 text-white" : "bg-gray-200"
            }">${i}</button>`;
    }
}

// Pagination click
window.gotoPage = function (p) {
    currentPage = p;
    renderTable();
};

// Load all tours
async function loadTours() {
    tours = await fetchAllTours();
    currentPage = 1;
    renderTable();
}

// Add / Update tour
document.getElementById("addBtn").onclick = async function () {
    const name = document.getElementById("tourName").value.trim();
    const sac = document.getElementById("activitySAC").value.trim();
    const propertyId = document.getElementById("tourProperty").value;
    const desc = document.getElementById("tourDesc").value.trim();

    if (!name || !sac || !propertyId) {
        alert("All fields required!");
        return;
    }

    const selectedProp = properties.find((p) => p.Id === propertyId);

    const tourObj = {
        Id: editIndex !== -1 ? tours[editIndex].Id : uuidv4(),
        PropertyId: propertyId,
        property_name: selectedProp ? selectedProp.PropertyName : "",
        SacCode: sac,
        TourName: name,
        TourDescription: desc,
    };

    const result = await saveTour(tourObj);
    if (result) {
        showMessage(editIndex !== -1 ? "Tour updated!" : "Tour added!");
        document.getElementById("tourName").value = "";
        document.getElementById("activitySAC").value = "";
        document.getElementById("tourDesc").value = "";
        editIndex = -1;
        this.textContent = "Add new";
        await loadTours();
    }
};

// Edit tour
window.startEdit = function (i) {
    const t = tours[i];
    document.getElementById("tourName").value = t.TourName;
    document.getElementById("activitySAC").value = t.SacCode;
    document.getElementById("tourProperty").value = t.PropertyId;
    document.getElementById("tourDesc").value = t.TourDescription;
    editIndex = i;
    document.getElementById("addBtn").textContent = "Update";
};

// Delete tour
window.handleDelete = async function (id) {
    if (confirm("Are you sure you want to delete this tour?")) {
        const result = await deleteTourById(id);
        if (result) {
            showMessage("Tour deleted!");
            await loadTours();
        }
    }
};

// Initialize
window.onload = async function () {
    await fetchProperties(); // load dropdown
    await loadTours(); // show all tours
};
