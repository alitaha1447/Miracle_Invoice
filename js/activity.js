const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});
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
const ACTIVITY_API = `${BASE_URL}/api/activity`;
const DELETE_ACTIVITY_API = `${BASE_URL}/api/Delete_activity`;

let activities = [];
let properties = [];
let editIndex = -1;
let currentPage = 1;
const pageSize = 5;

function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
        (
            +c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
        ).toString(16)
    );
}

function showMessage(msg, type = "success") {
    const box = document.getElementById("msgBox");
    box.textContent = msg;
    box.className = `block p-3 rounded text-center text-sm ${type === "success"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
        }`;
    setTimeout(() => box.classList.add("hidden"), 3000);
}

// Fetch properties for dropdown only (POST)
async function fetchProperties() {
    try {
        const res = await fetch(`${PROPERTY_API}?APIKEY=${APIKEY}`);
        properties = await res.json();
        const select = document.getElementById("activityProperty");
        select.innerHTML = '<option value="">Select property</option>';
        properties.forEach(
            (p) =>
                (select.innerHTML += `<option value="${p.Id}">${p.PropertyName}</option>`)
        );
    } catch {
        document.getElementById("activityProperty").innerHTML =
            '<option value="">Failed to load properties</option>';
        showMessage("Error fetching properties", "error");
    }
}

function getPropertyName(id) {
    const prop = properties.find((p) => p.Id === id);
    return prop ? prop.PropertyName : id;
}

// Fetch all activities (no property filter)
async function fetchAllActivities() {
    try {
        const res = await fetch(`${ACTIVITY_API}?APIKEY=${APIKEY}`);
        return await res.json();
    } catch {
        showMessage("Error fetching activities", "error");
        return [];
    }
}

// Save activity
async function saveActivity(activityObj) {
    try {
        const prop = properties.find((p) => p.Id === activityObj.PropertyId);
        activityObj.property_name = prop ? prop.PropertyName : "";

        const res = await fetch(`${ACTIVITY_API}?APIKEY=${APIKEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(activityObj),
        });
        return await res.json();
    } catch {
        showMessage("Error saving activity", "error");
        return null;
    }
}

// Delete activity
async function deleteActivityById(id) {
    try {
        const res = await fetch(
            `${DELETE_ACTIVITY_API}?APIKEY=${APIKEY}&id=${id}`,
            { method: "POST" }
        );
        if (!res.ok) throw new Error("Delete failed");
        return await res.json();
    } catch {
        showMessage("Error deleting activity", "error");
        return null;
    }
}

// Render table
function renderTable() {
    const tbody = document.querySelector("#activityTable tbody");
    tbody.innerHTML = "";
    const start = (currentPage - 1) * pageSize;
    activities.slice(start, start + pageSize).forEach((a, i) => {
        tbody.innerHTML += `
      <tr>
        <td class="border px-3 py-2">${a.ActivityName}</td>
        <td class="border px-3 py-2">${a.SacCode}</td>
        <td class="border px-3 py-2">${getPropertyName(a.PropertyId)}</td>
        <td class="border px-3 py-2">${a.ActivityDescription}</td>
        <td class="border px-3 py-2 text-center">
          <button class="bg-yellow-200 text-yellow-800 px-2 py-1 rounded mr-1" onclick="startEdit(${start + i
            })">Edit</button>
          <button class="bg-red-300 text-red-800 px-2 py-1 rounded" onclick="handleDelete(${start + i
            })">Delete</button>
        </td>
      </tr>`;
    });
    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(activities.length / pageSize);
    const pag = document.getElementById("pagination");
    pag.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
        pag.innerHTML += `<button onclick="gotoPage(${i})" class="px-3 py-1 rounded ${i === currentPage ? "bg-green-500 text-white" : "bg-gray-200"
            }">${i}</button>`;
    }
}

window.gotoPage = function (p) {
    currentPage = p;
    renderTable();
};

// Load all activities
async function loadActivities() {
    activities = await fetchAllActivities();
    currentPage = 1;
    renderTable();
}

// Add / Update
document.getElementById("addBtn").onclick = async function () {
    const name = document.getElementById("activityName").value.trim();
    const sac = document.getElementById("activitySAC").value.trim();
    const propertyId = document.getElementById("activityProperty").value;
    const desc = document.getElementById("activityDesc").value.trim();

    if (!name || !sac || !propertyId) {
        showMessage("All fields required!", "error");
        return;
    }

    const activityObj = {
        Id: editIndex !== -1 ? activities[editIndex].Id : uuidv4(),
        PropertyId: propertyId,
        SacCode: sac,
        ActivityName: name,
        ActivityDescription: desc,
    };

    const result = await saveActivity(activityObj);
    if (result) {
        showMessage(editIndex !== -1 ? "Activity updated!" : "Activity added!");
        document.getElementById("activityName").value = "";
        document.getElementById("activitySAC").value = "";
        document.getElementById("activityDesc").value = "";
        editIndex = -1;
        this.textContent = "Add new";
        await loadActivities();
    }
};

// Edit activity
window.startEdit = function (i) {
    document.getElementById("activityName").value = activities[i].ActivityName;
    document.getElementById("activitySAC").value = activities[i].SacCode;
    document.getElementById("activityProperty").value = activities[i].PropertyId;
    document.getElementById("activityDesc").value =
        activities[i].ActivityDescription;
    editIndex = i;
    document.getElementById("addBtn").textContent = "Update";
};

// Delete activity
window.handleDelete = async function (i) {
    if (confirm("Are you sure you want to delete this activity?")) {
        const result = await deleteActivityById(activities[i].Id);
        if (result) {
            activities.splice(i, 1);
            showMessage("Activity deleted!");
            renderTable();
        }
    }
};

// Remove onchange filter
// document.getElementById("activityProperty").onchange = loadActivities;

// Initialize
window.onload = async function () {
    await fetchProperties(); // dropdown
    await loadActivities(); // show all activities
};
