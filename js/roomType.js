const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});



const APIKEY = "12345678@";
const BASE_URL = "https://hotelapi.shriyanshnath.com";
const PROPERTY_API = `${BASE_URL}/api/property`;
const ROOM_API = `${BASE_URL}/api/roomtype`;
const DELETE_ROOMTYPE_API = `${BASE_URL}/api/Delete_roomtype`;

let rooms = [];
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

// Fetch properties (dropdown only for POST)
async function fetchProperties() {
    try {
        const res = await fetch(`${PROPERTY_API}?APIKEY=${APIKEY}`);
        properties = (await res.json()) || [];
        const select = document.getElementById("roomProperty");
        select.innerHTML = '<option value="">Select property</option>';
        properties.forEach((p) => {
            select.innerHTML += `<option value="${p.Id}">${p.PropertyName}</option>`;
        });
    } catch {
        document.getElementById("roomProperty").innerHTML =
            '<option value="">Failed to load properties</option>';
        showMessage("Error fetching properties", "error");
    }
}

// Fetch all rooms (no property filter)
async function fetchAllRooms() {
    try {
        const res = await fetch(`${ROOM_API}?APIKEY=${APIKEY}`);
        return await res.json();
    } catch {
        showMessage("Error fetching rooms", "error");
        return [];
    }
}

// Save room
async function saveRoom(roomObj) {
    try {
        const res = await fetch(`${ROOM_API}?APIKEY=${APIKEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(roomObj),
        });
        return await res.json();
    } catch {
        showMessage("Error saving room", "error");
        return null;
    }
}

// Delete room using POST API
async function deleteRoomById(id) {
    try {
        const url = `${DELETE_ROOMTYPE_API}?APIKEY=${APIKEY}&id=${id}`;
        const res = await fetch(url, { method: "POST" });
        if (!res.ok) throw new Error("Delete failed");
        return await res.json();
    } catch {
        showMessage("Error deleting room", "error");
        return null;
    }
}

function getPropertyName(id) {
    const prop = properties.find((p) => p.Id == id);
    return prop ? prop.PropertyName : id;
}

// Render pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const container = document.getElementById("pagination");
    container.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        container.innerHTML += `<button class="px-3 py-1 m-1 rounded ${i === currentPage ? "bg-green-500 text-white" : "bg-gray-200"
            }" onclick="goToPage(${i})">${i}</button>`;
    }
}

window.goToPage = function (page) {
    currentPage = page;
    renderTable();
};

// Render table
function renderTable() {
    const tbody = document.querySelector("#roomTable tbody");
    tbody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    const pagedRooms = rooms.slice(start, start + pageSize);
    pagedRooms.forEach((r, i) => {
        tbody.innerHTML += `
        <tr>
          <td class="border px-3 py-2">${r.Type}</td>
          <td class="border px-3 py-2">${r.saccode || ""}</td>
          <td class="border px-3 py-2">${getPropertyName(r.ProprtyId)}</td>
          <td class="border px-3 py-2">${r.PropertyDescription || ""}</td>
          <td class="border px-3 py-2 text-center">
            <button class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded mr-1" onclick="startEdit(${start + i
            })">Edit</button>
            <button class="bg-red-300 text-red-800 px-2 py-1 rounded" onclick="handleDelete('${r.Id
            }')">Delete</button>
          </td>
        </tr>`;
    });
    renderPagination(rooms.length);
}

// Load rooms (all rooms for table)
async function loadRooms() {
    rooms = await fetchAllRooms();
    currentPage = 1;
    renderTable();
}

// Add / Update button
document.getElementById("addBtn").onclick = async function () {
    const name = document.getElementById("roomName").value.trim();
    const sac = document.getElementById("roomSAC").value.trim();
    const propertyId = document.getElementById("roomProperty").value;
    const desc = document.getElementById("roomDesc").value.trim();
    if (!name || !propertyId) {
        alert("Please enter all required fields.");
        return;
    }
    const roomObj = {
        Id: editIndex !== -1 ? rooms[editIndex].Id : uuidv4(),
        Type: name,
        saccode: sac,
        ProprtyId: propertyId,
        PropertyDescription: desc,
    };
    const result = await saveRoom(roomObj);
    if (result)
        showMessage(
            editIndex !== -1 ? "Room updated successfully" : "Room added successfully"
        );
    // Reset form
    document.getElementById("roomName").value = "";
    document.getElementById("roomSAC").value = "";
    document.getElementById("roomDesc").value = "";
    document.getElementById("roomProperty").value =
        properties.length > 0 ? properties[0].Id : "";
    editIndex = -1;
    this.textContent = "Add new";
    await loadRooms();
};

// Edit room
window.startEdit = function (i) {
    const r = rooms[i];
    document.getElementById("roomName").value = r.Type;
    document.getElementById("roomSAC").value = r.saccode || "";
    document.getElementById("roomProperty").value = r.ProprtyId;
    document.getElementById("roomDesc").value = r.PropertyDescription || "";
    editIndex = i;
    document.getElementById("addBtn").textContent = "Update";
};

// Delete room
window.handleDelete = async function (id) {
    if (confirm("Are you sure you want to delete this room?")) {
        const result = await deleteRoomById(id);
        if (result) {
            showMessage("Room deleted successfully");
            await loadRooms();
        }
    }
};

// **Remove onchange loadRooms** - dropdown no longer filters table
// document.getElementById("roomProperty").onchange = loadRooms;

// Initialize
window.onload = async function () {
    await fetchProperties(); // load dropdown
    await loadRooms(); // show all rooms in table
};
