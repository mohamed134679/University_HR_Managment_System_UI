import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface DeductionsManagementProps {
  hrId: number;
}

const DeductionsManagement = ({ hrId }: DeductionsManagementProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Missing Hours
  const [missingHoursForm, setMissingHoursForm] = useState({
    employeeId: "",
    date: "",
    hoursLost: "",
    reason: "",
  });

  // Missing Days
  const [missingDaysForm, setMissingDaysForm] = useState({
    employeeId: "",
    month: new Date().toISOString().slice(0, 7),
    daysCount: "",
    reason: "",
  });

  const handleMissingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // TODO: Implement backend endpoint
      // const response = await fetch("http://localhost:5001/api/hr/deductions/missing-hours", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...missingHoursForm, hrId }),
      // });

      console.log("Adding missing hours deduction:", missingHoursForm);
      setSuccess("Deduction added successfully!");
      setMissingHoursForm({
        employeeId: "",
        date: "",
        hoursLost: "",
        reason: "",
      });
    } catch (err) {
      setError("Failed to add deduction");
    } finally {
      setLoading(false);
    }
  };

  const handleMissingDaysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // TODO: Implement backend endpoint
      // const response = await fetch("http://localhost:5001/api/hr/deductions/missing-days", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...missingDaysForm, hrId }),
      // });

      console.log("Adding missing days deduction:", missingDaysForm);
      setSuccess("Deduction added successfully!");
      setMissingDaysForm({
        employeeId: "",
        month: new Date().toISOString().slice(0, 7),
        daysCount: "",
        reason: "",
      });
    } catch (err) {
      setError("Failed to add deduction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tabs defaultValue="missing-hours" className="space-y-4">
      <TabsList>
        <TabsTrigger value="missing-hours">Missing Hours</TabsTrigger>
        <TabsTrigger value="missing-days">Missing Days</TabsTrigger>
      </TabsList>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Missing Hours Tab */}
      <TabsContent value="missing-hours">
        <Card>
          <CardHeader>
            <CardTitle>Add Missing Hours Deduction</CardTitle>
            <CardDescription>Record deductions for employees who worked fewer than 8 hours in a day</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMissingHoursSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-id-hours">Employee ID</Label>
                  <Input
                    id="emp-id-hours"
                    type="number"
                    placeholder="Enter employee ID"
                    value={missingHoursForm.employeeId}
                    onChange={(e) =>
                      setMissingHoursForm({ ...missingHoursForm, employeeId: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-hours">Date</Label>
                  <Input
                    id="date-hours"
                    type="date"
                    value={missingHoursForm.date}
                    onChange={(e) =>
                      setMissingHoursForm({ ...missingHoursForm, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours-lost">Hours Lost</Label>
                  <Input
                    id="hours-lost"
                    type="number"
                    placeholder="e.g., 2.5"
                    step="0.5"
                    value={missingHoursForm.hoursLost}
                    onChange={(e) =>
                      setMissingHoursForm({ ...missingHoursForm, hoursLost: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason-hours">Reason</Label>
                  <Input
                    id="reason-hours"
                    type="text"
                    placeholder="e.g., Left early, Late arrival"
                    value={missingHoursForm.reason}
                    onChange={(e) =>
                      setMissingHoursForm({ ...missingHoursForm, reason: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Missing Hours Deduction"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Missing Days Tab */}
      <TabsContent value="missing-days">
        <Card>
          <CardHeader>
            <CardTitle>Add Missing Days Deduction</CardTitle>
            <CardDescription>Record deductions for employees who were absent</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMissingDaysSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emp-id-days">Employee ID</Label>
                  <Input
                    id="emp-id-days"
                    type="number"
                    placeholder="Enter employee ID"
                    value={missingDaysForm.employeeId}
                    onChange={(e) =>
                      setMissingDaysForm({ ...missingDaysForm, employeeId: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="month-days">Month</Label>
                  <Input
                    id="month-days"
                    type="month"
                    value={missingDaysForm.month}
                    onChange={(e) =>
                      setMissingDaysForm({ ...missingDaysForm, month: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="days-count">Number of Days</Label>
                  <Input
                    id="days-count"
                    type="number"
                    placeholder="e.g., 2"
                    min="1"
                    value={missingDaysForm.daysCount}
                    onChange={(e) =>
                      setMissingDaysForm({ ...missingDaysForm, daysCount: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason-days">Reason</Label>
                  <Input
                    id="reason-days"
                    type="text"
                    placeholder="e.g., Absence without notice"
                    value={missingDaysForm.reason}
                    onChange={(e) =>
                      setMissingDaysForm({ ...missingDaysForm, reason: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Missing Days Deduction"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DeductionsManagement;
