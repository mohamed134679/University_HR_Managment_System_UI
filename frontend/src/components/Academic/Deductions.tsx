import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
};

const Deductions = ({ user }: Props) => {
  const [month, setMonth] = useState("");
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDeductions = async () => {
    setLoading(true);
    setError(null);
    setDeductions([]);
    if (!month) {
      setError("Please enter a month (1-12).");
      setLoading(false);
      return;
    }
    const monthNum = parseInt(month);
    if (monthNum < 1 || monthNum > 12) {
      setError("Month must be between 1 and 12.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5001/api/academic/deductions/attendance?employeeId=${user.id}&month=${monthNum}`
      );
      const data = await res.json();
      if (data.success) {
        setDeductions(data.deductions || []);
      } else {
        setError(data.error || "Failed to fetch deductions.");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold mb-2">Attendance Deductions</h2>
      <div className="flex gap-2 mb-2">
        <input
          type="number"
          min="1"
          max="12"
          className="border rounded px-3 py-2"
          placeholder="Month (1-12)"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
        <Button onClick={fetchDeductions} disabled={loading}>
          {loading ? "Loading..." : "Fetch Deductions"}
        </Button>
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {deductions.length > 0 && (
        <table className="w-full mt-4 border rounded">
          <thead>
            <tr className="bg-muted">
              <th className="px-2 py-1 text-left">Deduction ID</th>
              <th className="px-2 py-1 text-left">Employee ID</th>
              <th className="px-2 py-1 text-left">Date</th>
              <th className="px-2 py-1 text-left">Amount</th>
              <th className="px-2 py-1 text-left">Type</th>
              <th className="px-2 py-1 text-left">Status</th>
              <th className="px-2 py-1 text-left">Unpaid ID</th>
              <th className="px-2 py-1 text-left">Attendance ID</th>
            </tr>
          </thead>
          <tbody>
            {deductions.map((ded, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1">{ded.deduction_ID}</td>
                <td className="px-2 py-1">{ded.emp_ID}</td>
                <td className="px-2 py-1">{ded.date ? new Date(ded.date).toLocaleDateString() : 'N/A'}</td>
                <td className="px-2 py-1">{ded.amount ?? 'N/A'}</td>
                <td className="px-2 py-1">{ded.type || 'N/A'}</td>
                <td className="px-2 py-1">{ded.status || 'N/A'}</td>
                <td className="px-2 py-1">{ded.unpaid_ID || 'N/A'}</td>
                <td className="px-2 py-1">{ded.attendance_ID || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {deductions.length === 0 && !loading && !error && (
        <div className="text-muted-foreground mt-2">No deductions found for this month.</div>
      )}
    </div>
  );
};

export default Deductions;