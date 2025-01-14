const custodianInventory = document.getElementById('inventory-table');

// display all items in inventory
document.addEventListener('DOMContentLoaded', function () {
    fetch('api/custodian/getAll')
        .then(response => response.json())
        .then(data => loadInventoryTable(data['data']));

});

// display all items in rent requests
document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/custodian/rentRequests')
        .then(response => response.json())
        .then(data => loadRentRequestsTable(data.data));
});

// display all data in reservations
document.addEventListener('DOMContentLoaded', function () {
    // Display all reservations on page load
    fetch('/api/custodian/reservations')
        .then(response => response.json())
        .then(data => loadReservationsTable(data.data));
});

document.querySelector('table tbody').addEventListener('click', function(event) {
    if (event.target.className === 'delete-row-btn') {
        deleteRowById(event.target.dataset.id);
    }
    if (event.target.className === 'edit-availability-btn') {
        toggleAvailabilityById(event.target.dataset.id);
    }
});

document.getElementById('requests-tbody').addEventListener('click', function(event) {
    if (event.target.classList.contains('approve-request-btn')) {
        handleApproveRequest(event.target.dataset.id);
    }
});

// delete an item in the inventory
function deleteRowById(id) {
    fetch(`/api/custodian/delete/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const deletedRow = document.getElementById('row-' + id);
            if (deletedRow) {
                deletedRow.remove();
            }
        } else {
            alert("Can't be deleted because currently reserved!");
        }
    })
    .catch(error => console.log(error));
}

// change the availability of an item in the inventory
function toggleAvailabilityById(id) {
    fetch(`/api/custodian/toggle/${id}`, {
        method: 'PATCH'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reload the table after successful toggle
                fetch('api/custodian/getAll')
                    .then(response => response.json())
                    .then(data => loadInventoryTable(data['data']));
            }
        })
        .catch(error => console.log(error));
}

const searchBtn = document.querySelector('#search-btn');
searchBtn.onclick = function() {
    const searchValue = document.querySelector('#search-input').value

    fetch(`api/custodian/search/${searchValue}`)
        .then(response => response.json())
        .then(data => loadInventoryTable(data['data']));
}

// add new item in the inventory
const addBtn = document.querySelector('#add-name-btn');
addBtn.onclick = function () {
    const nameInput = document.querySelector('#name-input');
    const descriptionInput = document.querySelector('#item-description');
    const imageInput = document.querySelector('#image-upload-input');  // Add this line

    const name = nameInput.value;
    const description = descriptionInput.value;
    const image = imageInput.files[0];  // Add this line

    nameInput.value = '';
    descriptionInput.value = '';
    imageInput.value = '';  // Add this line

    // Create a FormData object
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', image);

    fetch('/api/custodian/insert', {
        method: 'POST',
        body: formData,  // Use FormData for file uploads
    })
        .then(response => response.json())
        .then(data => insertRowIntoTable(data['data']))
        .catch(error => console.log(error));
}


// Function to handle quantity change
function handleQuantityChange(event) {
    const itemId = event.target.dataset.id;
    const newQuantity = event.target.value;

    fetch(`/api/custodian/updateQuantity/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
    })
    .then(response => response.json())
    .then(data => {
        // Handle response if needed
        console.log(data);
    })
    .catch(error => {
        console.error('Error updating quantity:', error);
    });
}

// insert the added item in the inventory table
function insertRowIntoTable(data) {
    const table = document.querySelector('table tbody');

    const availabilityText = data.availability === 1 ? 'Available' : 'Unavailable';

    const newRow = `
        <tr>
            <td>${data.item_id}</td>
            <td>${data.item_name}</td>
            <td>${availabilityText}</td>
            <td><button class='edit-availability-btn' data-id='${data.item_id}'>Edit Availability</td>
            <td><button class='delete-row-btn' data-id='${data.item_id}'>Delete</td>
        </tr>
    `;

    table.innerHTML += newRow;
    location.reload();
}

// reject a rent request
function handleRejectRequest(event) {
    const requestId = event.target.dataset.id;

    // Send a request to the server to handle the rejection
    fetch(`/api/custodian/rejectRequest/${requestId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        // Reload the rent requests table after rejection
        fetch('/api/custodian/rentRequests')
            .then(response => response.json())
            .then(data => loadRentRequestsTable(data.data));
    })
    .catch(error => {
        console.error('Error rejecting rent request:', error);
    });
}

function loadInventoryTable(data) {
    const table = document.querySelector('table tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='10'>No Data</td></tr>";
        return;
    }

    let tableHtml = '';

    data.forEach(function ({ item_id, item_name, item_description, images, availability, quantity }) {
        const availabilityText = availability === 1 ? 'Available' : 'Unavailable';
        const imageUrl = `/images/${images}`;

        tableHtml += `<tr id='row-${item_id}'>`;
        tableHtml += `<td>${item_name}</td>`;
        tableHtml += `<td>${item_description}</td>`;
        tableHtml += `<td><img src="${imageUrl}" alt="Item Image" style="max-width: 150px;"></td>`;
        tableHtml += `<td>${availabilityText}</td>`;
        tableHtml += `<td><button class='delete-row-btn' data-id='${item_id}'>Delete</button></td>`;
        tableHtml += `<td>${quantity}</td>`;
        tableHtml += `<td><input type="number" class="quantity-input" data-id="${item_id}" min="0" value="${quantity}"></td>`;
        tableHtml += '</tr>';
        
    });

    table.innerHTML = tableHtml;

    // Add event listeners for quantity input fields
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', handleQuantityChange);
    });
}


function loadRentRequestsTable(data) {
    const table = document.getElementById('requests-tbody');

    if (data.length === 0) {
        table.innerHTML = "<tr><td class='no-data' colspan='8'>No Pending Requests</td></tr>";
        return;
    }

    let tableHtml = '';

    data.forEach(function ({ request_id, email, rent_date, return_date, note, item_name }) {
        tableHtml += `<tr id='row-${request_id}'>`;
        tableHtml += `<td>${request_id}</td>`;
        tableHtml += `<td>${email}</td>`;
        tableHtml += `<td>${item_name}</td>`;
        tableHtml += `<td>${new Date(rent_date).toLocaleDateString()}</td>`;
        tableHtml += `<td>${new Date(return_date).toLocaleDateString()}</td>`;
        tableHtml += `<td>${note}</td>`;
        tableHtml += `<td><button class='approve-request-btn' data-id='${request_id}'>Approve</button></td>`;
        tableHtml += `<td><button class='reject-request-btn' data-id='${request_id}'>Reject</button></td>`;
    });

    table.innerHTML = tableHtml;

    // Add event listener to each "Reject" button
    document.querySelectorAll('.reject-request-btn').forEach(button => {
        button.addEventListener('click', handleRejectRequest);
    });
}

function loadReservationsTable(data) {
    const table = document.getElementById('reservations-tbody');

    if (data.length === 0) {
        // Display a message if there are no reservations
        table.innerHTML = "<tr><td colspan='8'>No Reservations</td></tr>";
        return;
    }

    let tableHtml = '';

    data.forEach(function ({ reservation_id, email, rent_date, return_date, item_name, date_approved, status }) {
        tableHtml += `<tr id='row-${reservation_id}'>`;
        tableHtml += `<td>${reservation_id}</td>`;
        tableHtml += `<td>${email}</td>`;
        tableHtml += `<td>${item_name}</td>`;
        tableHtml += `<td>${new Date(date_approved).toLocaleDateString()}</td>`;
        tableHtml += `<td>${new Date(rent_date).toLocaleDateString()}</td>`;
        tableHtml += `<td>${new Date(return_date).toLocaleDateString()}</td>`;
        tableHtml += `<td>${status}</td>`;
        tableHtml += `<td><button class='return-btn' data-id='${reservation_id}'>Return</td>`;
        tableHtml += `</tr>`;
    });

    table.innerHTML = tableHtml;

    document.querySelectorAll('.return-btn').forEach(button => {
        button.addEventListener('click', handleReturn);
    });
}

// Function to handle the approval of a rent request
function handleApproveRequest(requestId) {
    // Send a request to the server to handle the approval
    fetch(`/api/custodian/approveRequest/${requestId}`, {
        method: 'PUT',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            throw new Error('Approval unsuccessful');
        }
    })
}

function handleReturn(event) {
    const reservationId = event.target.dataset.id;

    fetch(`/api/custodian/returnItem/${reservationId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Item returned successfully!');
            location.reload(); // Reload the page or update the UI as needed
        } else {
            alert('Error returning item. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error returning item:', error);
        alert('Error returning item. Please try again.');
    });
}