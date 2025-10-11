let expenditPropertyId = '2F04C75D-5C3F-4897-8570-6174DC2887DD'
const BASEPATH = "https://hotelapi.shriyanshnath.com"
const APIKEY = "12345678@"

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

function formatDateDDMMYYY(dateString) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

// LogIn
function login(e) {
    e.preventDefault();

    const userName = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const button = document.getElementById('loginButton')
    const buttonText = document.getElementById('buttonText')

    // Disable button and show loader
    button.disabled = true;
    buttonText.innerText = '⏳ Logging...'
    const apiUrl = `${BASEPATH}/api/Login?APIKEY=${APIKEY}&username=${userName}&password=${password}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    })
        .then((res) => {
            if (res.status === 200) {
                // alert("Login Successful!");
                showToast('Logged in successfully!', 'success', 1200);
                localStorage.setItem("isLoggedIn", "true");

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 900);
            } else if (res.status === 401 || res.status === 400) {
                showToast('Invalid credentials. Please try again.', 'error', 3000);
                throw new Error("Invalid credentials");
            } else {
                showToast(`Login failed (status ${res.status}).`, 'error', 3000);
                throw new Error(`Login failed with status: ${res.status}`);
            }
        })
        .catch(err => {
            console.error(err);
            // only show a generic error if we haven't already
            // (the branch above already toasts on known errors)
            if (!/Invalid credentials|status/.test(err.message)) {
                showToast('Something went wrong. Please try again.', 'error', 3000);
            }
        })
        .finally(() => {
            button.disabled = false;
            buttonText.innerText = 'Login'
        })

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

// document.addEventListener('change', (e) => {
//     if (e.target.matches('select[id^="tourName_"]')) {
//         const groupId = e.target.id.split('_')[1];
//         const tourId = e.target.value;
//         const tourName = e.target.options[e.target.selectedIndex]?.text || '';
//         console.log('Tour changed:', { groupId, tourId, tourName });
//     }
// });

// Edit Form

document.addEventListener("DOMContentLoaded", function () {

    const invoiceIDSelect = document.getElementById('invoiceID');
    if (invoiceIDSelect) {
        invoiceIDSelect.addEventListener('change', fetchInvoiceID);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const invoiceIDSelect = document.getElementById('expenditFormID');
    if (invoiceIDSelect) {
        invoiceIDSelect.addEventListener('change', fetchExpenditInvoiceID);
    }
});


function getSearchInvoice(e) {
    e.preventDefault();

    const fromdate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const invoice_no = document.getElementById('invoiceNo').value;

    const invoiceID = document.getElementById('invoiceID');

    invoiceID.innerHTML = '<option>Loading...</option>';

    const apiUrl = `${BASEPATH}/api/Search_Invoice?APIKEY=${APIKEY}&fromdate=${fromdate}&endDate=${endDate}&invoice_no=${invoice_no}`;

    // Fetch data from the API
    fetch(apiUrl, { method: 'GET' })
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }
            return res.json();
        })
        .then(data => {
            // console.log('Invoice Data:', data);


            if (data && data.length > 0) {
                let html = '<option value="">-- Select --</option>';
                data.forEach((item) => {
                    html += `<option value="${item.InvoiceId}">${item.InvoiceNo}</option>`;
                });
                invoiceID.innerHTML = html;
            } else {

                invoiceID.innerHTML = '<option>No data available</option>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            invoiceID.innerHTML = '<option>Error fetching data</option>';  // Show error message
        });
}

function getExpenditFormDetails(e) {
    e.preventDefault();

    const fromdate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const invoice_no = document.getElementById('invoiceNo').value;

    const expenditFormID = document.getElementById('expenditFormID');

    expenditFormID.innerHTML = '<option>Loading...</option>';

    const apiUrl = `${BASEPATH}/api/Search_expendit_Invoice?APIKEY=${APIKEY}&fromdate=${fromdate}&endDate=${endDate}&invoice_no=${invoice_no}`;

    // Fetch data from the API
    fetch(apiUrl, { method: 'GET' })
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch data');
            }
            return res.json();
        })
        .then(data => {
            // console.log('Invoice Data:', data);


            if (data && data.length > 0) {
                let html = '<option value="">-- Select --</option>';
                data.forEach((item) => {
                    html += `<option value="${item.InvoiceId}">${item.InvoiceNo}</option>`;
                });
                expenditFormID.innerHTML = html;
            } else {

                expenditFormID.innerHTML = '<option>No data available</option>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            expenditFormID.innerHTML = '<option>Error fetching data</option>';  // Show error message
        });

}

function fetchExpenditInvoiceID() {
    const invoiceId = document.getElementById("expenditFormID").value;
    // console.log('expenditFormId --> ', invoiceId)
    const apiUrl = `${BASEPATH}/api/Get_Expendit_Invoice_Detail?APIKEY=${APIKEY}&invoice_id=${invoiceId}`;

    fetch(apiUrl, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            // console.log(data);
            let x = formatDateDDMMYYY(data?.CreatedOn)

            document.getElementById('guest').value = data?.GuestDetail;
            document.getElementById('date').value = x;
            document.getElementById('advanceAmt').value = data?.advance_amt;


            const tourGroupContainer = document.getElementById('tour-group-container');
            tourGroupContainer.innerHTML = '';  // Clear any existing rows

            data.ExpeditionInvoiceTour.forEach((detail, index) => {
                let newTourGroup = document.createElement('div');
                newTourGroup.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-5', 'gap-4', 'mb-4', 'items-end');
                newTourGroup.setAttribute('data-tour-group-id', index + 1);

                newTourGroup.innerHTML = `
                <div>
                    <label for="tourName_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Tour
                        Name
                    </label>
                    <select id="tourName_${index + 1}" name="tourName_${index + 1}" onfocus="getTourName(event)"
                        class="occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                        <option value="${detail?.TourId}">${detail?.tour}-${detail?.saccode}</option>
                    </select>
                </div>

                <div>
                    <label for="checkin_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Check-in
                        Date</label>
                    <input type="text" name="checkin_${index + 1}" id="checkin_${index + 1}" value="${formatDateDDMMYYY(detail?.CheckInDate)}"
                        class="w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                </div>

                <div>
                    <label for="checkout_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Check-out
                        Date</label>
                    <input type="text" name="checkout_${index + 1}" id="checkout_${index + 1}" value="${formatDateDDMMYYY(detail?.CheckOutDate)}"
                        class="w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                </div>   

                <div>
                <label for="pax_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">No of Pax</label>
                <input type="number" name="pax_${index + 1}" id="pax_${index + 1}" value="${detail?.NoOfPax}"
                    class="expendit-pax w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                    placeholder="0">
                </div>

                <div>
                <label for="rate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Rate (₹)</label>
                <input type="number" name="rate_${index + 1}" id="rate_${index + 1}" value="${detail?.CostPerPax}"
                    class="expendit-rate w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                    placeholder="0">
                </div>

                <div>
                    <label for="taxRate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Tax
                        Rate</label>
                    <select name="taxRate_${index + 1}" id="taxRate_${index + 1}" onfocus="getTaxRate(event)"
                        class="expendit-tax occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                        <option value="${detail?.taxrate}">${detail?.taxrate}</option>
                    </select>
                </div>

                <div>
                    <label for="extraTaxRate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Extra
                        Tax
                        Rate</label>
                    <select name="extraTaxRate_${index + 1}" id="extraTaxRate_${index + 1}"
                        class="expendit-extraTaxRate occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                        <option value="">-- Select --</option>
                        <option value="5">5%</option>
                        <option value="20">20%</option>
                    </select>
                </div>


                <div class="flex items-end">
                <div class="w-full">
                    <label for="tourTotal_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Total (₹)</label>
                    <input type="number" name="tourTotal_${index + 1}" id="tourTotal_${index + 1}" value="${detail?.Total}"
                    class="tour-total w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                    placeholder="0">
                </div>
                <button type="button" class="tour-minus-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2 transition-colors">
                    <i class="fa-solid fa-minus"></i>
                </button>
                </div>

                `
                tourGroupContainer.appendChild(newTourGroup);

            })
            updateTourMinusButtons();

            function updateTourMinusButtons() {
                const allTourGroups = document.querySelectorAll('[data-tour-group-id]');

                allTourGroups.forEach((group, index) => {
                    const minusBtn = group.querySelector('.tour-minus-btn');

                    // Hide the minus button if it's the only tour group
                    if (allTourGroups.length === 1) {
                        minusBtn.classList.add('hidden');
                    } else {
                        minusBtn.classList.remove('hidden');
                    }

                    // Add event listener if not already added
                    minusBtn.onclick = function () { removeTourGroup(this); };
                });
            }

            const activityGroupContainer = document.getElementById('activity-group-container');
            activityGroupContainer.innerHTML = '';

            data.ExpeditionInvoiceActivity.forEach((detail, index) => {
                // Create the new activity group element
                let newActivityGroup = document.createElement('div');
                newActivityGroup.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-5', 'gap-4', 'mb-4', 'items-end');
                newActivityGroup.setAttribute('data-activity-group-id', index + 1);

                // Add the inner HTML to the new activity group
                newActivityGroup.innerHTML = `
                    <div>
                        <label for="activityName_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Activity Name</label>
                        <select name="activityName_${index + 1}" id="activityName_${index + 1}" onfocus="getExpenditActivityName(event)"
                            class="activity-tax occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                        <option value="${detail.ActivityId}">${detail.activity}</option>
                        </select>
                    </div>

                    <div>
                        <label for="activityCount_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">No of
                            Activities</label>
                        <input type="number" name="activityCount_${index + 1}" id="activityCount_${index + 1}" value="${detail?.NoOfActivity}"
                            class="activity-count w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0">
                    </div>

                    <div>
                        <label for="activityRate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Rate
                        (₹)</label>
                        <input type="number" name="activityRate_${index + 1}" id="activityRate_${index + 1}" value="${detail?.Rate}"
                        class="activity-rate w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                        placeholder="0">
                    </div>

                    <div>
                        <label for="activityTaxRate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Tax
                        Rate</label>
                        <select name="activityTaxRate_${index + 1}" id="activityTaxRate_${index + 1}" onfocus="getTaxRate(event)"
                        class="activity-tax occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                        <option value="${detail?.taxrate}">${detail?.taxrate}%</option>
                        </select>
                    </div>

                    <div class="flex items-end">
                        <div class="w-full">
                        <label for="activityTotal_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Total
                            (₹)</label>
                        <input type="number" name="activityTotal_${index + 1}" id="activityTotal_${index + 1}" value="${detail?.Total}"
                            class="activity-total w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0">
                        </div>
                        <button type="button"
                        class="activity-minus-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2 transition-colors hidden">
                        <i class="fa-solid fa-minus"></i>
                        </button>
                    </div>
    `;

                // Append the new activity group to the container
                activityGroupContainer.appendChild(newActivityGroup);
            });

            updateActivityMinusButtons();

            function updateActivityMinusButtons() {
                const allActivityGroups = document.querySelectorAll('[data-activity-group-id]');

                allActivityGroups.forEach((group, index) => {
                    const minusBtn = group.querySelector('.activity-minus-btn');

                    // Hide the minus button if it's the only activity group
                    if (allActivityGroups.length === 1) {
                        minusBtn.classList.add('hidden');
                    } else {
                        minusBtn.classList.remove('hidden');
                    }

                    // Add event listener if not already added
                    minusBtn.onclick = function () { removeActivityGroup(this); };
                });
            }


        })
}

async function fetchInvoiceID() {
    const invoiceId = document.getElementById("invoiceID").value;

    if (!invoiceId) {
        console.log('No invoice ID selected');
        return;
    }

    // console.log('Selected Invoice ID:', invoiceId);  // Log the selected invoice ID

    const apiUrl = `${BASEPATH}/api/Get_Invoice_Detail?APIKEY=${APIKEY}&invoice_id=${invoiceId}`;

    fetch(apiUrl, { method: 'GET' })
        .then(res => res.json())
        .then(data => {
            // console.log('Invoice Details:', data);

            let x = formatDateDDMMYYY(data?.InvoiceDate)
            // console.log('x')
            // console.log(x)

            let property = document.getElementById('property').value = data?.PropertyId;
            let name = document.getElementById('guest').value = data?.GuestDetail;
            let date = document.getElementById('date').value = x;
            let advanceAmt = document.getElementById('advanceAmt').value = data?.advance_amt;


            // Bind Property Select
            // const propertySelect = document.getElementById("property");
            // const propertyOption = document.createElement("option");
            // propertyOption.value = data.PropertyId;
            // propertyOption.textContent = `Property: ${data.PropertyId}`;  // Example text, adjust as needed
            // propertySelect.appendChild(propertyOption);
            // propertySelect.value = data.PropertyId;

            const inputGroupContainer = document.getElementById('input-group-container');
            inputGroupContainer.innerHTML = '';  // Clear any existing rows

            data.ProformaInvoiceDetail.forEach((detail, index) => {

                const newInputGroup = document.createElement('div');
                newInputGroup.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-5', 'gap-4', 'mb-4', 'items-end');
                newInputGroup.setAttribute('data-group-id', index + 1);

                newInputGroup.innerHTML = `
                    <div>
                        <label for="roomType_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Room Type</label>
                        <select id="roomType_${index + 1}" name="roomType_${index + 1}"  onfocus="getRoomType(event)"
                            class="occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base" >
                            <option value="${detail?.RoomType}">${detail?.type}</option>
                        </select >
                    </div >

                    <div>
                        <label for="checkin_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Check-in Date</label>
                        <input type="text" id="checkin_${index + 1}" name="checkin_${index + 1}" value="${formatDateDDMMYYY(detail?.CheckInDate)}"
                            class="w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                    </div>

                    <div>
                        <label for="checkout_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Check-out Date</label>
                        <input type="text" id="checkout_${index + 1}" name="checkout_${index + 1}" value="${formatDateDDMMYYY(detail?.CheckOutDate)}"
                            class="w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                    </div>

                    <div>
                        <label for="rate_${index + 1}"  class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Rate (₹)</label>
                        <input type="number" id="rate_${index + 1}" name="rate_${index + 1}" value="${detail?.Rate}"
                            class="rate w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0">
                    </div>

                    <div>
                        <label for="rooms_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">No of
                            rooms</label>
                        <input type="number" id="rooms_${index + 1}" name="rooms_${index + 1}" value="${detail?.NoOfRooms}"
                            class="room w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0">
                    </div>

                    <div>
                        <label for="plan_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Plan</label>
                        <input type="text" id="plan_${index + 1}" name="plan_${index + 1}" value="${detail?.PackagePlan}"
                            class="plan w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="Plan name">
                    </div>

                    <div>
                        <label for="taxRate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Tax Rate</label>
                        <select id="taxRate_${index + 1}" name="taxRate_${index + 1}" onfocus="getTaxRate(event)"
                            class="tax occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                            <option value="${detail?.taxrate}">${detail?.taxrate}%</option>
                            
                        </select>
                    </div>

                    <div class="flex items-end">
                        <div class="w-full">
                            <label for="total_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Total (₹)</label>
                            <input type="text" id="total_${index + 1}" name="total_${index + 1}" value="${detail?.TotalAmt}"
                            class="total w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0">
                        </div>
                        <button type="button" onclick="removeInputGroup(this)"
                            class="minus-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2 transition-colors"
                            onclick="removeInputGroup(this)">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                    </div>
                `;
                inputGroupContainer.appendChild(newInputGroup);

                // const roomType = document.getElementById(`roomType_${index + 1}`).value = (detail.InvoiceId)
                // const checkInInput = document.getElementById(`checkin_${index + 1}`).value = formatDateDDMMYYY(detail.CheckInDate)
                // const checkOutInput = document.getElementById(`checkout_${index + 1}`).value = formatDateDDMMYYY(detail.CheckOutDate)
                // const rateInput = document.getElementById(`rate_${index + 1}`).value = (detail.Rate)
                // const roomsInput = document.getElementById(`rooms_${index + 1}`).value = (detail.NoOfRooms)
                // const planInput = document.getElementById(`plan_${index + 1}`).value = (detail.PackagePlan)
                // const taxRateInput = document.getElementById(`taxRate_${index + 1}`).value = (detail.taxrate)
                // const totalInput = document.getElementById(`total_${index + 1}`).value = (detail.TotalAmt)

            })

            updateMinusButtons();

            function updateMinusButtons() {
                const allInputGroups = document.querySelectorAll('#input-group-container > .grid');
                allInputGroups.forEach((group, index) => {
                    const minusBtn = group.querySelector('.minus-btn');
                    // Hide the minus button if it's the only input group
                    if (allInputGroups.length === 1) {
                        minusBtn.classList.add('hidden');
                    } else {
                        minusBtn.classList.remove('hidden');
                    }
                });
            }

            // data.ProformaInvoiceActivity.forEach((detail, index) => {
            //     const activityCountInput = document.getElementById(`activityCount_${index + 1}`).value = (detail.no_of_activity)
            //     const activityRateInput = document.getElementById(`activityRate_${index + 1}`).value = (detail.rate)
            //     const activityTotalInput = document.getElementById(`activityTotal_${index + 1}`).value = (detail.total_amt)
            // })
            // Function to bind data to activity rows

            const activityGroupContainer = document.getElementById('activity-group-container');
            activityGroupContainer.innerHTML = '';  // Clear any existing rows

            // Iterate over the activities array and dynamically create rows
            data.ProformaInvoiceActivity.forEach((activity, index) => {

                const newActivityGroup = document.createElement('div');
                newActivityGroup.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-5', 'gap-4', 'mb-4', 'items-end');
                newActivityGroup.setAttribute('data-activity-group-id', index + 1);

                // HTML for each activity row
                newActivityGroup.innerHTML = `
                    <div>
                        <label for="activityName_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Activity
                            Name</label>
                        <select name="activityName_${index + 1}" id="activityName_${index + 1}" onfocus="getActivityName(event)"
                            class="activity-tax occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                            <option value="${activity.activityid}">${activity.activity}</option>
                        </select>
                    </div>

                    <div>
                        <label for="activityCount_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">No of
                            Activities</label>
                        <input type="number" name="activityCount_${index + 1}" id="activityCount_${index + 1}"
                            class="activity-count w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0"  value="${activity.no_of_activity}">
                    </div>

                    <div>
                        <label for="activityRate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">No of
                            Activities</label>
                        <input type="number" name="activityRate_${index + 1}" id="activityRate_${index + 1}"
                            class="activity-count w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0"  value="${activity.rate}">
                    </div>

                    <div>
                        <label for="activityTaxRate_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Tax
                            Rate</label>
                        <select name="activityTaxRate_${index + 1}" id="activityTaxRate_${index + 1}" onfocus="getTaxRate(event)"
                            class="activity-tax occupancy w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base">
                            <option value="${activity.tax_rate}">${activity.tax_rate}%</option>
                        </select>
                    </div>

                    <div class="flex items-end">
                        <div class="w-full">
                        <label for="activityTotal_${index + 1}" class="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Total
                            (₹)</label>
                        <input type="text" name="activityTotal_${index + 1}" id="activityTotal_${index + 1}"
                            class="activity-total w-full p-3 sm:p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-500 text-sm sm:text-base"
                            placeholder="0" value="${activity.total_amt}">
                        </div>
                        <button type="button" onclick="removeActivityGroup(this)"
                            class="activity-minus-btn bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center ml-2 transition-colors hidden">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                    </div>
                    `;

                // Append the new row to the container
                activityGroupContainer.appendChild(newActivityGroup);
            });
            // After adding the rows, update the visibility of the "minus" buttons
            updateActivityMinusButtons();

            // Update visibility of the "minus" buttons
            function updateActivityMinusButtons() {
                const allActivityGroups = document.querySelectorAll('[data-activity-group-id]');
                const minusButtons = document.querySelectorAll('.activity-minus-btn');

                // Show "minus" buttons if there are multiple activity rows
                if (allActivityGroups.length > 1) {
                    minusButtons.forEach(button => {
                        button.classList.remove('hidden');
                    });
                } else {
                    minusButtons.forEach(button => {
                        button.classList.add('hidden');
                    });
                }
            }

            // Function to remove an activity group
            // function removeActivityGroup(button) {
            //     const activityGroup = button.closest('[data-activity-group-id]');
            //     activityGroup.remove();

            //     // After removing, update the visibility of the "minus" buttons
            //     updateActivityMinusButtons();
            // }

        }

        )
        .catch(error => {
            console.error('Error fetching invoice details:', error);
        });
}


// document.addEventListener('change', loadTours)

async function fetchProperties() {
    try {
        const res = await fetch(`${BASEPATH}/api/Property?APIKEY=${APIKEY}`);
        properties = await res.json();
        const select = document.getElementById("property");
        if (!select) {
            console.error("Element with id 'property' not found.");
            return; // Exit the function if the element doesn't exist
        }
        select.innerHTML = "";
        properties.forEach(p => select.innerHTML += `<option value="${p.Id}">${p.PropertyName}</option>`);
        // if (properties.length > 0) {
        //     select.value = properties[0].Id;
        //     await loadTours();
        // }
    } catch (error) {
        console.error(error);
        document.getElementById("property").innerHTML = '<option value="">Failed to load properties</option>';
    }
}

// async function loadTours() {
//     let propertyId = document.getElementById("property").value;
// }


// Use 'DOMContentLoaded' event to ensure the page content is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Attach the fetchProperties function if 'property' element exists
    const propertyElement = document.getElementById("property");
    if (propertyElement) {
        fetchProperties();
    }
});

function getRoomType(e) {

    let propertyId = document.getElementById("property").value;
    const select = e.target;
    if (select.dataset.loaded === '1') return;          // prevent re-fetch

    select.innerHTML = '<option>Loading...</option>';

    fetch(`${BASEPATH}/api/roomtype?APIKEY=${APIKEY}&property=${propertyId}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => {
            if (data.length === 0) {
                select.innerHTML = '<option>No rooms available</option>';
                return;
            }
            let html = '';
            data.forEach((item, i) => {
                html += `<option value="${item.Id}" ${i === 0 ? 'selected' : ''}>${item.Type}</option>`;
            });
            select.innerHTML = html;
        })
        .catch(() => (select.innerHTML = '<option>Failed</option>'));
}

function getTourName(e) {
    let propertyId = expenditPropertyId;
    const select = e.target;
    if (select.dataset.loaded === '1') return;          // prevent re-fetch

    select.innerHTML = '<option value="">Select tour</option>';

    fetch(`${BASEPATH}/api/tour?APIKEY=${APIKEY}&property=${propertyId}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => {
            // console.log(data)
            if (data.length === 0) {
                select.innerHTML = '<option>No Tour available</option>';
                return;
            }
            // let html = '';
            // let html = '<option value="" disabled selected>-- Select Tour --</option>';
            data.forEach((item, i) => {
                // console.log(data)
                select.innerHTML += `<option value="${item.Id}">${item.TourName}</option>`;
                // html += `<option value="${item.Id}">${item.TourName}</option>`;
            });

            // select.innerHTML = html;
        })
        .catch(() => (select.innerHTML = '<option>Failed</option>'));
}

function getExpenditActivityName(e) {
    let propertyId = expenditPropertyId;
    const select = e.target;
    if (select.dataset.loaded === '1') return;          // prevent re-fetch

    // select.innerHTML = '<option>Loading...</option>';

    fetch(`${BASEPATH}/api/Activity?APIKEY=${APIKEY}@&property=${propertyId}`)
        .then(r => r.ok ? r.json() : [])
        .then(data => {
            if (data.length === 0) {
                select.innerHTML = '<option>No Activity available</option>';
                return;
            }
            let html = '';
            data.forEach((item, i) => {
                html += `<option value="${item.Id}" ${i === 0 ? 'selected' : ''}> ${item.ActivityName}-(${item.SacCode})</option>`;
            });
            select.innerHTML = html;
        })
        .catch(() => (select.innerHTML = '<option>Failed</option>'))

}

// function get

// optional: load immediately without user focus for the first row
document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('roomType_1');
    if (el) getRoomType({ target: el });
});

let defaultTaxRate = null;  // Variable to store the default tax rate

function getTaxRate(e) {
    // let propertyId = document.getElementById("property").value;
    let propertyId;
    if (document.getElementById("property")) {
        propertyId = document.getElementById("property").value;
    } else {
        propertyId = expenditPropertyId
    }

    const select = e.target;
    // prevent re-fetch
    select.innerHTML = '<option>Loading...</option>';

    fetch(`${BASEPATH}/api/taxrate?APIKEY=${APIKEY}&property=${propertyId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            if (data.length === 0) {
                select.innerHTML = '<option>No tax rates</option>';
                return;
            }

            let html = '';
            data.forEach((item, i) => {
                html += `<option value="${item.percent}" ${i === 0 ? "selected" : ""}>${item.percent}%</option>`;
            });
            select.innerHTML = html;

            if (defaultTaxRate === null) {
                defaultTaxRate = data[0].percent;
                // Update all existing tax rate fields with the default tax rate
                updateAllTaxRateFields(defaultTaxRate);
            }
        })
        .catch(() => select.innerHTML = '<option>Failed</option>');
    // optional: load immediately without user focus for the first row
}

// Function to update all tax rate fields with the default tax rate
function updateAllTaxRateFields(taxRate) {
    const taxRateFields = document.querySelectorAll('.tax');
    taxRateFields.forEach(field => {
        field.value = taxRate;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('taxRate_1');
    if (el) getTaxRate({ target: el });

    const elActivity = document.getElementById('activityTaxRate_1');
    if (elActivity) getTaxRate({ target: elActivity });
});


function getActivityName(e) {
    const select = e.target;
    select.innerHTML = '<option>Loading...</option>'

    let propertyId = document.getElementById("property").value;

    fetch(`${BASEPATH}/api/Activity?APIKEY=${APIKEY}&property=${propertyId}`)
        .then(res => res.ok ? res.json() : [])
        .then(data => {
            // console.log(data)
            if (data.length === 0) {
                select.innerHTML = '<option>No Activity available</option>';
                return;
            }

            let html = '';
            data.forEach((item, i) => {
                html += `<option value = "${item.Id}" ${i === 0 ? "selected" : ""}> ${item.ActivityName}-(${item.SacCode})</option> `;
            });
            select.innerHTML = html;
        })
        .catch(() => select.innerHTML = '<option>Failed</option>');
}
//  Date Difference in Days
function calculateDaysBetweenDates(startDate, endDate) {
    const start = new Date(startDate.split('-').reverse().join('-'));
    const end = new Date(endDate.split('-').reverse().join('-'));
    const differenceInMillis = end - start;
    let differenceInDays = differenceInMillis / (1000 * 3600 * 24); // Convert to days
    // If the difference is 0, set it to 1
    if (differenceInDays === 0) {
        differenceInDays = 1;
    }
    // console.log(typeof differenceInMillis)
    return differenceInDays;
}

// Function to calculate total for a group
function calculateBookingTotal(groupId) {
    const rate = parseFloat(document.getElementById(`rate_${groupId}`).value) || 0;
    const rooms = parseFloat(document.getElementById(`rooms_${groupId}`).value) || 0;
    const taxRate = parseFloat(document.getElementById(`taxRate_${groupId}`).value) || 0;
    const checkin = document.getElementById(`checkin_${groupId}`).value;
    const checkout = document.getElementById(`checkout_${groupId}`).value;

    // Calculate the number of days between check-in and check-out
    const daysDifference = calculateDaysBetweenDates(checkin, checkout);
    // console.log(`Days difference: ${daysDifference}`);
    // If daysDifference is NaN, stop the calculation
    if (isNaN(daysDifference)) {
        console.log("Invalid dates provided.");
        return;
    }

    // Calculate base value: daysDifference * rooms * rate
    const base = daysDifference * rooms * rate;
    // console.log(`Base value: ${base}`);

    // Calculate total: base + (base * taxRate / 100)
    const total = base + (base * taxRate / 100);
    // console.log(`Total: ${total}`);

    // Update the total input field
    // document.getElementById(`total_${groupId}`).value = total.toFixed(2);

    const totalElement = document.getElementById(`total_${groupId}`);
    if (totalElement) {
        totalElement.value = total.toFixed(2)
    } else {
        console.error(`Element with id 'total_${groupId}' not found.`);

    }
}

$(document).ready(function () {
    // Initialize the datepicker for check-in and check-out fields
    $('.datepicker').datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'dd-mm-yy',  // Date format (DD-MM-YYYY)
        showAnim: 'fadeIn',
        autocomplete: 'off'
    });

    // Use the onchange event to fire calculateBookingTotal when the date is selected
    $('.checkin, .checkout').on('change', function () {
        const groupId = this.id.split("_")[1]; // Extract groupId from the element ID
        calculateBookingTotal(groupId);  // Recalculate the total when date is changed
    });
});


// Event listener for input changes in rate, rooms, and taxRate
document.addEventListener("input", (e) => {
    if (e.target.classList.contains('rate') || e.target.classList.contains('room') || e.target.classList.contains('tax')) {
        const groupId = e.target.id.split("_")[1];  // Extract groupId from the element ID
        calculateBookingTotal(groupId);  // Recalculate the total
    }
});

// document.addEventListener("change", (e) => {
//     console.log(e)
//     if (e.target.classList.contains('checkin') || e.target.classList.contains('checkout')) {
//         console.log('yes')
//         const groupId = e.target.id.split("_")[1];  // Extract groupId from the element ID
//         calculateBookingTotal(groupId);  // Recalculate the total
//     }
// });
// Proforma Invoice Total calculation start

function calculateActivityTotal(groupId) {
    const activityCount = parseFloat(document.getElementById(`activityCount_${groupId}`).value) || 0;
    const activityRate = parseFloat(document.getElementById(`activityRate_${groupId}`).value) || 0;
    const activityTaxRate = parseFloat(document.getElementById(`activityTaxRate_${groupId}`).value) || 0;

    const base = activityRate * activityCount;                         // base = rate × rooms
    const total = base + (base * activityTaxRate / 100);       // base + tax%
    // document.getElementById(`activityTotal_${groupId}`).value = total.toFixed(2);
    const totalElement = document.getElementById(`activityTotal_${groupId}`);
    if (totalElement) {
        totalElement.value = total.toFixed(2)
    } else {
        console.error(`Element with id 'activityTotal_${groupId}' not found.`);

    }

}

function calculateActivityRateFromTotal(groupId) {
    const activityCount = parseFloat(document.getElementById(`activityCount_${groupId}`).value) || 0;
    const activityTaxRate = parseFloat(document.getElementById(`activityTaxRate_${groupId}`).value) || 0;
    const activityTotal = parseFloat(document.getElementById(`activityTotal_${groupId}`).value) || 0;

    if (activityCount > 0) {
        const rate = activityTotal / (activityCount * (1 + activityTaxRate / 100));
        const rateElement = document.getElementById(`activityRate_${groupId}`);
        if (rateElement) {
            rateElement.value = rate.toFixed(2);
        } else {
            console.error(`Element with id 'activityRate_${groupId}' not found.`);
        }
    }
}

// Update when typing or changing
document.addEventListener("input", (e) => {
    if (e.target.classList.contains('rate') || e.target.classList.contains('room')) {
        const groupId = e.target.id.split("_")[1];
        calculateBookingTotal(groupId);
    } else if (e.target.classList.contains('activity-rate') || e.target.classList.contains('activity-count')) {
        const groupId = e.target.id.split("_")[1];
        calculateActivityTotal(groupId)
    }

});

document.addEventListener("input", (e) => {
    if (e.target.classList.contains('activity-total')) {
        const groupId = e.target.id.split("_")[1];
        calculateActivityRateFromTotal(groupId)
    }
});

document.addEventListener("change", (e) => {
    if (e.target.classList.contains('tax')) {
        const groupId = e.target.id.split("_")[1];
        calculateBookingTotal(groupId);
    } else if (e.target.classList.contains('activity-tax')) {
        const groupId = e.target.id.split("_")[1];
        calculateActivityTotal(groupId)
    }

});

// Proforma Invoice Total calculation end

// Expenditure Invoice Total calculation start


function calculateExpenditTourTotal(groupId) {
    const rate = parseFloat(document.getElementById(`rate_${groupId}`).value) || 0;
    const pax = parseFloat(document.getElementById(`pax_${groupId}`).value) || 0;
    const taxRate = parseFloat(document.getElementById(`taxRate_${groupId}`).value) || 0;

    // const checkin = document.getElementById(`checkin_${groupId}`).value;
    // const checkout = document.getElementById(`checkout_${groupId}`).value;

    // Calculate the number of days between check-in and check-out
    // const daysDifference = calculateDaysBetweenDates(checkin, checkout);
    // if (isNaN(daysDifference)) {
    //     console.log("Invalid dates provided.");
    //     return;
    // }

    // const base = daysDifference * rate * pax;                       
    // const total = base + (base * taxRate / 100);      

    // Ensure the element exists before setting the value
    // const totalElement = document.getElementById(`tourTotal_${groupId}`);
    // if (totalElement) {
    //     totalElement.value = total.toFixed(2);
    // } else {
    //     console.error(`Element with id 'tourTotal_${groupId}' not found.`);
    // }

    const base = rate * pax;

    const taxAmount = (base * taxRate / 100);
    const extraTax = document.getElementById(`extraTaxRate_${groupId}`).value;
    const extraTaxCalculation = (base * extraTax / 100);

    const totalAmount = base + taxAmount + extraTaxCalculation;
    const totalElement = document.getElementById(`tourTotal_${groupId}`);
    if (totalElement) {
        totalElement.value = totalAmount.toFixed(2);
    } else {
        console.error(`Element with id 'tourTotal_${groupId}' not found.`);
    }
}

function calculateExpenditTourRateFromTotal(groupId) {
    const pax = parseFloat(document.getElementById(`pax_${groupId}`).value) || 0;
    const taxRate = parseFloat(document.getElementById(`taxRate_${groupId}`).value) || 0;
    const tourTotal = parseFloat(document.getElementById(`tourTotal_${groupId}`).value) || 0;

    if (pax > 0) {
        const rate = tourTotal / (pax * (1 + taxRate / 100));
        const rateElement = document.getElementById(`rate_${groupId}`); // fixed: should update tourRate, not taxRate
        if (rateElement) {
            rateElement.value = rate.toFixed(2);
        } else {
            console.error(`Element with id 'rate_${groupId}' not found.`);
        }
    }
}

document.addEventListener("input", (e) => {
    if (e.target.classList.contains('tour-total')) {
        const groupId = e.target.id.split("_")[1];
        calculateExpenditTourRateFromTotal(groupId);
    }
});



// Event listeners
document.addEventListener("input", (e) => {
    if (e.target.classList.contains('expendit-pax') || e.target.classList.contains('expendit-rate') || e.target.classList.contains('expendit-extraTaxRate')) {
        const groupId = e.target.id.split("_")[1];
        calculateExpenditTourTotal(groupId);
    }
});

document.addEventListener("change", (e) => {
    if (e.target.classList.contains('expendit-tax')) {
        const groupId = e.target.id.split("_")[1];
        calculateExpenditTourTotal(groupId);
    }
});


// Expenditure Invoice Total calculation end


function formatDateYYYYMMDD(dateString) {
    console.log(dateString)
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function formatDateYYYYMMDDCreate(date) {
    const year = date.getFullYear();  // Get the full year (YYYY)
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Get the month (MM) with leading zero
    const day = String(date.getDate()).padStart(2, '0');  // Get the day (DD) with leading zero
    return `${year}-${month}-${day}`;  // Format as YYYY-MM-DD
}


function handleSubmitForm(e) {

    const button = document.getElementById('submitButton')
    const buttonText = document.getElementById('submitText')

    button.disabled = true;

    var invoice_id = '';
    if (document.getElementById('invoiceID').selectedIndex > 0) {
        console.log('EDIT');
        invoice_id = document.getElementById('invoiceID').value;
        buttonText.innerText = '⏳ Editing...';
    }
    else {
        invoice_id = uuidv4();
        buttonText.innerText = '⏳ Submitting...'
    }
    // buttonText.innerText = '⏳ Submitting...'

    const propertyID = document.getElementById('property').value
    const guestName = document.getElementById('guest').value
    // const invoiceDate = document.getElementById('date').value
    // Get the date input value
    // When submitting the form, make sure you convert the date:
    // Get the date input value
    // const dateInput = $('#date').val();  // e.g., "16-10-2025"
    const dateInput = document.getElementById('date').value   // e.g., "16-10-2025"
    const invoiceDate = formatDateYYYYMMDD(dateInput);
    const advanceAmt = document.getElementById('advanceAmt').value
    const apiUrl = `${BASEPATH}/api/Proforma_Invoice?APIKEY=${APIKEY}`;

    const test = [];
    const activityDetails = [];

    const inputGroups = document.querySelectorAll('[data-group-id]');

    const activityGroups = document.querySelectorAll('[data-activity-group-id]');

    inputGroups.forEach(group => {
        const groupId = group.getAttribute('data-group-id');
        const roomType = group.querySelector(`#roomType_${groupId}`).value;
        const checkin = group.querySelector(`#checkin_${groupId}`).value;
        const checkout = group.querySelector(`#checkout_${groupId}`).value;
        const rate = group.querySelector(`#rate_${groupId}`).value;
        const rooms = group.querySelector(`#rooms_${groupId}`).value;
        const plan = group.querySelector(`#plan_${groupId}`).value;
        const taxRate = group.querySelector(`#taxRate_${groupId}`).value;
        const total = group.querySelector(`#total_${groupId}`).value;

        const proformaDetail = {
            InvoiceId: invoice_id,
            RoomType: roomType || '',
            CheckInDate: formatDateYYYYMMDD(checkin),
            CheckOutDate: formatDateYYYYMMDD(checkout),
            Rate: Number(rate),
            NoOfRooms: Number(rooms),
            PackagePlan: plan,
            taxrate: Number(taxRate),
            TotalAmt: Number(total)
        };

        test.push(proformaDetail)
    });

    activityGroups.forEach(group => {
        const groupId = group.getAttribute('data-activity-group-id');
        const activityName = group.querySelector(`#activityName_${groupId}`).value;
        // const activitySacCode = group.querySelector(`#activitySacCode_${groupId}`).value;
        const activityCount = group.querySelector(`#activityCount_${groupId}`).value;
        const activityRate = group.querySelector(`#activityRate_${groupId}`).value;
        const activityTaxRate = group.querySelector(`#activityTaxRate_${groupId}`).value;
        const activityTotal = group.querySelector(`#activityTotal_${groupId}`).value;

        const activityFields = {
            activityid: activityName,
            // SacCode: activitySacCode,
            no_of_activity: Number(activityCount),
            rate: Number(activityRate),
            tax_rate: Number(activityTaxRate),
            total_amt: Number(activityTotal),
        }
        activityDetails.push(activityFields)
    })

    const ProformaInvoiceData = {
        InvoiceId: invoice_id,
        PropertyId: propertyID,
        GuestDetail: guestName,
        InvoiceDate: invoiceDate,
        advance_amt: advanceAmt,
        ProformaInvoiceDetail: test || [],
        ProformaInvoiceActivity: activityDetails || []
    }

    console.log(ProformaInvoiceData)

    const form = document.getElementById('proformaInvoice')


    fetch(apiUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(ProformaInvoiceData)  // Correctly stringify the ProformaInvoiceData
    })
        .then(response => response.json())  // Expecting a JSON response
        .then(data => {
            console.log('Message:', data);
            // You can perform additional actions here if needed, like redirecting the user.
            showToast('InvoiceForm Saved!!!', 'success', 1200)
            setTimeout(() => {
                window.open(`receipt.html?invoice_id=${ProformaInvoiceData?.InvoiceId}`, '_blank');
                location.reload()
            }, 900);

        })
        .catch(error =>
        (
            showToast('Error', 'error', 1200),
            console.error('Error:', error))

        )
        .finally(() => {
            form.reset();  // Reset form after submission
            button.disabled = false;  // Enable button again
            buttonText.innerText = 'Submit';  // Reset button text
        });
}


function handleExpenditureForm(e) {
    e.preventDefault();

    const button = document.getElementById('submitButton')
    // button.disabled = true
    // button.innerText = '⏳ Submitting...'

    var invoice_id = '';
    if (document.getElementById('expenditFormID').selectedIndex > 0) {
        console.log('EDIT')
        invoice_id = document.getElementById('expenditFormID').value;
        console.log(invoice_id)
    } else {
        console.log('NEW')
        invoice_id = uuidv4();
        console.log(invoice_id)
    }

    const guestDetail = document.getElementById('guest').value
    const dateInput = document.getElementById('date').value   // e.g., "16-10-2025"
    const invoiceDate = formatDateYYYYMMDD(dateInput);
    const advanceAmt = document.getElementById('advanceAmt').value

    const apiUrl = `${BASEPATH}/api/Expendit_Invoice?APIKEY=${APIKEY}`;

    const ExpeditionTour = [];
    const ExpeditionActivity = [];

    const tourGroups = document.querySelectorAll('[data-tour-group-id]');
    const activityGroups = document.querySelectorAll('[data-activity-group-id]');


    tourGroups.forEach(group => {
        const groupId = group.getAttribute('data-tour-group-id');

        const tourName = group.querySelector(`#tourName_${groupId}`).value;
        console.log('tourId --> ', tourName)
        const checkin = group.querySelector(`#checkin_${groupId}`).value;
        const checkout = group.querySelector(`#checkout_${groupId}`).value;

        // const sacCode = group.querySelector(`#sacCode_${groupId}`).value;

        const pax = group.querySelector(`#pax_${groupId}`).value;
        const rate = group.querySelector(`#rate_${groupId}`).value;
        const taxRate = group.querySelector(`#taxRate_${groupId}`).value;
        const tourTotal = group.querySelector(`#tourTotal_${groupId}`).value;

        const tourDetail = {
            InvoiceId: invoice_id,
            TourId: tourName,
            CheckInDate: formatDateYYYYMMDD(checkin),
            CheckOutDate: formatDateYYYYMMDD(checkout),
            // SacCode: sacCode,
            NoOfPax: Number(pax),
            CostPerPax: Number(rate),
            taxrate: Number(taxRate),
            Total: Number(tourTotal),
        };
        ExpeditionTour.push(tourDetail)
    })

    activityGroups.forEach(group => {
        const groupId = group.getAttribute('data-activity-group-id');

        const activityName = group.querySelector(`#activityName_${groupId}`).value;
        // const activitySacCode = group.querySelector(`#activitySacCode_${groupId}`).value;
        const activityCount = group.querySelector(`#activityCount_${groupId}`).value;
        const activityRate = group.querySelector(`#activityRate_${groupId}`).value;
        const activityTaxRate = group.querySelector(`#activityTaxRate_${groupId}`).value;
        const activityTotal = group.querySelector(`#activityTotal_${groupId}`).value;

        const activityFields = {
            InvoiceId: invoice_id,
            ActivityId: activityName,
            // SacCode: activitySacCode,
            NoOfActivity: Number(activityCount),
            Rate: Number(activityRate),
            Total: Number(activityTotal),
            taxrate: Number(activityTaxRate),
        }
        ExpeditionActivity.push(activityFields)
    })

    const ExpenditInvoiceData = {
        PropertyId: expenditPropertyId,
        InvoiceId: invoice_id,
        GuestDetail: guestDetail,
        InvoiceDate: invoiceDate,
        advance_amt: advanceAmt,
        CreatedOn: formatDateYYYYMMDDCreate(new Date()),
        ExpeditionInvoiceTour: ExpeditionTour || [],
        ExpeditionInvoiceActivity: ExpeditionActivity || []
    }

    console.log(ExpenditInvoiceData);
    console.log(ExpenditInvoiceData?.InvoiceId);


    fetch(apiUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(ExpenditInvoiceData)
    })
        .then(response => {
            if (!response.ok) {
                // If response is not OK, throw an error with the status text
                // throw new Error(response);
                console.log(response)
            }
            return response.json();  // Parse the response JSON if it's OK
        }
        )  // If you expect a JSON response
        .then(data => {
            console.log('Success:', data)
            showToast('Expenditure Success', 'success', 1200)
            setTimeout(() => {
                window.open(`expenditReceipt.html?expenditInvoice_id=${ExpenditInvoiceData?.InvoiceId}`, '_blank');
                location.reload()
            }, 900);

        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            button.disabled = false;
            button.innerText = 'Submit'
        })

}


function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

