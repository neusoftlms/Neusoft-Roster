const { db } = require('../database/db');

class Employee {
    static getAll(callback) {
        db.all('SELECT * FROM employees', callback);
    }

    static getById(id, callback) {
        db.get('SELECT * FROM employees WHERE id = ?', [id], callback);
    }

    static create(employee, callback) {
        const fields = Object.keys(employee);
        const values = Object.values(employee);
        const placeholders = fields.map(() => '?').join(',');

        db.run(
            `INSERT INTO employees (${fields.join(',')}) VALUES (${placeholders})`,
            values,
            function(err) {
                callback(err, { id: this.lastID });
            }
        );
    }

    static update(id, employee, callback) {
        const fields = Object.keys(employee);
        const setClause = fields.map(field => `${field} = ?`).join(',');
        const values = Object.values(employee);
        values.push(id);

        db.run(
            `UPDATE employees SET ${setClause} WHERE id = ?`,
            values,
            callback
        );
    }

    static deactivate(id, callback) {
        db.run(
            'UPDATE employees SET status = "Inactive" WHERE id = ?',
            [id],
            callback
        );
    }
}

module.exports = Employee;
