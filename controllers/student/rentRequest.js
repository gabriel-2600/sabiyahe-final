const express = require('express');
const router = express.Router();

const db = require('../../routes/db-config');
const studentInventory = require('./studentInventory');

/**
 * Available Room/Equipment For Rent
 * inventory table
 * */ 

// read the available items in the inventory table
router.get('/student/getAll', (request, response) => {
    const db = studentInventory.getInventoryInstance();

    const result = db.getAllData();
    result
        .then(data => response.json({ data: data }))
        .catch(err => console.log(err));
});

router.get('/student/search/:name', (request,response) => {
    const { name } = request.params;
    const db = studentInventory.getInventoryInstance();

    const result = db.searchByName(name);

    result
        .then(data => response.json({ data : data }))
        .catch(err => response.log(err));
})

// Create a new rent request
router.post('/student/requestRent/:userId/:itemId', (req, res) => {
    const { userId, itemId } = req.params;
    const { rentDate, returnDate, note } = req.body;

    // Retrieve the email associated with the user_id from the database
    const getUserEmailQuery = 'SELECT email FROM users WHERE user_id = ?';
    db.query(getUserEmailQuery, [userId], (getUserEmailError, getUserEmailResults) => {
        if (getUserEmailError) {
            console.error('Error getting user email:', getUserEmailError);
            return res.status(500).json({ success: false, message: 'Error creating rent request' });
        }

        if (!getUserEmailResults || getUserEmailResults.length === 0) {
            console.error('User not found. userId:', userId);
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const email = getUserEmailResults[0].email;

        // Get the item name from the inventory
        const getItemNameQuery = 'SELECT item_name FROM inventory WHERE item_id = ?';
        db.query(getItemNameQuery, [itemId], (getItemNameError, getItemNameResults) => {
            if (getItemNameError) {
                console.error('Error getting item name:', getItemNameError);
                return res.status(500).json({ success: false, message: 'Error creating rent request' });
            }

            if (!getItemNameResults || getItemNameResults.length === 0) {
                console.error('Item not found. itemId:', itemId);
                return res.status(404).json({ success: false, message: 'Item not found' });
            }

            const itemName = getItemNameResults[0].item_name;

            const insertRentRequestQuery = 'INSERT INTO rent_requests (user_id, item_id, item_name, rent_date, return_date, note, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [userId, itemId, itemName, rentDate, returnDate, note, email, 'pending'];

            db.query(insertRentRequestQuery, values, (err, results) => {
                if (err) {
                    console.error('Error creating rent request:', err);
                    return res.status(500).json({ success: false, message: 'Error creating rent request' });
                }

                return res.status(200).json({ success: true, message: 'Rent request created successfully' });
            });
        });
    });
});


/**
 * Current Pending Requests
 * rent_requests table
 * */ 

// Read rent requests for the currently logged-in user
router.get('/student/getRentRequests/:userId', (req, res) => {
    const { userId } = req.params;

    // Query rent requests for the given user ID
    const query = 'SELECT * FROM rent_requests WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error getting rent requests:', err);
            return res.status(500).json({ success: false, message: 'Error getting rent requests' });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

// delete a rent request
router.delete('/student/cancelRequest/:requestId', (req, res) => {
    const { requestId } = req.params;

    // Delete the corresponding row from the rent_requests table
    const query = 'DELETE FROM rent_requests WHERE request_id = ?';
    db.query(query, [requestId], (err, results) => {
        if (err) {
            console.error('Error canceling rent request:', err);
            return res.status(500).json({ success: false, message: 'Error canceling rent request' });
        }

        return res.status(200).json({ success: true, message: 'Rent request canceled successfully' });
    });
});

/**
 * Current Reservations
 * reservations table
 * */ 

// Read reservations for the currently logged-in user
router.get('/student/getReservations/:userId', (req, res) => {
    const { userId } = req.params;

    // Query reservations for the given user ID
    const query = 'SELECT * FROM reservations WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error getting reservations:', err);
            return res.status(500).json({ success: false, message: 'Error getting reservations' });
        }

        return res.status(200).json({ success: true, data: results });
    });
});

module.exports = router;
