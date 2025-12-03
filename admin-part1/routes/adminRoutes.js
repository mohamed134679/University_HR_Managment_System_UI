


// 2. Get All Employees
app.get('/employees', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM allEmployeeProfiles');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Employees Per Department
app.get('/employees-per-dept', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM NoEmployeeDept');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Rejected Medical Leaves
app.get('/rejected-medical-leaves', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM allRejectedMedicals');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check - verify DB connection and basic query

// 5. Remove Resigned Employee Deductions
app.post('/remove-resigned-deductions', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().query('EXEC Remove_Deductions');
        res.json({ message: "Deductions for resigned employees removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Update Attendance
app.post('/update-attendance', async (req, res) => {
    const { employeeId, checkIn, checkOut } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('Employee_id', sql.Int, employeeId)
            .input('check_in_time', sql.Time, checkIn)
            .input('check_out_time', sql.Time, checkOut)
            .query('EXEC Update_Attendance @Employee_id, @check_in_time, @check_out_time');
        res.json({ message: "Attendance updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Add Holiday
app.post('/add-holiday', async (req, res) => {
    const { holidayName, fromDate, toDate } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('holiday_name', sql.VarChar(50), holidayName)
            .input('from_date', sql.Date, fromDate)
            .input('to_date', sql.Date, toDate)
            .query('EXEC Add_Holiday @holiday_name, @from_date, @to_date');
        res.json({ message: "Holiday added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Initiate Attendance
app.post('/initiate-attendance', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request().query('EXEC Initiate_Attendance');
        res.json({ message: "Attendance initiated for all employees" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;