// studentInventory.js
const db = require('../../routes/db-config');
let instance = null;

class StudentInventory {
    static getInventoryInstance() {
        return instance ? instance : new StudentInventory();
    }

    // Read the data from the inventory table of only available items
    // '/student/getAll'
    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                // Modify the query to only retrieve items with availability set to 1
                const query = 'SELECT * FROM inventory WHERE availability = 1;';

                db.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });

            return response;

        } catch (error) {
            console.log(error);
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
}

module.exports = StudentInventory;
