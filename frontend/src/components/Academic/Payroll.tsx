import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
};

const Payroll = ({ user }: Props) => {
  const [payroll, setPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5001/api/academic/payroll/last-month?employeeId=${user.employeeId}`
      );
      const data = await res.json();
      if (data.success) {
        setPayroll(data.payroll || null);
      } else {
        setError(data.error || "Failed to fetch payroll.");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold mb-2">Last Month Payroll</h2>
      <Button onClick={fetchPayroll} disabled={loading}>
        {loading ? "Loading..." : "Fetch Payroll"}
      </Button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {payroll && (
        <div className="mt-4 border rounded p-4 bg-card">
          <p><span className="font-medium">Month:</span> {payroll.month}</p>
          <p><span className="font-medium">Year:</span> {payroll.year}</p>
          <p><span className="font-medium">Base Salary:</span> {payroll.baseSalary}</p>
          <p><span className="font-medium">Bonuses:</span> {payroll.bonuses}</p>
          <p><span className="font-medium">Deductions:</span> {payroll.deductions}</p>
          <p><span className="font-medium">Net Pay:</span> {payroll.netPay}</p>
        </div>
      )}
      {!payroll && !loading && !error && (
        <div className="text-muted-foreground mt-2">No payroll data found for last month.</div>
      )}
    </div>
  );
};

export default Payroll;