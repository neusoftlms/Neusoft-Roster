const express = require('express');
const router = express.Router();
const { db } = require('../database/db');
const xlsx = require('xlsx');
const fs = require('fs');

// Get all employees
router.get('/', (req, res) => {
    db.all('SELECT * FROM employees', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
});

// Get single employee
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(row);
    });
});

// Create new employee
router.post('/', (req, res) => {
    const employee = req.body;
    const fields = Object.keys(employee);
    const values = Object.values(employee);
    const placeholders = fields.map(() => '?').join(',');

    const sql = `INSERT INTO employees (${fields.join(',')}) VALUES (${placeholders})`;
    
    db.run(sql, values, function(err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Bulk upload employees
router.post('/bulk', (req, res) => {
    if (!req.files || !req.files.employeeFile) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const file = req.files.employeeFile;
    const workbook = xlsx.read(file.data, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const success = [];
    const errors = [];

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        data.forEach((row, index) => {
            try {
                // Validate required fields
                if (!row.employeeCode || !row.employeeName || !row.position) {
                    throw new Error('Missing required fields');
                }

                // Insert employee
                const fields = Object.keys(row);
                const values = Object.values(row);
                const placeholders = fields.map(() => '?').join(',');
                const sql = `INSERT INTO employees (${fields.join(',')}) VALUES (${placeholders})`;

                db.run(sql, values, function(err) {
                    if (err) {
                        throw new Error(err.message);
                    }
                    success.push({ row: index + 2, id: this.lastID });
                });
            } catch (error) {
                errors.push({ row: index + 2, message: error.message });
            }
        });

        db.run('COMMIT', (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error processing bulk upload' });
            }
            res.json({
                successCount: success.length,
                errorCount: errors.length,
                errors
            });
        });
    });
});

module.exports = router;
