const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const db = require('./database/db');
const employeeRoutes = require('./routes/employees');
const attritionRoutes = require('./routes/attritions');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/attritions', attritionRoutes);

// Serve template files
app.get('/templates/employee_template.xlsx', (req, res) => {
    res.sendFile(path.join(__dirname, '../../templates/employee_template.xlsx'));
});

app.get('/templates/attrition_template.xlsx', (req, res) => {
    res.sendFile(path.join(__dirname, '../../templates/attrition_template.xlsx'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    db.initializeDatabase();
});
