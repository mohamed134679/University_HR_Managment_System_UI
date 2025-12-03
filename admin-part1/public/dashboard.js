// Check authentication
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'login.html';
}

// `apiCall` is provided by `results.js` which is loaded before this script.

// View functions
async function viewAllEmployees() {
    const employees = await apiCall('/api/admin/employees');
    displayResults(employees, 'All Employees');
}

async function viewEmployeesPerDept() {
    const data = await apiCall('/api/admin/employees-per-dept');
    displayResults(data, 'Employees Per Department');
}

async function viewRejectedMedicalLeaves() {
    const data = await apiCall('/api/admin/rejected-medical-leaves');
    displayResults(data, 'Rejected Medical Leaves');
}

// Action functions
async function initiateAttendance() {
    const result = await apiCall('/api/admin/initiate-attendance', { method: 'POST' });
    alert('✅ ' + result.message);
}

async function removeResignedDeductions() {
    const result = await apiCall('/api/admin/remove-resigned-deductions', { method: 'POST' });
    alert('✅ ' + result.message);
}

// Form handlers
document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await apiCall('/api/admin/update-attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            employeeId: document.getElementById('empId').value,
            checkIn: document.getElementById('checkIn').value,
            checkOut: document.getElementById('checkOut').value
        })
    });
    alert('✅ ' + result.message);
    e.target.reset();
});

document.getElementById('holidayForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const result = await apiCall('/api/admin/add-holiday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            holidayName: document.getElementById('holidayName').value,
            fromDate: document.getElementById('fromDate').value,
            toDate: document.getElementById('toDate').value
        })
    });
    alert('✅ ' + result.message);
    e.target.reset();
});

// `displayResults` (and `apiCall`) are defined in the shared `results.js` file.