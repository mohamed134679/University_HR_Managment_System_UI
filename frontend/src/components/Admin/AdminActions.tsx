import { useState } from "react";
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
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRemoveDeductions = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch("http://localhost:5001/api/admin/remove-resigned-deductions", {
        method: "POST",
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
    if (!formData.attendanceEmployeeId || !formData.checkIn || !formData.checkOut) {
      setMessage({ type: "error", text: "All attendance fields are required" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

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
    if (!formData.holidayName || !formData.holidayFromDate || !formData.holidayToDate) {
      setMessage({ type: "error", text: "All holiday fields are required" });
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

      const response = await fetch("http://localhost:5001/api/admin/initiate-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

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

  return (
    <div className="space-y-6">
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
          <CardDescription>Update check-in and check-out time for an employee</CardDescription>
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
    </div>
  );
};

export default AdminActions;
