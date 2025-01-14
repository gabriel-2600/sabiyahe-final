const studentInventory = document.getElementById('stud-inventory');
const inventoryAndReservations = document.getElementById('inventory-reservations-div');
const studentRequest = document.getElementById('stud-rent-request');
const studentReservations = document.getElementById('stud-reservations');

// Accessing user ID from the data attribute in the studentHome.ejs
const userId = document.getElementById('user-profile').dataset.userId;

document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/student/getAll')
        .then(response => response.json())
        .then(data => loadForRentTable(data['data']));
});

document.addEventListener('DOMContentLoaded', function () {
    fetch(`/api/student/getRentRequests/${userId}`)
        .then(response => response.json())
        .then(data => loadPendingRequestsTable(data['data']));
});

document.addEventListener('DOMContentLoaded', function () {
    fetch(`/api/student/getReservations/${userId}`)
        .then(response => response.json())
        .then(data => loadReservationsTable(data['data']));
});

const studSearchBtn = document.querySelector('#stud-search-btn');
studSearchBtn.onclick = function () {
    const studSearchValue = document.querySelector('#stud-search-input').value

    fetch(`/api/student/search/${studSearchValue}`)
        .then(response => response.json())
        .then(data => loadForRentTable(data['data']));
}

// request form to input rent date and return date
function handleRentRequest(event) {
    const itemId = event.target.dataset.id;

    // Create a new div for rent date and return date inputs
    const rentRequestDiv = document.createElement('div');
    rentRequestDiv.classList.add('rent-request-div');
    rentRequestDiv.innerHTML = `
        <label for="rentDate">Rent Date:</label>
        <input type="date" id="rentDate" required>

        <label for="returnDate">Return Date:</label>
        <input type="date" id="returnDate" required>

        <textarea id="rentRequestText" placeholder="Note to custodian..." rows="25" cols="60"></textarea>

        <button id="submitRentRequest">Submit</button>
        <button id="cancelRentRequest">Cancel</button>
    `;

    inventoryAndReservations.appendChild(rentRequestDiv);

    // Add event listener for the submit button
    document.getElementById('submitRentRequest').addEventListener('click', () => {
        const rentDateInput = document.getElementById('rentDate');
        const returnDateInput = document.getElementById('returnDate');

        // Validate rent date and return date
        const rentDate = new Date(rentDateInput.value);
        const returnDate = new Date(returnDateInput.value);

        if (rentDate >= returnDate) {
            alert('Return date must be after rent date');
            return;
        }

        const currentDate = new Date();
        const next24Hours = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);

        if (rentDate < next24Hours) {
            alert('Rent date must be within the next 48 hours');
            return;
        }

        // Call the submitRentRequest function with the itemId, rent date, and return date
        submitRentRequest(itemId, rentDate.toISOString(), returnDate.toISOString());

        // Remove the rent request div
        inventoryAndReservations.removeChild(rentRequestDiv);
    });

    // Add event listener for the cancel button
    document.getElementById('cancelRentRequest').addEventListener('click', () => {
        // Remove the rent request div
        inventoryAndReservations.removeChild(rentRequestDiv);
    });
}

// submit the rent request form
function submitRentRequest(itemId, rentDate, returnDate) {
    const note = document.getElementById('rentRequestText').value;
    const formattedRentDate = rentDate.split('T')[0]; // Extract date part only
    const formattedReturnDate = returnDate.split('T')[0]; // Extract date part only

    fetch(`/api/student/requestRent/${userId}/${itemId}`, {
        method: 'POST',
        body: JSON.stringify({ rentDate: formattedRentDate, returnDate: formattedReturnDate, note }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Request Sent Successful! Please wait for custodian before attempting to request the same item..");
                location.reload();
            } else {
                alert('Error submitting rent request');
            }
        })
        .catch(error => {
            console.error('Error submitting rent request:', error);
            alert("Request Failed, Please try again later...");
        });
}



// Cancel request
function handleCancelRequest(event) {
    const requestId = event.target.dataset.id;

    // Send a request to the server to cancel the rent request
    fetch(`/api/student/cancelRequest/${requestId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            location.reload();
        })
        .catch(error => {
            console.error('Error canceling rent request:', error);
        });
}

// load all the available items in the inventory
function loadForRentTable(data) {
    const table = document.getElementById('stud-inventory-tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='6'>No Data</td></tr>";
        return;
    }

    let tableHtml = '';

    data.forEach(function ({ item_id, item_name, item_description, images }) {
        const imageUrl = `/images/${images}`;;

        tableHtml += `<tr id='row-${item_id}'>`;
        tableHtml += `<td>${item_name}</td>`
        tableHtml += `<td>${item_description}`
        tableHtml += `<td><img src="${imageUrl}" alt="Item Image" style="max-width: 150px;"></td>`;

        tableHtml += `<td><button class='rent-request-btn' data-id='${item_id}'>Request Rent</td>`
    });

    table.innerHTML = tableHtml;

    // Add event listener to each "Request Rent" button
    document.querySelectorAll('.rent-request-btn').forEach(button => {
        button.addEventListener('click', handleRentRequest);
    });
}

// load all the pending requests of the currently logged in user
function loadPendingRequestsTable(data) {
    const table = document.getElementById('stud-request-tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Pending Requests</td></tr>";
        return;
    }

    let tableHtml = '';

    data.forEach(function ({ request_id, item_name, rent_date, return_date, status }) {
        tableHtml += `<tr id='row-${request_id}'>`;
        tableHtml += `<td>${request_id}</td>`
        tableHtml += `<td>${item_name}</td>`
        tableHtml += `<td>${new Date(rent_date).toLocaleDateString()}</td>`
        tableHtml += `<td>${new Date(return_date).toLocaleDateString()}</td>`
        tableHtml += `<td>${status}</td>`
        tableHtml += `<td><button class='cancel-request-btn' data-id='${request_id}'>Cancel Request</td>`
    });

    table.innerHTML = tableHtml;

    // Add event listener to each "Cancel Request" button
    document.querySelectorAll('.cancel-request-btn').forEach(button => {
        button.addEventListener('click', handleCancelRequest);
    });
}

// Load reservations for the currently logged-in user
function loadReservationsTable(data) {
    const table = document.getElementById('stud-reservations-tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='5'>No Reservations</td></tr>";
        return;
    }

    let tableHtml = '';

    data.forEach(function ({ reservation_id, item_id, item_name, date_approved, rent_date, return_date }) {
        tableHtml += `<tr id='row-${reservation_id}'>`;
        tableHtml += `<td>${reservation_id}</td>`
        tableHtml += `<td>${item_name}</td>`
        tableHtml += `<td>${new Date(date_approved).toLocaleDateString()}</td>`;
        tableHtml += `<td>${new Date(rent_date).toLocaleDateString()}</td>`;
        tableHtml += `<td>${new Date(return_date).toLocaleDateString()}</td>`;

    });

    table.innerHTML = tableHtml;
}
