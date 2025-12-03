import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface PayrollGenerationProps {
  hrId: number;
}

interface PayrollData {
  payrollId: number;
  employeeId: number;
  employeeName: string;
  baseSalary: number;
  bonusAmount: number;
  deductionsAmount: number;
  finalSalary: number;
  fromDate: string;
  toDate: string;
  paymentDate: string;
  comments: string;
}

const PayrollGeneration = ({ hrId }: PayrollGenerationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setWarning("");
      setPayrollData(null);

      const response = await fetch("http://localhost:5001/api/hr/payroll/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, fromDate, toDate }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate payroll");
        return;
      }

      // Check if it's an "already exists" message
      if (data.message.includes("already exists")) {
        setWarning(data.message);
      } else {
        setSuccess(data.message);
        setPayrollData(data.payroll);
      }
      setEmployeeId("");
      setFromDate("");
      setToDate("");
    } catch (err) {
      setError("Failed to generate payroll. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Payroll</CardTitle>
          <CardDescription>
            Enter employee ID and payroll period to generate payroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {warning && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{warning}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="employee-id">Employee ID</Label>
              <Input
                id="employee-id"
                type="number"
                placeholder="Enter employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Payroll"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {payrollData && (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Details</CardTitle>
            <CardDescription>Payroll record added successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payroll ID</p>
                  <p className="font-medium">{payrollData.payrollId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Employee</p>
                  <p className="font-medium">{payrollData.employeeName} (ID: {payrollData.employeeId})</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="font-medium">
                    {new Date(payrollData.fromDate).toLocaleDateString()} - {new Date(payrollData.toDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Payment Date</p>
                  <p className="font-medium">{new Date(payrollData.paymentDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Salary Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Salary</span>
                    <span className="font-medium">${payrollData.baseSalary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Bonus</span>
                    <span className="font-medium">+${payrollData.bonusAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Deductions</span>
                    <span className="font-medium">-${payrollData.deductionsAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>Final Salary</span>
                    <span>${payrollData.finalSalary.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {payrollData.comments && payrollData.comments !== 'None' && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground">Comments</p>
                  <p className="font-medium">{payrollData.comments}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayrollGeneration;
