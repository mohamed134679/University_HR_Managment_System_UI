import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PayrollRecord {
  employeeId: number;
  employeeName: string;
  baseSalary: number;
  bonus: number;
  deductions: number;
  finalSalary: number;
  status: "pending" | "generated" | "paid";
}

interface PayrollGenerationProps {
  hrId: number;
}

const PayrollGeneration = ({ hrId }: PayrollGenerationProps) => {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [generated, setGenerated] = useState(false);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // TODO: Implement backend endpoint
      // const response = await fetch("http://localhost:5001/api/hr/payroll/generate", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ month, hrId }),
      // });
      // const data = await response.json();
      // setPayrollRecords(data.records);

      console.log("Generating payroll for:", month);
      // Mock data for demonstration
      setPayrollRecords([
        {
          employeeId: 1,
          employeeName: "Jack John",
          baseSalary: 40000,
          bonus: 500,
          deductions: 1200,
          finalSalary: 39300,
          status: "generated",
        },
        {
          employeeId: 2,
          employeeName: "Ahmed Zaki",
          baseSalary: 45000,
          bonus: 1000,
          deductions: 800,
          finalSalary: 45200,
          status: "generated",
        },
      ]);

      setSuccess("Payroll generated successfully!");
      setGenerated(true);
    } catch (err) {
      setError("Failed to generate payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPayroll = () => {
    try {
      // TODO: Implement CSV export
      const csvContent = "Employee ID,Name,Base Salary,Bonus,Deductions,Final Salary\n" +
        payrollRecords
          .map((r) => `${r.employeeId},${r.employeeName},${r.baseSalary},${r.bonus},${r.deductions},${r.finalSalary}`)
          .join("\n");

      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
      element.setAttribute("download", `payroll_${month}.csv`);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      setError("Failed to export payroll");
    }
  };

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Monthly Payroll</CardTitle>
          <CardDescription>Generate payroll for employees based on their salaries, bonuses, and deductions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGeneratePayroll} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Select Month</Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate Payroll"}
            </Button>
          </form>
        </CardContent>
      </Card>

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

      {/* Payroll Records Table */}
      {generated && payrollRecords.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payroll for {month}</CardTitle>
              <CardDescription>{payrollRecords.length} employees</CardDescription>
            </div>
            <Button variant="outline" onClick={handleExportPayroll} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Base Salary</TableHead>
                    <TableHead className="text-right">Bonus</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Final Salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record) => (
                    <TableRow key={record.employeeId}>
                      <TableCell className="font-medium">{record.employeeId}</TableCell>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell className="text-right">{record.baseSalary.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">
                        +{record.bonus.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        -{record.deductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-bold">{record.finalSalary.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm font-medium ${
                            record.status === "generated"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : record.status === "paid"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Base</p>
                <p className="text-lg font-bold">
                  {payrollRecords.reduce((sum, r) => sum + r.baseSalary, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Total Bonus</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  +{payrollRecords.reduce((sum, r) => sum + r.bonus, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">Total Deductions</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  -{payrollRecords.reduce((sum, r) => sum + r.deductions, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Final</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {payrollRecords.reduce((sum, r) => sum + r.finalSalary, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PayrollGeneration;
