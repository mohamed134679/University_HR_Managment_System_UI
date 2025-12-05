import express from "express";
import cors from "cors";
import * as db from "./db.js";

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
  credentials: true
}));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the backend server!" });
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    await db.connectDB();
    res.json({ success: true, message: "✅ Database connected successfully!" });
  } catch (error) {
    console.error("DB Connection Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// HR Login endpoint
app.post("/api/login/hr", async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    console.log("HR Login attempt:", { employeeId });

    if (!employeeId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Employee ID and password are required" 
      });
    }

    const connection = await db.connectDB();
    console.log("Database connected");
    
    // Use HRLoginValidation function
    const result = await connection.request()
      .input('employee_ID', employeeId)
      .input('password', password)
      .query(`SELECT dbo.HRLoginValidation(@employee_ID, @password) as isValid`);

    console.log("HR Validation result:", result.recordset);

    if (!result.recordset || result.recordset[0].isValid === false) {
      console.log("Invalid HR credentials");
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // Fetch user details
    const userResult = await connection.request()
      .input('employee_ID', employeeId)
      .query(`
        SELECT 
          employee_id, 
          first_name, 
          last_name, 
          email, 
          dept_name,
          employment_status
        FROM Employee 
        WHERE employee_id = @employee_ID AND dept_name = 'HR'
      `);

    if (!userResult.recordset || userResult.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    const user = userResult.recordset[0];
    console.log("HR User found:", user);

    res.json({ 
      success: true, 
      message: "Login successful",
      userType: "hr",
      user: {
        id: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        department: user.dept_name,
        status: user.employment_status
      }
    });

  } catch (error) {
    console.error("HR Login Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Academic Employee Login endpoint
app.post("/api/login/academic", async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    console.log("Academic Login attempt:", { employeeId });

    if (!employeeId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Employee ID and password are required" 
      });
    }

    const connection = await db.connectDB();
    console.log("Database connected");
    
    // Use EmployeeLoginValidation function (excludes HR)
    const result = await connection.request()
      .input('employee_ID', employeeId)
      .input('password', password)
      .query(`SELECT dbo.EmployeeLoginValidation(@employee_ID, @password) as isValid`);

    console.log("Academic Validation result:", result.recordset);

    if (!result.recordset || result.recordset[0].isValid === false) {
      console.log("Invalid academic credentials");
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // Fetch user details
    const userResult = await connection.request()
      .input('employee_ID', employeeId)
      .query(`
        SELECT 
          employee_id, 
          first_name, 
          last_name, 
          email, 
          dept_name,
          employment_status
        FROM Employee 
        WHERE employee_id = @employee_ID AND dept_name != 'HR'
      `);

    if (!userResult.recordset || userResult.recordset.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    const user = userResult.recordset[0];
    console.log("Academic User found:", user);

    res.json({ 
      success: true, 
      message: "Login successful",
      userType: "academic",
      user: {
        id: user.employee_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        department: user.dept_name,
        status: user.employment_status
      }
    });

  } catch (error) {
    console.error("Academic Login Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Admin Login endpoint
app.post("/api/login/admin", async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    console.log("Admin Login attempt:", { employeeId });

    if (!employeeId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Employee ID and password are required" 
      });
    }

    // Hardcoded admin credentials
    const ADMIN_ID = "admin";
    const ADMIN_PASSWORD = "admin123";

    // Check hardcoded credentials
    if (employeeId !== ADMIN_ID || password !== ADMIN_PASSWORD) {
      console.log("Invalid admin credentials");
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    console.log("Admin login successful");

    res.json({ 
      success: true, 
      message: "Login successful",
      userType: "admin",
      user: {
        id: 0,
        firstName: "Admin",
        lastName: "User",
        email: "admin@guc.edu.eg",
        department: "Administration",
        status: "active"
      }
    });

  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// HR OPERATIONS ENDPOINTS
// ============================================

// Approve or reject annual/accidental leave
app.post("/api/hr/leaves/annual-accidental/approve", async (req, res) => {
  try {
    const { requestId, hrId } = req.body;

    if (!requestId || !hrId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const connection = await db.connectDB();

    // Check if request exists in Annual_Leave or Accidental_Leave
    const leaveCheck = await connection.request()
      .input('request_ID', parseInt(requestId))
      .query(`
        SELECT 1 FROM Annual_Leave WHERE request_ID = @request_ID
        UNION
        SELECT 1 FROM Accidental_Leave WHERE request_ID = @request_ID
      `);

    if (!leaveCheck.recordset || leaveCheck.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Request ID not found in annual or accidental leaves" 
      });
    }

    // Check if this HR is assigned to approve this leave
    const assignmentCheck = await connection.request()
      .input('request_ID', parseInt(requestId))
      .input('HR_ID', parseInt(hrId))
      .query(`
        SELECT 1 FROM Employee_Approve_Leave 
        WHERE leave_ID = @request_ID AND Emp1_ID = @HR_ID
      `);

    if (!assignmentCheck.recordset || assignmentCheck.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: "This leave request is not assigned to you" 
      });
    }

    await connection.request()
      .input('request_ID', parseInt(requestId))
      .input('HR_ID', parseInt(hrId))
      .execute('HR_approval_an_acc');

    res.json({
      success: true,
      message: "Annual/Accidental leave processed successfully"
    });

  } catch (error) {
    console.error("Error processing annual/accidental leave:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve or reject unpaid leave
app.post("/api/hr/leaves/unpaid/approve", async (req, res) => {
  try {
    const { requestId, hrId } = req.body;

    if (!requestId || !hrId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const connection = await db.connectDB();

    // Check if request exists in Unpaid_Leave
    const leaveCheck = await connection.request()
      .input('request_ID', parseInt(requestId))
      .query(`SELECT 1 FROM Unpaid_Leave WHERE request_ID = @request_ID`);

    if (!leaveCheck.recordset || leaveCheck.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Request ID not found in unpaid leaves" 
      });
    }

    // Check if this HR is assigned to approve this leave
    const assignmentCheck = await connection.request()
      .input('request_ID', parseInt(requestId))
      .input('HR_ID', parseInt(hrId))
      .query(`
        SELECT 1 FROM Employee_Approve_Leave 
        WHERE leave_ID = @request_ID AND Emp1_ID = @HR_ID
      `);

    if (!assignmentCheck.recordset || assignmentCheck.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: "This leave request is not assigned to you" 
      });
    }

    await connection.request()
      .input('request_ID', parseInt(requestId))
      .input('HR_ID', parseInt(hrId))
      .execute('HR_approval_unpaid');

    res.json({
      success: true,
      message: "Unpaid leave processed successfully"
    });

  } catch (error) {
    console.error("Error processing unpaid leave:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve or reject compensation leave
app.post("/api/hr/leaves/compensation/approve", async (req, res) => {
  try {
    const { requestId, hrId } = req.body;

    if (!requestId || !hrId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const connection = await db.connectDB();

    // Check if request exists in Compensation_Leave
    const leaveCheck = await connection.request()
      .input('request_ID', parseInt(requestId))
      .query(`SELECT 1 FROM Compensation_Leave WHERE request_ID = @request_ID`);

    if (!leaveCheck.recordset || leaveCheck.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Request ID not found in compensation leaves" 
      });
    }

    // Check if this HR is assigned to approve this leave
    const assignmentCheck = await connection.request()
      .input('request_ID', parseInt(requestId))
      .input('HR_ID', parseInt(hrId))
      .query(`
        SELECT 1 FROM Employee_Approve_Leave 
        WHERE leave_ID = @request_ID AND Emp1_ID = @HR_ID
      `);

    if (!assignmentCheck.recordset || assignmentCheck.recordset.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: "This leave request is not assigned to you" 
      });
    }

    await connection.request()
      .input('request_ID', parseInt(requestId))
      .input('HR_ID', parseInt(hrId))
      .execute('HR_approval_comp');

    res.json({
      success: true,
      message: "Compensation leave processed successfully"
    });

  } catch (error) {
    console.error("Error processing compensation leave:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add missing hours deduction
app.post("/api/hr/deductions/missing-hours", async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, error: "Employee ID is required" });
    }

    const connection = await db.connectDB();

    // Check if deduction already exists for today
    const existingDeduction = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT 1 
        FROM Deduction 
        WHERE emp_ID = @employee_ID 
        AND type = 'missing_hours'
        AND CAST(date AS DATE) = CAST(GETDATE() AS DATE)
      `);

    if (existingDeduction.recordset && existingDeduction.recordset.length > 0) {
      return res.json({
        success: true,
        message: "Deduction for missing hours already exists for today"
      });
    }

    // Get current deduction count for this employee in current month
    const beforeCount = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT COUNT(*) as count 
        FROM Deduction 
        WHERE emp_ID = @employee_ID 
        AND MONTH(date) = MONTH(GETDATE())
        AND YEAR(date) = YEAR(GETDATE())
      `);

    console.log('Before count:', beforeCount.recordset[0].count);

    // Call stored procedure
    await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .execute('Deduction_hours');

    // Check if deduction was added
    const afterCount = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT COUNT(*) as count 
        FROM Deduction 
        WHERE emp_ID = @employee_ID 
        AND MONTH(date) = MONTH(GETDATE())
        AND YEAR(date) = YEAR(GETDATE())
      `);

    console.log('After count:', afterCount.recordset[0].count);

    // Also check all deductions for this employee
    const allDeductions = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT deduction_ID, emp_ID, date, amount, type, status
        FROM Deduction 
        WHERE emp_ID = @employee_ID
        ORDER BY date DESC
      `);

    console.log('All deductions for employee', employeeId, ':', allDeductions.recordset);

    const deductionApplied = afterCount.recordset[0].count > beforeCount.recordset[0].count;

    res.json({
      success: true,
      message: deductionApplied 
        ? "Deduction applied successfully" 
        : "No missing hours found for this employee"
    });

  } catch (error) {
    console.error("Error processing missing hours deduction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add missing days deduction
app.post("/api/hr/deductions/missing-days", async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, error: "Employee ID is required" });
    }

    const connection = await db.connectDB();

    // Check if deduction already exists for today
    const existingDeduction = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT 1 
        FROM Deduction 
        WHERE emp_ID = @employee_ID 
        AND type = 'missing_days'
        AND CAST(date AS DATE) = CAST(GETDATE() AS DATE)
      `);

    if (existingDeduction.recordset && existingDeduction.recordset.length > 0) {
      return res.json({
        success: true,
        message: "Deduction for missing days already exists for today"
      });
    }

    // Get current deduction count for this employee in current month
    const beforeCount = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT COUNT(*) as count 
        FROM Deduction 
        WHERE emp_ID = @employee_ID 
        AND MONTH(date) = MONTH(GETDATE())
        AND YEAR(date) = YEAR(GETDATE())
      `);

    console.log('Before count (missing days):', beforeCount.recordset[0].count);

    // Call stored procedure
    await connection.request()
      .input('employee_id', parseInt(employeeId))
      .execute('Deduction_days');

    // Check if deduction was added
    const afterCount = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT COUNT(*) as count 
        FROM Deduction 
        WHERE emp_ID = @employee_ID 
        AND MONTH(date) = MONTH(GETDATE())
        AND YEAR(date) = YEAR(GETDATE())
      `);

    console.log('After count (missing days):', afterCount.recordset[0].count);

    // Also check all deductions for this employee
    const allDeductions = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT deduction_ID, emp_ID, date, amount, type, status
        FROM Deduction 
        WHERE emp_ID = @employee_ID
        ORDER BY date DESC
      `);

    console.log('All deductions for employee', employeeId, ':', allDeductions.recordset);

    const deductionApplied = afterCount.recordset[0].count > beforeCount.recordset[0].count;

    res.json({
      success: true,
      message: deductionApplied 
        ? "Deduction applied successfully" 
        : "No missing days found for this employee"
    });

  } catch (error) {
    console.error("Error processing missing days deduction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate monthly payroll
app.post("/api/hr/payroll/generate", async (req, res) => {
  try {
    const { employeeId, fromDate, toDate } = req.body;

    if (!employeeId || !fromDate || !toDate) {
      return res.status(400).json({ success: false, error: "Employee ID, from date, and to date are required" });
    }

    const connection = await db.connectDB();

    // Check if payroll already exists for this employee in this period
    const existingPayroll = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .input('from_date', fromDate)
      .input('to_date', toDate)
      .query(`
        SELECT 1 
        FROM Payroll 
        WHERE emp_ID = @employee_ID 
        AND from_date = @from_date 
        AND to_date = @to_date
      `);

    if (existingPayroll.recordset && existingPayroll.recordset.length > 0) {
      return res.json({
        success: true,
        message: "Payroll for this employee in that period already exists"
      });
    }

    // Call Add_Payroll stored procedure
    await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .input('from', fromDate)
      .input('to', toDate)
      .execute('Add_Payroll');

    // Get the payroll record that was just added
    const payrollResult = await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .query(`
        SELECT TOP 1 
          P.ID,
          P.payment_date,
          P.final_salary_amount,
          P.from_date,
          P.to_date,
          P.comments,
          P.bonus_amount,
          P.deductions_amount,
          P.emp_ID,
          E.first_name,
          E.last_name,
          E.salary as base_salary
        FROM Payroll P
        INNER JOIN Employee E ON P.emp_ID = E.employee_ID
        WHERE P.emp_ID = @employee_ID
        ORDER BY P.payment_date DESC
      `);

    if (!payrollResult.recordset || payrollResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Payroll record not found" });
    }

    const payroll = payrollResult.recordset[0];

    res.json({
      success: true,
      message: "Payroll added successfully",
      payroll: {
        payrollId: payroll.ID,
        employeeId: payroll.emp_ID,
        employeeName: `${payroll.first_name} ${payroll.last_name}`,
        baseSalary: payroll.base_salary,
        bonusAmount: payroll.bonus_amount,
        deductionsAmount: payroll.deductions_amount,
        finalSalary: payroll.final_salary_amount,
        fromDate: payroll.from_date,
        toDate: payroll.to_date,
        paymentDate: payroll.payment_date,
        comments: payroll.comments
      }
    });

  } catch (error) {
    console.error("Error generating payroll:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ADMIN OPERATIONS ENDPOINTS
// ============================================

// 2. Get All Employees
app.get('/api/admin/employees', async (req, res) => {
    try {
        const connection = await db.connectDB();
        const result = await connection.request().query('SELECT * FROM allEmployeeProfiles');
        res.json({ employees: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Employees Per Department
app.get('/api/admin/departments', async (req, res) => {
    try {
        const connection = await db.connectDB();
        const result = await connection.request().query('SELECT * FROM NoEmployeeDept');
        res.json({ departments: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Rejected Medical Leaves
app.get('/api/admin/rejected-medicals', async (req, res) => {
    try {
        const connection = await db.connectDB();
        const result = await connection.request().query('SELECT * FROM allRejectedMedicals');
        res.json({ rejectedRequests: result.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Remove Resigned Employee Deductions
app.delete('/api/admin/remove-resigned-deductions', async (req, res) => {
    try {
        const connection = await db.connectDB();
        await connection.request().query('EXEC Remove_Deductions');
        res.json({ success: true, message: "Deductions for resigned employees removed successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. Update Attendance
app.post('/api/admin/update-attendance', async (req, res) => {
    const { employeeId, checkIn, checkOut } = req.body;
    try {
        if (!employeeId) {
            return res.status(400).json({ success: false, error: "Employee ID is required" });
        }

        // Validate: either both checkIn and checkOut are provided, or neither
        const hasCheckIn = checkIn && checkIn.trim() !== '';
        const hasCheckOut = checkOut && checkOut.trim() !== '';
        
        if (hasCheckIn !== hasCheckOut) {
            return res.status(400).json({ 
                success: false, 
                error: "Both check-in and check-out times must be provided together, or leave both empty to mark absent" 
            });
        }

        const connection = await db.connectDB();
        const sql = await import('mssql');
        
        // Format times as HH:MM:SS if they're in HH:MM format
        const formatTime = (time) => {
            if (!time || time.trim() === '') return null;
            if (time.length === 5) { // HH:MM format
                return `${time}:00`; // Convert to HH:MM:SS
            }
            return time;
        };

        const formattedCheckIn = formatTime(checkIn);
        const formattedCheckOut = formatTime(checkOut);

        await connection.request()
            .input('Employee_id',parseInt(employeeId))
            .input('check_in_time', formattedCheckIn)
            .input('check_out_time', formattedCheckOut)
            .execute('Update_Attendance');
        
        const message = formattedCheckIn && formattedCheckOut 
            ? "Attendance updated successfully" 
            : "Employee marked as absent successfully";
        res.json({ success: true, message });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 7. Add Holiday
app.post('/api/admin/add-holiday', async (req, res) => {
    const { holidayName, fromDate, toDate } = req.body;
    try {
        // Validate that fromDate is not after toDate
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        if (from > to) {
            return res.status(400).json({ 
                success: false, 
                error: "From date can't be after the to date" 
            });
        }

        const connection = await db.connectDB();
        const sql = await import('mssql');
        
        // First, ensure the Holiday table exists by running Create_Holiday
        await connection.request().execute('Create_Holiday');
        
        // Then add the holiday
        await connection.request()
            .input('holiday_name', sql.default.VarChar(50), holidayName)
            .input('from_date', sql.default.Date, fromDate)
            .input('to_date', sql.default.Date, toDate)
            .execute('Add_Holiday');
        res.json({ success: true, message: "Holiday added successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 8. Initiate Attendance
app.post('/api/admin/initiate-attendance', async (req, res) => {
    try {
        const connection = await db.connectDB();
        await connection.request().execute('Initiate_Attendance');
        res.json({ success: true, message: "Attendance initiated for all employees" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ===================== Admin Part 2 =====================
// 1. Get attendance records for all employees for yesterday
app.get('/api/admin/attendance-yesterday', async (req, res) => {
  try {
      const connection = await db.connectDB();
      const result = await connection.request().query('SELECT * FROM allEmployeeAttendance');
      res.json({
          success: true,
          message: "Fetched yesterday's attendance records successfully",
          count: result.recordset.length,
          data: result.recordset
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});


// 2. Get performance details for all employees in all Winter semesters
app.get('/api/admin/performance-winter', async (req, res) => {
  try {
      const connection = await db.connectDB();
      const result = await connection.request().query('SELECT * FROM allPerformance');
      res.json({
          success: true,
          message: "Fetched Winter performance records successfully",
          count: result.recordset.length,
          data: result.recordset
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});


// 3. Remove attendance records for all employees during official holidays
app.delete('/api/admin/remove-holiday-attendance', async (req, res) => {
  try {
      const connection = await db.connectDB();
      await connection.request().execute('Create_Holiday');
      
      // Check how many records exist before deletion
      const beforeCount = await connection.request().query(`
        SELECT COUNT(*) as count 
        FROM Attendance a
        WHERE EXISTS (
          SELECT 1 FROM Holiday h
          WHERE a.date BETWEEN h.from_date AND h.to_date
        )
      `);
      
      await connection.request().query('EXEC Remove_Holiday');
      
      // Check how many records exist after deletion
      const afterCount = await connection.request().query(`
        SELECT COUNT(*) as count 
        FROM Attendance a
        WHERE EXISTS (
          SELECT 1 FROM Holiday h
          WHERE a.date BETWEEN h.from_date AND h.to_date
        )
      `);
      
      const removedCount = beforeCount.recordset[0].count - afterCount.recordset[0].count;
      
      if (removedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "No attendance records found during official holidays"
        });
      }
      
      res.json({
          success: true,
          message: `${removedCount} attendance record(s) during official holidays removed successfully`
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Remove unattended dayoff for an employee in the current month
app.delete('/api/admin/remove-dayoff', async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
      return res.status(400).json({
          success: false,
          error: "Employee ID is required"
      });
  }

  try {
      const connection = await db.connectDB();
      const sql = await import('mssql');
      
      // Check if employee exists
      const employeeCheck = await connection.request()
          .input('employee_ID', sql.default.Int, parseInt(employeeId))
          .query('SELECT 1 FROM Employee WHERE employee_ID = @employee_ID');
      
      if (!employeeCheck.recordset || employeeCheck.recordset.length === 0) {
          return res.status(404).json({
              success: false,
              error: `Employee ${employeeId} not found`
          });
      }
      
      // Check how many unattended dayoff records exist before deletion
      const beforeCount = await connection.request()
          .input('employee_ID', sql.default.Int, parseInt(employeeId))
          .query(`
            SELECT COUNT(*) as count 
            FROM Attendance a
            JOIN Employee e ON a.emp_ID = e.employee_ID
            WHERE a.emp_ID = @employee_ID
            AND MONTH(a.date) = MONTH(GETDATE())
            AND YEAR(a.date) = YEAR(GETDATE())
            AND UPPER(DATENAME(WEEKDAY, a.[date])) = UPPER(e.official_day_off)
            AND a.status = 'Absent'
          `);

      await connection.request()
          .input('Employee_id', sql.default.Int, parseInt(employeeId))
          .execute('Remove_DayOff');
      
      // Check how many records exist after deletion
      const afterCount = await connection.request()
          .input('employee_ID', sql.default.Int, parseInt(employeeId))
          .query(`
            SELECT COUNT(*) as count 
            FROM Attendance a
            JOIN Employee e ON a.emp_ID = e.employee_ID
            WHERE a.emp_ID = @employee_ID
            AND MONTH(a.date) = MONTH(GETDATE())
            AND YEAR(a.date) = YEAR(GETDATE())
            AND UPPER(DATENAME(WEEKDAY, a.[date])) = UPPER(e.official_day_off)
            AND a.status = 'Absent'
          `);
      
      const removedCount = beforeCount.recordset[0].count - afterCount.recordset[0].count;
      
      if (removedCount === 0) {
          return res.status(404).json({
              success: false,
              error: `No unattended dayoff records found for employee ${employeeId} in the current month`
          });
      }

      res.json({
          success: true,
          message: `${removedCount} unattended dayoff record(s) removed successfully for employee ${employeeId}`
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Remove approved leaves for a certain employee from attendance records
app.delete('/api/admin/remove-approved-leaves', async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
      return res.status(400).json({
          success: false,
          error: "Employee ID is required"
      });
  }

  try {
      const connection = await db.connectDB();
      const sql = await import('mssql');
      
      // Check if employee exists
      const employeeCheck = await connection.request()
          .input('employee_ID', sql.default.Int, parseInt(employeeId))
          .query('SELECT 1 FROM Employee WHERE employee_ID = @employee_ID');
      
      if (!employeeCheck.recordset || employeeCheck.recordset.length === 0) {
          return res.status(404).json({
              success: false,
              error: `Employee ${employeeId} not found`
          });
      }
      
      // Check how many approved leave attendance records exist before deletion
      const beforeCount = await connection.request()
          .input('employee_ID', sql.default.Int, parseInt(employeeId))
          .query(`
            SELECT COUNT(*) as count 
            FROM Attendance a
            WHERE a.emp_ID = @employee_ID
            AND EXISTS (
              SELECT 1 FROM Annual_Leave al inner join Leave l on l.request_ID = al.request_ID  
              WHERE al.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION
              SELECT 1 FROM Accidental_Leave acc inner join Leave l on l.request_ID = acc.request_ID 
              WHERE acc.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION
              SELECT 1 FROM Medical_Leave ml inner join Leave l on l.request_ID = ml.request_ID 
              WHERE ml.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION
              SELECT 1 FROM Compensation_Leave cl inner join Leave l on l.request_ID = cl.request_ID 
              WHERE cl.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION 
               SELECT 1 FROM Unpaid_Leave ul inner join Leave l on l.request_ID = ul.request_ID 
              WHERE ul.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
            )
          `);

      await connection.request()
          .input('Employee_id', sql.default.Int, parseInt(employeeId))
          .execute('Remove_Approved_Leaves');
      
      // Check how many records exist after deletion
      const afterCount = await connection.request()
          .input('employee_ID', sql.default.Int, parseInt(employeeId))
          .query(`
            SELECT COUNT(*) as count 
            FROM Attendance a
            WHERE a.emp_ID = @employee_ID
            AND EXISTS (
              SELECT 1 FROM Annual_Leave al inner join Leave l on l.request_ID = al.request_ID  
              WHERE al.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION
              SELECT 1 FROM Accidental_Leave acc inner join Leave l on l.request_ID = acc.request_ID 
              WHERE acc.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION
              SELECT 1 FROM Medical_Leave ml inner join Leave l on l.request_ID = ml.request_ID 
              WHERE ml.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION
              SELECT 1 FROM Compensation_Leave cl inner join Leave l on l.request_ID = cl.request_ID 
              WHERE cl.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
              UNION 
               SELECT 1 FROM Unpaid_Leave ul inner join Leave l on l.request_ID = ul.request_ID 
              WHERE ul.emp_ID = @employee_ID
              AND l.final_approval_status = 'approved'
              AND a.date BETWEEN l.start_date AND l.end_date
            )
          `);
      
      const removedCount = beforeCount.recordset[0].count - afterCount.recordset[0].count;
      
      if (removedCount === 0) {
          return res.status(404).json({
              success: false,
              error: `No approved leave attendance records found for employee ${employeeId}`
          })};

      res.json({
          success: true,
          message: `${removedCount} approved leave attendance record(s) removed successfully for employee ${employeeId}`
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Replace another employee
app.post('/api/admin/replace-employee', async (req, res) => {
  const { emp1Id, emp2Id, fromDate, toDate } = req.body;

  if (!emp1Id || !emp2Id || !fromDate || !toDate) {
      return res.status(400).json({
          success: false,
          error: "emp1Id, emp2Id, fromDate and toDate are all required"
      });
  }

  // Validate that fromDate is not after toDate
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  if (from > to) {
      return res.status(400).json({ 
          success: false, 
          error: "From date can't be after the to date" 
      });
  }

  try {
      const connection = await db.connectDB();
      const sql = await import('mssql');

      await connection.request()
          .input('Emp1_ID', sql.default.Int, parseInt(emp1Id))
          .input('Emp2_ID', sql.default.Int, parseInt(emp2Id))
          .input('from_date', sql.default.Date, fromDate)
          .input('to_date', sql.default.Date, toDate)
          .execute('Replace_employee');

      res.json({
          success: true,
          message: `Employee ${emp1Id} successfully replaced by ${emp2Id} from ${fromDate} to ${toDate}`
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Update the employee’s employment_status based on leave/active
app.put('/api/admin/update-employment-status', async (req, res) => {
  const { employeeId } = req.body;

  if (!employeeId) {
      return res.status(400).json({
          success: false,
          error: "Employee ID is required"
      });
  }

  try {
      const connection = await db.connectDB();
      const sql = await import('mssql');
      
      // Check if employee exists
      const employeeCheck = await connection.request()
          .input('employee_ID', sql.default.Int, parseInt(employeeId))
          .query('SELECT 1 FROM Employee WHERE employee_ID = @employee_ID');
      
      if (!employeeCheck.recordset || employeeCheck.recordset.length === 0) {
          return res.status(404).json({
              success: false,
              error: `Employee ${employeeId} not found`
          });
      }

      await connection.request()
          .input('Employee_ID', sql.default.Int, parseInt(employeeId))
          .execute('Update_Employment_Status');

      res.json({
          success: true,
          message: `Employment status updated successfully for employee ${employeeId}`
      });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});





// =================== End Admin Part 2 ====================
// =================== Academic Employee Part 1 ====================

//2. Peformance for a semester
app.get('/api/academic/performance', async (req, res) => {
    try {
        const { employeeId, semester } = req.query;

        console.log('Performance request:', { employeeId, semester }); // Debug log

        if (!employeeId || !semester) {
            return res.status(400).json({ success: false, error: "Employee ID and semester are required" });
        }

        // Validate semester format: W## or S## (W or S followed by exactly 2 digits)
        const semesterPattern = /^[WS]\d{2}$/;
        if (!semesterPattern.test(semester)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid semester format. Must be W## or S## (e.g., W24, S23)" 
            });
        }

        const connection = await db.connectDB();
        
        const result = await connection.request()
            .input('employee_ID', parseInt(employeeId))
            .input('semester', semester)
            .query(`
                SELECT * 
                FROM dbo.MyPerformance(@employee_ID, @semester)
            `);

        console.log('Performance result:', result.recordset); // Debug log

        res.json({ success: true, performance: result.recordset });
    } catch (err) {
        console.error('Performance error:', err); // Debug log
        res.status(500).json({ success: false, error: err.message });
    }
});

//3. Current Month Attendance 
app.get('/api/academic/attendance/current-month', async (req, res) => {
    try {
        const { employeeId } = req.query;
        
        console.log('Attendance request - employeeId:', employeeId); // Debug log
        
        if (!employeeId) {
            return res.status(400).json({ success: false, error: "Employee ID is required" });
        }

        const connection = await db.connectDB();
        const result = await connection.request()
            .input('employee_ID', parseInt(employeeId))
            .query(`
                SELECT *
                FROM dbo.MyAttendance(@employee_ID)
            `);

        console.log('Attendance result count:', result.recordset.length); // Debug log

        res.json({ success: true, attendance: result.recordset });
    } catch (err) {
        console.error('Attendance error:', err); // Debug log
        res.status(500).json({ success: false, error: err.message });
    }
});

//4. Last Month Payroll
app.get('/api/academic/payroll/last-month', async (req, res) => {
    try {
        const { employeeId } = req.query;
        if (!employeeId) {
            return res.status(400).json({ success: false, error: "Employee ID is required" });
        }

        const connection = await db.connectDB();
        const result = await connection.request()
            .input('employee_ID', parseInt(employeeId))
            .query(`
                SELECT *
                FROM dbo.Last_month_payroll(@employee_ID)
            `);

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).json({ success: false, error: "No payroll found for last month" });
        }

        res.json({ success: true, payroll: result.recordset[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
  })

  //5.Deductions in a period
app.get('/api/academic/deductions/attendance', async (req, res) => {
    try {
        const { employeeId, month } = req.query;
        if (!employeeId || !month) {
            return res.status(400).json({ success: false, error: "Employee ID and month are required" });
        }

        const connection = await db.connectDB();
        const result = await connection.request()
            .input('employee_ID', parseInt(employeeId))
            .input('month', parseInt(month))
            .query(`
                SELECT *
                FROM dbo.Deductions_Attendance(@employee_ID, @month)
                ORDER BY date DESC
            `);

        res.json({ success: true, deductions: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

//6. Apply Annual Leave
app.post('/api/academic/leaves/annual/apply', async (req, res) => {
    try {
        const { employeeId, fromDate, toDate, reason } = req.body;

        if (!employeeId || !fromDate || !toDate || !reason) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }
        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (isNaN(from) || isNaN(to)) {
            return res.status(400).json({ success: false, error: "Invalid date format" });
        }
        if (from > to) {
            return res.status(400).json({ success: false, error: "From date must be before to date" });
        }

        const connection = await db.connectDB();
        await connection.request()
            .input('employee_ID', parseInt(employeeId))
            .input('from_date', fromDate)
            .input('to_date', toDate)
            .input('reason', reason)
             .query(`
                INSERT INTO Annual_Leave (employee_ID, from_date, to_date, reason, status)
                VALUES (@employee_ID, @from_date, @to_date, @reason, 'pending')
            `);
        res.json({ success: true, message: "Annual leave application submitted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

//7. Statuses of Sumbitted Leaves

app.get('/api/academic/leaves/status/current-month', async (req, res) => {
    try {
        const { employeeId } = req.query;
        if (!employeeId) {
            return res.status(400).json({ success: false, error: "Employee ID is required" });
        }

        const connection = await db.connectDB();
        const result = await connection.request()
            .input('employee_ID', parseInt(employeeId))
            .query(`
                SELECT 'annual' AS leave_type, leave_ID, from_date, to_date, reason, status
                FROM Annual_Leave
                WHERE employee_ID = @employee_ID
                  AND MONTH(from_date) = MONTH(GETDATE())
                  AND YEAR(from_date) = YEAR(GETDATE())
                UNION ALL
                SELECT 'accidental' AS leave_type, leave_ID, from_date, to_date, reason, status
                FROM Accidental_Leave
                WHERE employee_ID = @employee_ID
                  AND MONTH(from_date) = MONTH(GETDATE())
                  AND YEAR(from_date) = YEAR(GETDATE())
                ORDER BY from_date DESC
            `);

        res.json({ success: true, leaves: result.recordset });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});



const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend running on http://${HOST}:${PORT}`);
});

// ============================================
// ACADEMIC EMPLOYEE OPERATIONS ENDPOINTS
// ============================================