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

    const connection = await db.connectDB();
    console.log("Database connected");
    
    // Check if employee exists with correct password
    const userResult = await connection.request()
      .input('employee_ID', employeeId)
      .input('password', password)
      .query(`
        SELECT 
          employee_id, 
          first_name, 
          last_name, 
          email, 
          dept_name,
          employment_status
        FROM Employee 
        WHERE employee_id = @employee_ID AND password = @password
      `);

    if (!userResult.recordset || userResult.recordset.length === 0) {
      console.log("Invalid admin credentials");
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    const user = userResult.recordset[0];
    console.log("Admin User found:", user);

    res.json({ 
      success: true, 
      message: "Login successful",
      userType: "admin",
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

// Get pending leaves for HR to approve
app.get("/api/hr/leaves/pending", async (req, res) => {
  try {
    const { hrId } = req.query;
    
    if (!hrId) {
      return res.status(400).json({ success: false, error: "HR ID required" });
    }

    const connection = await db.connectDB();
    
    // Query to get pending leaves
    const result = await connection.request()
      .input('hr_ID', parseInt(hrId))
      .query(`
        SELECT 
          L.request_ID,
          COALESCE(AL.emp_ID, ACC.emp_ID, ML.Emp_ID, UL.Emp_ID, CL.emp_ID) as employee_id,
          E.first_name,
          E.last_name,
          L.start_date,
          L.end_date,
          L.num_days,
          L.final_approval_status,
          CASE 
            WHEN AL.request_ID IS NOT NULL THEN 'annual'
            WHEN ACC.request_ID IS NOT NULL THEN 'accidental'
            WHEN ML.request_ID IS NOT NULL THEN 'medical'
            WHEN UL.request_ID IS NOT NULL THEN 'unpaid'
            WHEN CL.request_ID IS NOT NULL THEN 'compensation'
          END as leave_type,
          E.annual_balance,
          E.accidental_balance
        FROM Leave L
        LEFT JOIN Annual_Leave AL ON L.request_ID = AL.request_ID
        LEFT JOIN Accidental_Leave ACC ON L.request_ID = ACC.request_ID
        LEFT JOIN Medical_Leave ML ON L.request_ID = ML.request_ID
        LEFT JOIN Unpaid_Leave UL ON L.request_ID = UL.request_ID
        LEFT JOIN Compensation_Leave CL ON L.request_ID = CL.request_ID
        INNER JOIN Employee E ON COALESCE(AL.emp_ID, ACC.emp_ID, ML.Emp_ID, UL.Emp_ID, CL.emp_ID) = E.employee_id
        INNER JOIN Employee_Approve_Leave EAL ON L.request_ID = EAL.leave_ID
        WHERE L.final_approval_status = 'Pending'
          AND EAL.Emp1_ID = @hr_ID
      `);

    res.json({
      success: true,
      leaves: result.recordset.map(row => ({
        requestId: row.request_ID,
        employeeId: row.employee_id,
        employeeName: `${row.first_name} ${row.last_name}`,
        leaveType: row.leave_type,
        startDate: row.start_date,
        endDate: row.end_date,
        numDays: row.num_days,
        status: row.final_approval_status,
        employeeBalance: row.leave_type === 'annual' ? row.annual_balance : row.accidental_balance,
      }))
    });

  } catch (error) {
    console.error("Error fetching pending leaves:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve annual or accidental leave
app.post("/api/hr/leaves/approve", async (req, res) => {
  try {
    const { requestId, hrId, leaveType } = req.body;

    if (!requestId || !hrId || !leaveType) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const connection = await db.connectDB();

    // Call stored procedure based on leave type
    const procedureName = leaveType === 'annual' || leaveType === 'accidental' 
      ? 'HR_approval_an_acc'
      : leaveType === 'unpaid'
      ? 'HR_approval_unpaid'
      : leaveType === 'compensation'
      ? 'HR_approval_comp'
      : null;

    if (!procedureName) {
      return res.status(400).json({ success: false, error: "Invalid leave type" });
    }

    await connection.request()
      .input('request_ID', parseInt(requestId))
      .input('HR_ID', parseInt(hrId))
      .execute(procedureName);

    res.json({
      success: true,
      message: `${leaveType} leave approved successfully`
    });

  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject leave
app.post("/api/hr/leaves/reject", async (req, res) => {
  try {
    const { requestId, hrId, leaveType } = req.body;

    if (!requestId || !hrId) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const connection = await db.connectDB();

    // Update leave status to rejected
    await connection.request()
      .input('request_ID', parseInt(requestId))
      .query(`
        UPDATE Leave
        SET final_approval_status = 'Rejected'
        WHERE request_ID = @request_ID
      `);

    // Update employee approval record
    await connection.request()
      .input('hr_ID', parseInt(hrId))
      .input('leave_ID', parseInt(requestId))
      .query(`
        UPDATE Employee_Approve_Leave
        SET status = 'Rejected'
        WHERE Emp1_ID = @hr_ID AND leave_ID = @leave_ID
      `);

    res.json({
      success: true,
      message: "Leave rejected successfully"
    });

  } catch (error) {
    console.error("Error rejecting leave:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add missing hours deduction
app.post("/api/hr/deductions/missing-hours", async (req, res) => {
  try {
    const { employeeId, date, hoursLost, reason, hrId } = req.body;

    if (!employeeId || !date || !hoursLost) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const connection = await db.connectDB();

    // Call stored procedure or add deduction
    await connection.request()
      .input('employee_ID', parseInt(employeeId))
      .execute('Deduction_hours');

    res.json({
      success: true,
      message: "Missing hours deduction added successfully"
    });

  } catch (error) {
    console.error("Error adding missing hours deduction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add missing days deduction
app.post("/api/hr/deductions/missing-days", async (req, res) => {
  try {
    const { employeeId, month, daysCount, reason, hrId } = req.body;

    if (!employeeId || !daysCount) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const connection = await db.connectDB();

    // Call stored procedure
    await connection.request()
      .input('employee_id', parseInt(employeeId))
      .execute('Deduction_days');

    res.json({
      success: true,
      message: "Missing days deduction added successfully"
    });

  } catch (error) {
    console.error("Error adding missing days deduction:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate monthly payroll
app.post("/api/hr/payroll/generate", async (req, res) => {
  try {
    const { month, hrId } = req.body;

    if (!month) {
      return res.status(400).json({ success: false, error: "Month required" });
    }

    const connection = await db.connectDB();

    // Parse month YYYY-MM format
    const [year, monthNum] = month.split('-');

    // Get all employees and their salary data
    const result = await connection.request()
      .query(`
        SELECT 
          E.employee_id,
          E.first_name,
          E.last_name,
          E.salary as base_salary,
          ISNULL(dbo.Bonus_amount(E.employee_id), 0) as bonus,
          (SELECT ISNULL(SUM(amount), 0) FROM Deduction 
           WHERE emp_ID = E.employee_id 
           AND MONTH(date) = ${monthNum} 
           AND YEAR(date) = ${year}) as deductions
        FROM Employee E
        WHERE E.employment_status != 'resigned'
      `);

    const payrollRecords = result.recordset.map(row => ({
      employeeId: row.employee_id,
      employeeName: `${row.first_name} ${row.last_name}`,
      baseSalary: row.base_salary || 0,
      bonus: row.bonus || 0,
      deductions: row.deductions || 0,
      finalSalary: (row.base_salary || 0) + (row.bonus || 0) - (row.deductions || 0),
      status: 'generated'
    }));

    res.json({
      success: true,
      records: payrollRecords
    });

  } catch (error) {
    console.error("Error generating payroll:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend running on http://${HOST}:${PORT}`);
});
