const path = require('path'); // Add this line
const db = require('../../routes/db-config');
let instance = null;

class CustodianInventory{
    static getInventoryInstance() {
        return instance ? instance : new CustodianInventory();
    }

    // create/insert the data into the inventory table of webtechdb
    // '/custodian/insert'
    async insertNewItem(name, description, image) {
        try {
            const insertId = await new Promise((resolve, reject) => {
                // Assuming 'images' is the column where you want to store the image file name
                const query = 'INSERT INTO inventory (item_name, item_description, images, availability) VALUES (?, ?, ?, ?);';
    
                // Move the file to the public/images directory
                const uploadPath = path.join(__dirname, '../../public/images/', image.name);
    
                // Use mv() to move the file to the specified directory
                image.mv(uploadPath, (err) => {
                    if (err) {
                        return reject(new Error(err.message));
                    }
    
                    // Continue with the database insert
                    db.query(query, [name, description, image.name, 1], (err, result) => {
                        if (err) {
                            return reject(new Error(err.message));
                        }
    
                        resolve(result.insertId);
                    });
                });
            });
    
            return {
                id: insertId,
                name: name,
                description: description,
                availability: 1,
            };
        } catch (error) {
            console.log(error);
        }
    }

    //read the data from the inventory table of webtechdb
    // '/custodian/getAll'
    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = 'SELECT * FROM inventory;';

                db.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            // console.log(response);
            return response;

        } catch (error) {
            console.log(error);
        }
    }

    // update/patch the availability of an item
    // '/custodian/toggle/:id'
    async toggleAvailabilityById(id) {
        try {
            id = parseInt(id, 10);
            const response = await new Promise((resolve, reject) => {
                const query = 'UPDATE inventory SET availability = 1 - availability WHERE item_id = ?';
    
                db.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows);
                });
            });
    
            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async searchByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = 'SELECT * FROM inventory WHERE item_name = ?;';

                db.query(query, [name], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                })
            });

            return response;
        } catch (error) {
            console.log(error);
        }
    }

    // delete an item in the inventory table along with associated rent requests
    async deleteItemAndRentRequests(id) {
        try {
            id = parseInt(id, 10);
            const response = await new Promise((resolve, reject) => {
                // Use a transaction to ensure atomicity
                db.beginTransaction((transactionError) => {
                    if (transactionError) {
                        reject(new Error(transactionError.message));
                    }

                    // Step 1: Delete associated rent requests
                    const deleteRentRequestsQuery = 'DELETE FROM rent_requests WHERE item_id = ?';
                    db.query(deleteRentRequestsQuery, [id], (rentRequestsError, rentRequestsResult) => {
                        if (rentRequestsError) {
                            return db.rollback(() => {
                                reject(new Error(rentRequestsError.message));
                            });
                        }

                        // Step 2: Delete the item from the inventory
                        const deleteInventoryItemQuery = 'DELETE FROM inventory WHERE item_id = ?';
                        db.query(deleteInventoryItemQuery, [id], (inventoryError, inventoryResult) => {
                            if (inventoryError) {
                                return db.rollback(() => {
                                    reject(new Error(inventoryError.message));
                                });
                            }

                            // Commit the transaction
                            db.commit((commitError) => {
                                if (commitError) {
                                    return db.rollback(() => {
                                        reject(new Error(commitError.message));
                                    });
                                }

                                resolve(inventoryResult.affectedRows);
                            });
                        });
                    });
                });
            });

            return response === 1 ? true : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = CustodianInventory;