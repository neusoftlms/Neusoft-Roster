// Main Application Controller
$(document).ready(function() {
    // Initialize DataTables
    const employeesTable = $('#employeesTable').DataTable({
        data: Employee.getAll(),
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
        data: Attrition.getAll(),
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
    function loadActiveEmployees() {
        const dropdown = $('#attritionEmployee');
        dropdown.empty();
        dropdown.append('<option value="">Select Employee</option>');
        
        Employee.getAll().forEach(employee => {
            if (employee.status === 'Active') {
                dropdown.append(`<option value="${employee.id}">${employee.employeeName} (${employee.employeeCode})</option>`);
            }
        });
    }
    loadActiveEmployees();

    // Form submission handlers
    $('#employeeForm').submit(function(e) {
        e.preventDefault();
        const formData = $(this).serializeArray();
        const employee = {};
        formData.forEach(item => {
            employee[item.name] = item.value;
        });

        // Set default status for new employees
        employee.status = 'Active';
        employee.createdAt = new Date().toISOString();
        employee.updatedAt = new Date().toISOString();

        Employee.create(employee);
        employeesTable.ajax.reload();
        loadActiveEmployees();
        $('#newEmployeeModal').modal('hide');
        $(this).trigger('reset');
    });

    $('#attritionForm').submit(function(e) {
        e.preventDefault();
        const formData = $(this).serializeArray();
        const attrition = {};
        formData.forEach(item => {
            attrition[item.name] = item.value;
        });

        attrition.createdAt = new Date().toISOString();
        attrition.exitInterview = $('#exitInterview').is(':checked');

        // Get employee details
        const employee = Employee.getById(attrition.employeeId);
        attrition.employee = employee;

        Attrition.create(attrition);
        attritionTable.ajax.reload();
        employeesTable.ajax.reload();
        loadActiveEmployees();
        $('#newAttritionModal').modal('hide');
        $(this).trigger('reset');
    });

    // Bulk upload handlers
    $('#bulkUploadForm').submit(function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('employeeFile');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const results = Employee.bulkCreate(jsonData);
            displayBulkUploadResults(results);
            employeesTable.ajax.reload();
            loadActiveEmployees();
        };
        reader.readAsArrayBuffer(file);
    });

    $('#bulkAttritionForm').submit(function(e) {
        e.preventDefault();
        const fileInput = document.getElementById('attritionFile');
        const file = fileInput.files[0];
        const defaultReason = $('#bulkAttritionReason').val();
        
        if (!file) {
            alert('Please select a file');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const results = Attrition.bulkCreate(jsonData, defaultReason);
            displayBulkAttritionResults(results);
            attritionTable.ajax.reload();
            employeesTable.ajax.reload();
            loadActiveEmployees();
        };
        reader.readAsArrayBuffer(file);
    });

    function displayBulkUploadResults(results) {
        $('#uploadResults').show();
        $('#successCount').text(results.successCount);
        $('#errorCount').text(results.errorCount);
        
        const errorDetails = $('#errorDetails');
        errorDetails.empty();
        
        if (results.errors && results.errors.length > 0) {
            const table = $('<table class="table table-sm"></table>');
            const thead = $('<thead><tr><th>Row</th><th>Error</th></tr></thead>');
            const tbody = $('<tbody></tbody>');
            
            results.errors.forEach(error => {
                tbody.append(`<tr><td>${error.row}</td><td>${error.message}</td></tr>`);
            });
            
            table.append(thead).append(tbody);
            errorDetails.append(table);
        }
    }

    function displayBulkAttritionResults(results) {
        $('#attritionResults').show();
        $('#attritionSuccessCount').text(results.successCount);
        $('#attritionErrorCount').text(results.errorCount);
        
        const errorDetails = $('#attritionErrorDetails');
        errorDetails.empty();
        
        if (results.errors && results.errors.length > 0) {
            const table = $('<table class="table table-sm"></table>');
            const thead = $('<thead><tr><th>Employee</th><th>Error</th></tr></thead>');
            const tbody = $('<tbody></tbody>');
            
            results.errors.forEach(error => {
                tbody.append(`<tr><td>${error.employee}</td><td>${error.message}</td></tr>`);
            });
            
            table.append(thead).append(tbody);
            errorDetails.append(table);
        }
    }

    // GitHub Sync functionality
    function loadGitHubConfig() {
        const config = JSON.parse(localStorage.getItem('githubConfig') || '{}');
        $('#githubRepo').val(config.repo || '');
        $('#githubBranch').val(config.branch || 'main');
        $('#githubToken').val(config.token || '');
        $('#dataPath').val(config.path || 'data/');
        
        if (localStorage.getItem('lastSync')) {
            $('#githubLastSync').text(`Last sync: ${new Date(localStorage.getItem('lastSync')).toLocaleString()}`);
        }
    }

    function saveGitHubConfig() {
        const config = {
            repo: $('#githubRepo').val(),
            branch: $('#githubBranch').val(),
            token: $('#githubToken').val(),
            path: $('#dataPath').val()
        };
        localStorage.setItem('githubConfig', JSON.stringify(config));
        showGitHubAlert('Configuration saved', 'success');
    }

    function showGitHubAlert(message, type) {
        const alert = $('#githubAlert');
        alert.removeClass('alert-success alert-danger alert-warning')
             .addClass(`alert-${type}`)
             .text(message)
             .show();
        
        setTimeout(() => alert.fadeOut(), 3000);
    }

    $('#saveConfigBtn').click(saveGitHubConfig);

    $('#loadFromGithubBtn').click(function() {
        const config = JSON.parse(localStorage.getItem('githubConfig') || {};
        if (!config.repo || !config.token) {
            showGitHubAlert('Please configure repository and token first', 'danger');
            return;
        }

        const url = `https://api.github.com/repos/${config.repo}/contents/${config.path}employees.json?ref=${config.branch}`;
        
        fetch(url, {
            headers: {
                'Authorization': `token ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.content) {
                const employees = JSON.parse(atob(data.content));
                localStorage.setItem('employees', JSON.stringify(employees));
                
                // Load attritions
                return fetch(`https://api.github.com/repos/${config.repo}/contents/${config.path}attritions.json?ref=${config.branch}`, {
                    headers: {
                        'Authorization': `token ${config.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
            }
            throw new Error('No content found');
        })
        .then(response => response.json())
        .then(data => {
            if (data.content) {
                const attritions = JSON.parse(atob(data.content));
                localStorage.setItem('attritions', JSON.stringify(attritions));
                
                localStorage.setItem('lastSync', new Date().toISOString());
                $('#githubLastSync').text(`Last sync: ${new Date().toLocaleString()}`);
                
                employeesTable.ajax.reload();
                attritionTable.ajax.reload();
                loadActiveEmployees();
                
                showGitHubAlert('Data loaded successfully', 'success');
            }
        })
        .catch(error => {
            console.error('Error loading from GitHub:', error);
            showGitHubAlert('Error loading data: ' + error.message, 'danger');
        });
    });

    $('#saveToGithubBtn').click(function() {
        const config = JSON.parse(localStorage.getItem('githubConfig') || {};
        if (!config.repo || !config.token) {
            showGitHubAlert('Please configure repository and token first', 'danger');
            return;
        }

        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        const attritions = JSON.parse(localStorage.getItem('attritions') || '[]');
        
        // Get SHA of existing files for update
        Promise.all([
            fetch(`https://api.github.com/repos/${config.repo}/contents/${config.path}employees.json?ref=${config.branch}`, {
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }).then(res => res.ok ? res.json() : { sha: null }),
            fetch(`https://api.github.com/repos/${config.repo}/contents/${config.path}attritions.json?ref=${config.branch}`, {
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }).then(res => res.ok ? res.json() : { sha: null })
        ])
        .then(([employeesFile, attritionsFile]) => {
            // Upload employees
            return fetch(`https://api.github.com/repos/${config.repo}/contents/${config.path}employees.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update employee data',
                    content: btoa(JSON.stringify(employees, null, 2)),
                    branch: config.branch,
                    sha: employeesFile.sha
                })
            });
        })
        .then(() => {
            // Upload attritions
            return fetch(`https://api.github.com/repos/${config.repo}/contents/${config.path}attritions.json`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Update attrition data',
                    content: btoa(JSON.stringify(attritions, null, 2)),
                    branch: config.branch,
                    sha: attritionsFile.sha
                })
            });
        })
        .then(() => {
            localStorage.setItem('lastSync', new Date().toISOString());
            $('#githubLastSync').text(`Last sync: ${new Date().toLocaleString()}`);
            showGitHubAlert('Data saved to GitHub successfully', 'success');
        })
        .catch(error => {
            console.error('Error saving to GitHub:', error);
            showGitHubAlert('Error saving data: ' + error.message, 'danger');
        });
    });

    // Initial setup
    loadGitHubConfig();
});
