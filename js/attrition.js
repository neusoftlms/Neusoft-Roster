const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const xlsx = require('xlsx');

// Get all attritions with employee details
router.get('/', (req, res) => {
    db.all(`
        SELECT a.*, e.employeeName, e.employeeCode 
        FROM attritions a
        JOIN employees e ON a.employeeId = e.id
        ORDER BY a.createdAt DESC
    `, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
});

// Record new attrition
router.post('/', (req, res) => {
    const { employeeId, lastWorkingDate, reason, details, notes, exitInterview } = req.body;

    db.serialize(() => {
        // Insert attrition record
        db.run(
            `INSERT INTO attritions 
            (employeeId, lastWorkingDate, reason, details, notes, exitInterview) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [employeeId, lastWorkingDate, reason, details, notes, exitInterview ? 1 : 0],
            function(err) {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }

                // Update employee status to inactive
                db.run(
                    'UPDATE employees SET status = "Inactive" WHERE id = ?',
                    [employeeId],
                    function(err) {
                        if (err) {
                            return res.status(400).json({ message: err.message });
                        }
                        res.status(201).json({ id: this.lastID });
                    }
                );
            }
        );
    });
});

// Bulk attrition upload
router.post('/bulk', (req, res) => {
    if (!req.files || !req.files.attritionFile) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.attritionFile;
    const workbook = xlsx.read(file.data, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);
    const defaultReason = req.body.bulkAttritionReason || 'Resignation';

    const success = [];
    const errors = [];

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        data.forEach((row, index) => {
            try {
                // Validate required fields
                if (!row.employeeId && !row.employeeCode) {
                    throw new Error('Missing employee identifier');
                }
                if (!row.lastWorkingDate) {
                    throw new Error('Missing last working date');
                }

                const employeeId = row.employeeId || 
                    (row.employeeCode ? getEmployeeIdByCode(row.employeeCode) : null);
                const reason = row.reason || defaultReason;

                if (!employeeId) {
                    throw new Error('Employee not found');
                }

                // Insert attrition record
                db.run(
                    `INSERT INTO attritions 
                    (employeeId, lastWorkingDate, reason, details, notes, exitInterview) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        employeeId,
                        row.lastWorkingDate,
                        reason,
                        row.details || '',
                        row.notes || '',
                        row.exitInterview ? 1 : 0
                    ],
                    function(err) {
                        if (err) {
                            throw new Error(err.message);
                        }

                        // Update employee status
                        db.run(
                            'UPDATE employees SET status = "Inactive" WHERE id = ?',
                            [employeeId],
                            function(err) {
                                if (err) {
                                    throw new Error(err.message);
                                }
                                success.push({ employee: row.employeeCode || employeeId, id: this.lastID });
                            }
                        );
                    }
                );
            } catch (error) {
                errors.push({ employee: row.employeeCode || 'Unknown', message: error.message });
            }
        });

        db.run('COMMIT', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error processing bulk attrition' });
            }
            res.json({
                successCount: success.length,
                errorCount: errors.length,
                errors
            });
        });
    });
});

function getEmployeeIdByCode(employeeCode) {
    return new Promise((resolve, reject) => {
        db.get('SELECT id FROM employees WHERE employeeCode = ?', [employeeCode], (err, row) => {
            if (err) reject(err);
            resolve(row ? row.id : null);
        });
    });
}

module.exports = router;
