const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
router.use(fileUpload());

const db = require('../../routes/db-config');

const custodianInventory = require('./custodianInventory');

/**
 * Inventory
 * inventory table
 * */ 

// add new item in the inventory table
router.post('/custodian/insert', (request, response) => {
    const { name, description } = request.body;

    // Check if files are present in the request
    if (!request.files || Object.keys(request.files).length === 0) {
        return response.status(400).json({ error: 'No files were uploaded.' });
    }

    const image = request.files.image; // 'image' should match the name attribute in your HTML form

    const db = custodianInventory.getInventoryInstance();

    const result = db.insertNewItem(name, description, image);

    result
        .then(data => response.json({ data: data }))
        .catch(err => { console.log(err) });
});


// read all the items in the inventory table
router.get('/custodian/getAll', (request, response) => {
    const db = custodianInventory.getInventoryInstance();

    const result = db.getAllData();

    result
        .then(data => response.json({ data : data }))
        .catch(err => console.log(err));
});


router.get('/custodian/search/:name', (request, response) => {
    const { name } = request.params;
    const db = custodianInventory.getInventoryInstance();
    
    const result = db.searchByName(name);

    result
        .then(data => response.json({ data : data }))
        .catch(err => console.log(err));
})

// update the availability of item in the inventory table
router.patch('/custodian/toggle/:id', (request, response) => {
    const { id } = request.params;
    const db = custodianInventory.getInventoryInstance();

    const result = db.toggleAvailabilityById(id);

    result
        .then(data => response.json({ success: data }))
        .catch(err => console.log(err));
});

// delete item in the inventory table
router.delete('/custodian/delete/:id', async (request, response) => {
    const { id } = request.params;
    const db = custodianInventory.getInventoryInstance();

    try {
        // Delete the item from the inventory and associated rent requests
        const result = await db.deleteItemAndRentRequests(id);

        response.json({ success: result });
    } catch (error) {
        console.error(error);
        response.status(500).json({ success: false, message: 'Error deleting item and associated rent requests' });
    }
});

// Update item quantity and availability
router.put('/custodian/updateQuantity/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    let availability = 1; // Default availability

    // If quantity is 0, set availability to 0 (unavailable)
    if (parseInt(quantity) === 0) {
        availability = 0;
    }

    const updateQuantityQuery = 'UPDATE inventory SET quantity = ?, availability = ? WHERE item_id = ?';

    db.query(updateQuantityQuery, [quantity, availability, itemId], (error, results) => {
        if (error) {
            console.error('Error updating quantity:', error);
            return res.status(500).json({ success: false, message: 'Error updating quantity' });
        }

        return res.status(200).json({ success: true, message: 'Quantity and availability updated successfully' });
    });
});


/**
 * Pending Requests From Students
 * rent_requests table
 * */ 

// Read all rent requests
router.get('/custodian/rentRequests', (req, res) => {
    // Query all rent requests
    const query = 'SELECT * FROM rent_requests';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error getting rent requests:', err);
            return res.status(500).json({ success: false, message: 'Error getting rent requests' });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

// Function to insert a new reservation
function insertReservation(userId, email, itemId, itemName, dateApproved, rentDate, returnDate, res) {
    const query = 'INSERT INTO reservations (user_id, email, item_id, item_name, date_approved, rent_date, return_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, "unreturned")';
    
    const values = [
        userId,
        email,
        itemId,
        itemName,
        new Date(dateApproved),
        new Date(rentDate),
        new Date(returnDate)
    ];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting reservation:', err);
            return res.status(500).json({ success: false, message: 'Error inserting reservation' });
        }
    });
}

// Function to update item quantity and availability
function updateItemQuantityAndAvailability(itemId, quantity, res) {
    const availability = quantity > 0 ? 1 : 0; // Set availability to 1 if quantity is greater than 0, else set to 0

    const query = 'UPDATE inventory SET quantity = ?, availability = ? WHERE item_id = ?';
    const values = [quantity, availability, itemId];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating item quantity and availability:', err);
            return res.status(500).json({ success: false, message: 'Error updating item quantity and availability' });
        }
    });
}

// Function to delete a rent request by request ID
function deleteRentRequestById(requestId, callback) {
    const query = 'DELETE FROM rent_requests WHERE request_id = ?';
    db.query(query, [requestId], (err, results) => {
        if (err) {
            console.error('Error deleting rent request:', err);
            return callback(err); // Pass the error to the callback
        }
    });
}

// Function to get all rent requests
async function getAllRentRequests() {
    const query = 'SELECT * FROM rent_requests';
    const [results] = await db.promise().query(query);
    return results;
}

// Function to handle the approval of a rent request
router.put('/custodian/approveRequest/:id', async (req, res) => {
    const { id } = req.params;
    const dateApproved = new Date().toLocaleDateString(); // Get the current date in the format MM/DD/YYYY

    try {
        // Fetch the details of the rent request before deleting it
        const getRequestDetailsQuery = 'SELECT user_id, email, item_id, item_name, rent_date, return_date FROM rent_requests WHERE request_id = ?';
        const [results] = await db.promise().execute(getRequestDetailsQuery, [id]);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Rent request not found' });
        }

        const { user_id, email, item_id, item_name, rent_date, return_date } = results[0];

        // Insert a new reservation with rent_date and return_date
        await insertReservation(user_id, email, item_id, item_name, dateApproved, rent_date, return_date, res);

        // Update item quantity (decrease by 1) and availability
        const getItemQuantityQuery = 'SELECT quantity FROM inventory WHERE item_id = ?';
        const [quantityResult] = await db.promise().execute(getItemQuantityQuery, [item_id]);

        if (quantityResult.length > 0) {
            const currentQuantity = quantityResult[0].quantity;
            if (currentQuantity > 0) {
                await updateItemQuantityAndAvailability(item_id, currentQuantity - 1, res);
            }
        }

        // Delete the rent request
        await deleteRentRequestById(id, res);

        // Reload the rent requests table after approval
        const rentRequests = await getAllRentRequests();
        res.status(200).json({ success: true, data: rentRequests });
    } catch (error) {
        console.error('Error approving rent request:', error);
        res.status(500).json({ success: false, message: 'Error approving rent request' });
    }
});

// Handle the rejection of a rent request
router.delete('/custodian/rejectRequest/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM rent_requests WHERE request_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting rent request:', err);
            return callback(err); // Pass the error to the callback
        }
        return res.status(200).json({ success: true, data: results });
    });
});

/**
 * Current Reservations
 * reservations table
 * */ 

// read all data in reservations table
router.get('/custodian/reservations', async (req, res) => {
    try {
        const query = 'SELECT * FROM reservations';
        const [results] = await db.promise().query(query);

        // Format the date in each result
        const formattedResults = results.map(result => ({
            ...result,
            date_approved: new Date(result.date_approved).toLocaleDateString(),
        }));

        res.status(200).json({ success: true, data: formattedResults });
    } catch (error) {
        console.error('Error getting reservations:', error);
        res.status(500).json({ success: false, message: 'Error getting reservations' });
    }
});

// Function to handle the return of a reserved item
router.put('/custodian/returnItem/:reservationId', async (req, res) => {
    const { reservationId } = req.params;

    try {
        // Fetch reservation details before updating
        const getReservationDetailsQuery = 'SELECT item_id FROM reservations WHERE reservation_id = ?';
        const [results] = await db.promise().execute(getReservationDetailsQuery, [reservationId]);

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        const { item_id } = results[0];

        // Fetch the current quantity and availability from the inventory
        const getInventoryDetailsQuery = 'SELECT quantity, availability FROM inventory WHERE item_id = ?';
        const [inventoryResults] = await db.promise().execute(getInventoryDetailsQuery, [item_id]);

        if (inventoryResults.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in inventory' });
        }

        const currentQuantity = inventoryResults[0].quantity;
        const currentAvailability = inventoryResults[0].availability;

        // Update the inventory with the new quantity (increment by 1) and set availability to 1
        const updatedQuantity = currentQuantity + 1;

        const updateQuantityAndAvailabilityQuery = 'UPDATE inventory SET quantity = ?, availability = ? WHERE item_id = ?';
        await db.promise().execute(updateQuantityAndAvailabilityQuery, [updatedQuantity, 1, item_id]);

        // Delete the reservation
        const deleteReservationQuery = 'DELETE FROM reservations WHERE reservation_id = ?';
        await db.promise().execute(deleteReservationQuery, [reservationId]);

        res.status(200).json({ success: true, message: 'Item returned successfully' });
    } catch (error) {
        console.error('Error returning item:', error);
        res.status(500).json({ success: false, message: 'Error returning item' });
    }
});

module.exports = router;