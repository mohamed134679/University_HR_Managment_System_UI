import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
};

const LeaveStatus = ({ user }: Props) => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaveStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5001/api/academic/leaves/status/current-month?employeeId=${user.id}`
      );
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves || []);
      } else {
        setError(data.error || "Failed to fetch leave status.");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold mb-2">Leave Status (Current Month)</h2>
      <Button onClick={fetchLeaveStatus} disabled={loading}>
        {loading ? "Loading..." : "Fetch Leave Status"}
      </Button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {leaves.length > 0 && (
        <table className="w-full mt-4 border rounded">
          <thead>
            <tr className="bg-muted">
              <th className="px-2 py-1 text-left">Request ID</th>
              <th className="px-2 py-1 text-left">Date of Request</th>
              <th className="px-2 py-1 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1">{leave.request_ID || 'N/A'}</td>
                <td className="px-2 py-1">{leave.date_of_request ? new Date(leave.date_of_request).toLocaleDateString() : 'N/A'}</td>
                <td className="px-2 py-1">{leave.final_approval_status || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {leaves.length === 0 && !loading && !error && (
        <div className="text-muted-foreground mt-2">No leaves submitted this month.</div>
      )}
    </div>
  );
};

export default LeaveStatus;