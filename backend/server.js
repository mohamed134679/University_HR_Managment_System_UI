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

// Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { employeeId, password, userType } = req.body;

    console.log("Login attempt:", { employeeId, password, userType });

    // Validate input
    if (!employeeId || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Employee ID and password are required" 
      });
    }

    // Connect to database and call stored procedure
    const connection = await db.connectDB();
    console.log("Database connected");
    
    const result = await connection.request()
      .input('employee_ID', employeeId)
      .input('password', password)
      .execute('HRLoginValidation');

    console.log("Stored procedure result:", result);

    // Check if the procedure returned a 1 (valid) or 0 (invalid)
    const isValid = result.recordset && result.recordset.length > 0 
      ? result.recordset[0] 
      : result.returnValue;

    console.log("Validation result:", isValid);

    if (!isValid || isValid === 0) {
      console.log("Invalid credentials");
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials" 
      });
    }

    // If valid, fetch user details
    const userResult = await connection.request()
      .input('employee_ID', employeeId)
      .query(`SELECT TOP 1 * FROM Users WHERE employee_ID = @employee_ID`);

    const user = userResult.recordset[0] || {};
    console.log("User found:", user);
    
    res.json({ 
      success: true, 
      message: "Login successful",
      user: {
        id: user.employee_ID || employeeId,
        name: user.name || user.Name || "User",
        type: userType
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
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
