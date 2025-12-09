import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const AdminActions = () => {
  const [formData, setFormData] = useState({
    removeDeductions: false,
    attendanceEmployeeId: "",
    checkIn: "",
    checkOut: "",
    holidayName: "",
    holidayFromDate: "",
    holidayToDate: "",
    initiateAttendance: false,
    removeDayoffEmployeeId: "",
    removeApprovedLeavesEmployeeId: "",
    replaceEmp1Id: "",
    replaceEmp2Id: "",
    replaceFromDate: "",
    replaceToDate: "",
    updateStatusEmployeeId: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [message]);

  const scrollToTop = () => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleRemoveDeductions = async () => {
    try {
      setLoading(true);
      setMessage(null);
      scrollToTop();

      const response = await fetch("http://localhost:5001/api/admin/remove-resigned-deductions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove deductions");
      }

      setMessage({ type: "success", text: data.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to remove deductions" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async () => {
    scrollToTop();
    if (!formData.attendanceEmployeeId) {
      setMessage({ type: "error", text: "Employee ID is required" });
      return;
    }

    // Validate: both times must be provided or both must be empty
    const hasCheckIn = formData.checkIn && formData.checkIn.trim() !== '';
    const hasCheckOut = formData.checkOut && formData.checkOut.trim() !== '';
    
    if (hasCheckIn !== hasCheckOut) {
      setMessage({ type: "error", text: "Both check-in and check-out times must be provided together, or leave both empty to mark absent" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // Send the raw values entered in the form (no additional frontend formatting)
      const response = await fetch("http://localhost:5001/api/admin/update-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: formData.attendanceEmployeeId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update attendance");
      }

      setMessage({ type: "success", text: data.message });
      setFormData({ ...formData, attendanceEmployeeId: "", checkIn: "", checkOut: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update attendance" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async () => {
    scrollToTop();
    if (!formData.holidayName || !formData.holidayFromDate || !formData.holidayToDate) {
      setMessage({ type: "error", text: "All holiday fields are required" });
      return;
    }

    // Validate that fromDate is not after toDate
    const fromDate = new Date(formData.holidayFromDate);
    const toDate = new Date(formData.holidayToDate);
    
    if (fromDate > toDate) {
      setMessage({ type: "error", text: "From date can't be after the to date" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("http://localhost:5001/api/admin/add-holiday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holidayName: formData.holidayName,
          fromDate: formData.holidayFromDate,
          toDate: formData.holidayToDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add holiday");
      }

      setMessage({ type: "success", text: data.message });
      setFormData({ ...formData, holidayName: "", holidayFromDate: "", holidayToDate: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add holiday" });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateAttendance = async () => {
    try {
      setLoading(true);
      setMessage(null);
      scrollToTop();

      const response = await fetch("http://localhost:5001/api/admin/initiate-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success === false) {
        setMessage({ type: "error", text: data.message });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate attendance");
      }

      setMessage({ type: "success", text: data.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to initiate attendance" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveHolidayAttendance = async () => {
    try {
      setLoading(true);
      setMessage(null);
      scrollToTop();

      const response = await fetch("http://localhost:5001/api/admin/remove-holiday-attendance", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove holiday attendance");
      }

      setMessage({ type: "success", text: data.message });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to remove holiday attendance" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDayoff = async () => {
    scrollToTop();
    if (!formData.removeDayoffEmployeeId) {
      setMessage({ type: "error", text: "Employee ID is required" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("http://localhost:5001/api/admin/remove-dayoff", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: formData.removeDayoffEmployeeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove dayoff records");
      }

      setMessage({ type: "success", text: data.message });
      setFormData({ ...formData, removeDayoffEmployeeId: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to remove dayoff records" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveApprovedLeaves = async () => {
    scrollToTop();
    if (!formData.removeApprovedLeavesEmployeeId) {
      setMessage({ type: "error", text: "Employee ID is required" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("http://localhost:5001/api/admin/remove-approved-leaves", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: formData.removeApprovedLeavesEmployeeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove approved leaves");
      }

      setMessage({ type: "success", text: data.message });
      setFormData({ ...formData, removeApprovedLeavesEmployeeId: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to remove approved leaves" });
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceEmployee = async () => {
    scrollToTop();
    if (!formData.replaceEmp1Id || !formData.replaceEmp2Id || !formData.replaceFromDate || !formData.replaceToDate) {
      setMessage({ type: "error", text: "All fields are required for employee replacement" });
      return;
    }

    // Validate that fromDate is not after toDate
    const fromDate = new Date(formData.replaceFromDate);
    const toDate = new Date(formData.replaceToDate);
    
    if (fromDate > toDate) {
      setMessage({ type: "error", text: "From date can't be after the to date" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("http://localhost:5001/api/admin/replace-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emp1Id: formData.replaceEmp1Id,
          emp2Id: formData.replaceEmp2Id,
          fromDate: formData.replaceFromDate,
          toDate: formData.replaceToDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to replace employee");
      }

      setMessage({ type: "success", text: data.message });
      setFormData({ 
        ...formData, 
        replaceEmp1Id: "", 
        replaceEmp2Id: "", 
        replaceFromDate: "", 
        replaceToDate: "" 
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to replace employee" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmploymentStatus = async () => {
    scrollToTop();
    if (!formData.updateStatusEmployeeId) {
      setMessage({ type: "error", text: "Employee ID is required" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("http://localhost:5001/api/admin/update-employment-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: formData.updateStatusEmployeeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update employment status");
      }

      setMessage({ type: "success", text: data.message });
      setFormData({ ...formData, updateStatusEmployeeId: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update employment status" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div ref={messageRef}>
        {message && (
          <Card className={message.type === "error" ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950" : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"}>
            <CardContent className="py-4">
              <div className="flex items-center gap-2">
                {message.type === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                )}
                <p className={message.type === "error" ? "text-red-900 dark:text-red-200" : "text-green-900 dark:text-green-200"}>
                  {message.text}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Remove Resigned Employee Deductions</CardTitle>
          <CardDescription>Remove deductions for employees who have resigned</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRemoveDeductions} disabled={loading} variant="destructive">
            {loading ? "Processing..." : "Remove Deductions"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Attendance</CardTitle>
          <CardDescription>Update check-in and check-out time for an employee. Leave both times empty to mark as absent, or fill both times to mark as present.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendance-employee-id">Employee ID</Label>
            <Input
              id="attendance-employee-id"
              type="number"
              placeholder="Enter employee ID"
              value={formData.attendanceEmployeeId}
              onChange={(e) => setFormData({ ...formData, attendanceEmployeeId: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check-in">Check In Time</Label>
              <Input
                id="check-in"
                type="time"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check-out">Check Out Time</Label>
              <Input
                id="check-out"
                type="time"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          <Button onClick={handleUpdateAttendance} disabled={loading}>
            {loading ? "Updating..." : "Update Attendance"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Holiday</CardTitle>
          <CardDescription>Add a new holiday to the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holiday-name">Holiday Name</Label>
            <Input
              id="holiday-name"
              placeholder="e.g., Christmas, New Year"
              value={formData.holidayName}
              onChange={(e) => setFormData({ ...formData, holidayName: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-from">From Date</Label>
              <Input
                id="holiday-from"
                type="date"
                value={formData.holidayFromDate}
                onChange={(e) => setFormData({ ...formData, holidayFromDate: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holiday-to">To Date</Label>
              <Input
                id="holiday-to"
                type="date"
                value={formData.holidayToDate}
                onChange={(e) => setFormData({ ...formData, holidayToDate: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          <Button onClick={handleAddHoliday} disabled={loading}>
            {loading ? "Adding..." : "Add Holiday"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Initiate Attendance</CardTitle>
          <CardDescription>Initialize attendance for all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleInitiateAttendance} disabled={loading}>
            {loading ? "Initiating..." : "Initiate Attendance"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remove Holiday Attendance</CardTitle>
          <CardDescription>Remove attendance records for all employees during official holidays</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRemoveHolidayAttendance} disabled={loading} variant="destructive">
            {loading ? "Removing..." : "Remove Holiday Attendance"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remove Unattended Dayoff</CardTitle>
          <CardDescription>Remove unattended dayoff records for an employee in the current month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remove-dayoff-employee-id">Employee ID</Label>
            <Input
              id="remove-dayoff-employee-id"
              type="number"
              placeholder="Enter employee ID"
              value={formData.removeDayoffEmployeeId}
              onChange={(e) => setFormData({ ...formData, removeDayoffEmployeeId: e.target.value })}
              disabled={loading}
            />
          </div>
          <Button onClick={handleRemoveDayoff} disabled={loading} variant="destructive">
            {loading ? "Removing..." : "Remove Dayoff Records"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remove Approved Leaves from Attendance</CardTitle>
          <CardDescription>Remove approved leaves for an employee from attendance records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remove-approved-leaves-employee-id">Employee ID</Label>
            <Input
              id="remove-approved-leaves-employee-id"
              type="number"
              placeholder="Enter employee ID"
              value={formData.removeApprovedLeavesEmployeeId}
              onChange={(e) => setFormData({ ...formData, removeApprovedLeavesEmployeeId: e.target.value })}
              disabled={loading}
            />
          </div>
          <Button onClick={handleRemoveApprovedLeaves} disabled={loading} variant="destructive">
            {loading ? "Removing..." : "Remove Approved Leaves"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Replace Employee</CardTitle>
          <CardDescription>Replace one employee with another for a specific period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="replace-emp1-id">Employee 1 ID (to be replaced)</Label>
              <Input
                id="replace-emp1-id"
                type="number"
                placeholder="Employee 1 ID"
                value={formData.replaceEmp1Id}
                onChange={(e) => setFormData({ ...formData, replaceEmp1Id: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replace-emp2-id">Employee 2 ID (replacement)</Label>
              <Input
                id="replace-emp2-id"
                type="number"
                placeholder="Employee 2 ID"
                value={formData.replaceEmp2Id}
                onChange={(e) => setFormData({ ...formData, replaceEmp2Id: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="replace-from-date">From Date</Label>
              <Input
                id="replace-from-date"
                type="date"
                value={formData.replaceFromDate}
                onChange={(e) => setFormData({ ...formData, replaceFromDate: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="replace-to-date">To Date</Label>
              <Input
                id="replace-to-date"
                type="date"
                value={formData.replaceToDate}
                onChange={(e) => setFormData({ ...formData, replaceToDate: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          <Button onClick={handleReplaceEmployee} disabled={loading}>
            {loading ? "Processing..." : "Replace Employee"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Employment Status</CardTitle>
          <CardDescription>Update employee's employment status based on their leave/active state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-status-employee-id">Employee ID</Label>
            <Input
              id="update-status-employee-id"
              type="number"
              placeholder="Enter employee ID"
              value={formData.updateStatusEmployeeId}
              onChange={(e) => setFormData({ ...formData, updateStatusEmployeeId: e.target.value })}
              disabled={loading}
            />
          </div>
          <Button onClick={handleUpdateEmploymentStatus} disabled={loading}>
            {loading ? "Updating..." : "Update Employment Status"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActions;
