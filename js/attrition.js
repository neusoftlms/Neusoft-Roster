class Attrition {
    static getAll() {
        const attritions = JSON.parse(localStorage.getItem('attritions') || '[]');
        // Join with employee data
        return attritions.map(attrition => {
            return {
                ...attrition,
                employee: Employee.getById(attrition.employeeId)
            };
        });
    }

    static create(attrition) {
        const attritions = this.getAll();
        
        // Generate ID if not provided
        if (!attrition.id) {
            const maxId = attritions.reduce((max, att) => Math.max(max, att.id || 0), 0);
            attrition.id = maxId + 1;
        }
        
        // Set timestamp
        attrition.createdAt = new Date().toISOString();
        
        // Deactivate the employee
        Employee.deactivate(attrition.employeeId);
        
        // Remove employee details before saving
        const { employee, ...attritionToSave } = attrition;
        attritions.push(attritionToSave);
        
        localStorage.setItem('attritions', JSON.stringify(attritions));
        return attrition;
    }

    static bulkCreate(attritionData, defaultReason) {
        const results = {
            successCount: 0,
            errorCount: 0,
            errors: []
        };
        
        const attritions = JSON.parse(localStorage.getItem('attritions') || '[]');
        const newAttritions = [];
        
        attritionData.forEach((attrition, index) => {
            try {
                // Validate required fields
                if (!attrition.employeeId && !attrition.employeeCode) {
                    throw new Error('Missing employee identifier');
                }
                
                if (!attrition.lastWorkingDate) {
                    throw new Error('Missing last working date');
                }
                
                // Find employee
                let employee;
                if (attrition.employeeId) {
                    employee = Employee.getById(attrition.employeeId);
                } else {
                    const employees = Employee.getAll();
                    employee = employees.find(e => e.employeeCode === attrition.employeeCode);
                }
                
                if (!employee) {
                    throw new Error('Employee not found');
                }
                
                // Create attrition record
                const newAttrition = {
                    id: attritions.length + newAttritions.length + 1,
                    employeeId: employee.id,
                    lastWorkingDate: attrition.lastWorkingDate,
                    reason: attrition.reason || defaultReason,
                    details: attrition.details || '',
                    notes: attrition.notes || '',
                    exitInterview: attrition.exitInterview || false,
                    createdAt: new Date().toISOString()
                };
                
                // Deactivate the employee
                Employee.deactivate(employee.id);
                
                newAttritions.push(newAttrition);
                results.successCount++;
            } catch (error) {
                results.errorCount++;
                results.errors.push({
                    row: index + 2, // +2 because Excel rows start at 1 and header is row 1
                    employee: attrition.employeeCode || attrition.employeeId || 'Unknown',
                    message: error.message
                });
            }
        });
        
        if (newAttritions.length > 0) {
            localStorage.setItem('attritions', JSON.stringify([...attritions, ...newAttritions]));
        }
        
        return results;
    }
}
