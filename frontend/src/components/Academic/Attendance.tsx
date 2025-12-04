import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
};

const Attendance = ({ user }: Props) => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5001/api/academic/attendance/current-month?employeeId=${user.employeeId}`
      );
      const data = await res.json();
      if (data.success) {
        setAttendance(data.attendance || []);
      } else {
        setError(data.error || "Failed to fetch attendance.");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold mb-2">Current Month Attendance</h2>
      <Button onClick={fetchAttendance} disabled={loading}>
        {loading ? "Loading..." : "Fetch Attendance"}
      </Button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {attendance.length > 0 && (
        <table className="w-full mt-4 border rounded">
          <thead>
            <tr className="bg-muted">
              <th className="px-2 py-1 text-left">Date</th>
              <th className="px-2 py-1 text-left">Check In</th>
              <th className="px-2 py-1 text-left">Check Out</th>
              <th className="px-2 py-1 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-2 py-1">{record.date}</td>
                <td className="px-2 py-1">{record.checkIn}</td>
                <td className="px-2 py-1">{record.checkOut}</td>
                <td className="px-2 py-1">{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {attendance.length === 0 && !loading && !error && (
        <div className="text-muted-foreground mt-2">No attendance records found for this month.</div>
      )}
    </div>
  );
};

export default Attendance;