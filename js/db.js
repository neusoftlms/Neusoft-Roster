const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../employee.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
    db.serialize(() => {
        // Create employees table
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rag TEXT,
            site TEXT,
            employer TEXT,
            contractTitle TEXT,
            lob TEXT,
            subLob TEXT,
            hiredDate TEXT,
            employeeCode TEXT UNIQUE,
            employeeCodePulse TEXT,
            employeeName TEXT,
            lastName TEXT,
            firstName TEXT,
            middleName TEXT,
            gender TEXT,
            position TEXT,
            nationality TEXT,
            nativeLanguage TEXT,
            fluentLanguages TEXT,
            birthdate TEXT,
            leader TEXT,
            wbWorkNumber TEXT,
            wbAccount TEXT,
            xspaceAccount TEXT,
            personalEmail TEXT,
            wbMail TEXT,
            neusoftEmail TEXT,
            supplierEmail TEXT,
            mobileNumber TEXT,
            altMobileNumber TEXT,
            educationalBackground TEXT,
            educationalCourse TEXT,
            bsCourse TEXT,
            graduateLevel TEXT,
            lastSchool TEXT,
            permanentAddress TEXT,
            currentAddress TEXT,
            currentCity TEXT,
            emergencyContact TEXT,
            emergencyRelationship TEXT,
            emergencyNumber TEXT,
            emergencyAddress TEXT,
            vaccinatedTwoDoses TEXT,
            vaccinatedBooster TEXT,
            latestVaccine TEXT,
            source TEXT,
            lastWorkingDay TEXT,
            tenureCategory TEXT,
            tenure TEXT,
            remarks TEXT,
            status TEXT DEFAULT 'Active',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // Create attritions table
        db.run(`CREATE TABLE IF NOT EXISTS attritions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employeeId INTEGER,
            lastWorkingDate TEXT,
            reason TEXT,
            details TEXT,
            notes TEXT,
            exitInterview INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employeeId) REFERENCES employees(id)
        )`);
    });
};

module.exports = {
    db,
    initializeDatabase
};
