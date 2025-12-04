import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
};

const Performance = ({ user }: Props) => {
  const [semester, setSemester] = useState("");
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    setLoading(true);
    setError(null);
    setPerformance(null);
    if (!semester) {
      setError("Please enter a semester.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5001/api/academic/performance?employeeId=${user.employeeId}&semester=${encodeURIComponent(semester)}`
      );
      const data = await res.json();
      if (data.success) {
        setPerformance(data.performance || null);
      } else {
        setError(data.error || "Failed to fetch performance.");
      }
    } catch (err: any) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold mb-2">Performance</h2>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          className="border rounded px-3 py-2"
          placeholder="Semester (e.g. Spring 2025)"
          value={semester}
          onChange={e => setSemester(e.target.value)}
        />
        <Button onClick={fetchPerformance} disabled={loading}>
          {loading ? "Loading..." : "Fetch Performance"}
        </Button>
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {performance && (
        <div className="mt-4 border rounded p-4 bg-card">
          {/* Adjust these fields based on your backend response */}
          <p><span className="font-medium">Semester:</span> {performance.semester}</p>
          <p><span className="font-medium">Courses:</span> {performance.courses}</p>
          <p><span className="font-medium">Rating:</span> {performance.rating}</p>
          <p><span className="font-medium">Remarks:</span> {performance.remarks}</p>
        </div>
      )}
      {!performance && !loading && !error && (
        <div className="text-muted-foreground mt-2">No performance data found for this semester.</div>
      )}
    </div>
  );
};

export default Performance;