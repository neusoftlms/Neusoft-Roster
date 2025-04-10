class Employee {
    static getAll() {
        return JSON.parse(localStorage.getItem('employees') || [];
    }

    static getById(id) {
        return this.getAll().find(emp => emp.id == id);
    }

    static create(employee) {
        const employees = this.getAll();
        
        // Generate ID if not provided
        if (!employee.id) {
            const maxId = employees.reduce((max, emp) => Math.max(max, emp.id || 0), 0);
            employee.id = maxId + 1;
        }
        
        // Set timestamps
        employee.createdAt = employee.createdAt || new Date().toISOString();
        employee.updatedAt = new Date().toISOString();
        
        employees.push(employee);
        localStorage.setItem('employees', JSON.stringify(employees));
        return employee;
    }

    static update(id, employeeData) {
        const employees = this.getAll();
        const index = employees.findIndex(emp => emp.id == id);
        
        if (index === -1) {
            return null;
        }
        
        // Preserve original creation date
        employeeData.createdAt = employees[index].createdAt;
        employeeData.updatedAt = new Date().toISOString();
        
        employees[index] = { ...employees[index], ...employeeData };
        localStorage.setItem('employees', JSON.stringify(employees));
        return employees[index];
    }

    static deactivate(id) {
        const employee = this.getById(id);
        if (employee) {
            employee.status = 'Inactive';
            employee.updatedAt = new Date().toISOString();
            this.update(id, employee);
        }
    }

    static bulkCreate(employeeData) {
        const results = {
            successCount: 0,
            errorCount: 0,
            errors: []
        };
        
        const employees = this.getAll();
        const newEmployees = [];
        
        employeeData.forEach((emp, index) => {
            try {
                // Validate required fields
                if (!emp.employeeCode || !emp.employeeName || !emp.position) {
                    throw new Error('Missing required fields');
                }
                
                // Check for duplicate employee code
                if (employees.some(e => e.employeeCode === emp.employeeCode)) {
                    throw new Error('Employee code already exists');
                }
                
                // Set default values
                emp.id = employees.length + newEmployees.length + 1;
                emp.status = 'Active';
                emp.createdAt = new Date().toISOString();
                emp.updatedAt = new Date().toISOString();
                
                newEmployees.push(emp);
                results.successCount++;
            } catch (error) {
                results.errorCount++;
                results.errors.push({
                    row: index + 2, // +2 because Excel rows start at 1 and header is row 1
                    employee: emp.employeeCode || 'Unknown',
                    message: error.message
                });
            }
        });
        
        if (newEmployees.length > 0) {
            localStorage.setItem('employees', JSON.stringify([...employees, ...newEmployees]));
        }
        
        return results;
    }
}
