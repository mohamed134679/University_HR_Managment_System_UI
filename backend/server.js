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

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`✅ Backend running on http://${HOST}:${PORT}`);
});
