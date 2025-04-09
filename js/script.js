$(document).ready(function() {
    // Initialize DataTables
    const employeesTable = $('#employeesTable').DataTable({
        ajax: {
            url: '/api/employees',
            dataSrc: ''
        },
        columns: [
            { data: 'employeeCode' },
            { data: 'employeeName' },
            { data: 'position' },
            { data: 'lob' },
            { 
                data: 'hiredDate',
                render: function(data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            { 
                data: 'status',
                render: function(data) {
                    return data === 'Active' 
                        ? '<span class="badge bg-success">Active</span>' 
                        : '<span class="badge bg-danger">Inactive</span>';
                }
            },
            {
                data: null,
                render: function(data) {
                    return `
                        <button class="btn btn-sm btn-outline-primary view-employee" data-id="${data.id}">
                            <i class="bi bi-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-outline-warning edit-employee" data-id="${data.id}">
                            <i class="bi bi-pencil"></i> Edit
                        </button>
                    `;
                }
            }
        ]
    });

    const attritionTable = $('#attritionTable').DataTable({
        ajax: {
            url: '/api/attritions',
            dataSrc: ''
        },
        columns: [
            { 
                data: 'employee',
                render: function(data) {
                    return data.employeeName;
                }
            },
            { 
                data: 'lastWorkingDate',
                render: function(data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            { data: 'reason' },
            { data: 'details' },
            { 
                data: 'createdAt',
                render: function(data) {
                    return new Date(data).toLocaleDateString();
                }
            },
            {
                data: null,
                render: function(data) {
                    return `
                        <button class="btn btn-sm btn-outline-primary view-attrition" data-id="${data.id}">
                            <i class="bi bi-eye"></i> View
                        </button>
                    `;
                }
            }
        ]
    });

    // Load employees for attrition dropdown
    $.get('/api/employees', function(data) {
        const dropdown = $('#attritionEmployee');
        dropdown.empty();
        dropdown.append('<option value="">Select Employee</option>');
        data.forEach(employee => {
            if (employee.status === 'Active') {
                dropdown.append(`<option value="${employee.id}">${employee.employeeName} (${employee.employeeCode})</option>`);
            }
        });
    });

    // Form submission handlers
    $('#employeeForm').submit(function(e) {
        e.preventDefault();
        const formData = $(this).serializeArray();
        const data = {};
        formData.forEach(item => {
            data[item.name] = item.value;
        });

        $.ajax({
            url: '/api/employees',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                alert('Employee saved successfully');
                $('#newEmployeeModal').modal('hide');
                employeesTable.ajax.reload();
                $('#employeeForm')[0].reset();
            },
            error: function(xhr) {
                alert('Error saving employee: ' + xhr.responseJSON.message);
            }
        });
    });

    $('#attritionForm').submit(function(e) {
        e.preventDefault();
        const formData = $(this).serializeArray();
        const data = {};
        formData.forEach(item => {
            data[item.name] = item.value;
        });

        $.ajax({
            url: '/api/attritions',
            method: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(response) {
                alert('Attrition recorded successfully');
                $('#newAttritionModal').modal('hide');
                attritionTable.ajax.reload();
                employeesTable.ajax.reload();
                $('#attritionForm')[0].reset();
            },
            error: function(xhr) {
                alert('Error recording attrition: ' + xhr.responseJSON.message);
            }
        });
    });

    // Bulk upload handlers
    $('#bulkUploadForm').submit(function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        $.ajax({
            url: '/api/employees/bulk',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                $('#uploadResults').show();
                $('#successCount').text(response.successCount);
                $('#errorCount').text(response.errorCount);
                
                const errorDetails = $('#errorDetails');
                errorDetails.empty();
                
                if (response.errors && response.errors.length > 0) {
                    const table = $('<table class="table table-sm"></table>');
                    const thead = $('<thead><tr><th>Row</th><th>Error</th></tr></thead>');
                    const tbody = $('<tbody></tbody>');
                    
                    response.errors.forEach(error => {
                        tbody.append(`<tr><td>${error.row}</td><td>${error.message}</td></tr>`);
                    });
                    
                    table.append(thead).append(tbody);
                    errorDetails.append(table);
                }
                
                employeesTable.ajax.reload();
            },
            error: function(xhr) {
                alert('Error processing bulk upload: ' + xhr.responseJSON.message);
            }
        });
    });

    $('#bulkAttritionForm').submit(function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        
        $.ajax({
            url: '/api/attritions/bulk',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                $('#attritionResults').show();
                $('#attritionSuccessCount').text(response.successCount);
                $('#attritionErrorCount').text(response.errorCount);
                
                const errorDetails = $('#attritionErrorDetails');
                errorDetails.empty();
                
                if (response.errors && response.errors.length > 0) {
                    const table = $('<table class="table table-sm"></table>');
                    const thead = $('<thead><tr><th>Employee</th><th>Error</th></tr></thead>');
                    const tbody = $('<tbody></tbody>');
                    
                    response.errors.forEach(error => {
                        tbody.append(`<tr><td>${error.employee}</td><td>${error.message}</td></tr>`);
                    });
                    
                    table.append(thead).append(tbody);
                    errorDetails.append(table);
                }
                
                attritionTable.ajax.reload();
                employeesTable.ajax.reload();
            },
            error: function(xhr) {
                alert('Error processing bulk attrition: ' + xhr.responseJSON.message);
            }
        });
    });

    // View/edit employee handlers
    $('#employeesTable').on('click', '.view-employee', function() {
        const employeeId = $(this).data('id');
        // Implement view functionality
        alert('View employee ' + employeeId);
    });

    $('#employeesTable').on('click', '.edit-employee', function() {
        const employeeId = $(this).data('id');
        // Implement edit functionality
        alert('Edit employee ' + employeeId);
    });

    $('#attritionTable').on('click', '.view-attrition', function() {
        const attritionId = $(this).data('id');
        // Implement view functionality
        alert('View attrition ' + attritionId);
    });
});
