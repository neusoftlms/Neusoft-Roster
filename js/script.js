// Check if there are any employees stored in localStorage
if (!localStorage.getItem("employees")) {
    localStorage.setItem("employees", JSON.stringify([]));
}

// Function to load employee data from localStorage and display
function loadEmployees() {
    const employees = JSON.parse(localStorage.getItem("employees"));
    const employeeList = document.getElementById("employee-list").getElementsByTagName("tbody")[0];
    employeeList.innerHTML = ""; // Clear current employee list

    employees.forEach((employee, index) => {
        const row = employeeList.insertRow();
        row.insertCell(0).textContent = employee.name;
        row.insertCell(1).textContent = employee.code;
        row.insertCell(2).textContent = employee.hireDate;
        row.insertCell(3).textContent = employee.position;
        row.insertCell(4).textContent = employee.gender;
        row.insertCell(5).textContent = employee.email;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete");
        deleteButton.onclick = () => deleteEmployee(index);
        row.insertCell(6).appendChild(deleteButton);
    });
}

// Handle employee form submission
document.getElementById("employee-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("employee-name").value;
    const code = document.getElementById("employee-code").value;
    const hireDate = document.getElementById("hire-date").value;
    const position = document.getElementById("position").value;
    const gender = document.getElementById("gender").value;
    const email = document.getElementById("email").value;

    const employee = {
        name,
        code,
        hireDate,
        position,
        gender,
        email
    };

    // Get current employees
    const employees = JSON.parse(localStorage.getItem("employees"));

    // Add the new employee to the list
    employees.push(employee);

    // Save back to localStorage
    localStorage.setItem("employees", JSON.stringify(employees));

    // Reset form and reload employees
    document.getElementById("employee-form").reset();
    loadEmployees();
});

// Delete employee from localStorage
function deleteEmployee(index) {
    const employees = JSON.parse(localStorage.getItem("employees"));
    employees.splice(index, 1); // Remove employee at given index
    localStorage.setItem("employees", JSON.stringify(employees));
    loadEmployees();
}

// Initial load of employee data
loadEmployees();
