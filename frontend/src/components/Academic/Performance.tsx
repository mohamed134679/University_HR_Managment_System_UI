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
        `http://localhost:5001/api/academic/performance?employeeId=${user.id}&semester=${encodeURIComponent(semester)}`
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
          placeholder="Semester (e.g. S25, W24)"
          value={semester}
          onChange={e => setSemester(e.target.value)}
        />
        <Button onClick={fetchPerformance} disabled={loading}>
          {loading ? "Loading..." : "Fetch Performance"}
        </Button>
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {performance && performance.length > 0 && (
        <div className="mt-4 space-y-4">
          {performance.map((perf: any, index: number) => (
            <div key={index} className="border rounded p-4 bg-card">
              <p><span className="font-medium">Performance ID:</span> {perf.performance_ID}</p>
              <p><span className="font-medium">Employee ID:</span> {perf.emp_ID}</p>
              <p><span className="font-medium">Semester:</span> {perf.semester}</p>
              <p><span className="font-medium">Rating:</span> {perf.rating}</p>
              <p><span className="font-medium">Comments:</span> {perf.comments || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
      {performance && performance.length === 0 && (
        <div className="text-muted-foreground mt-2">No performance data found for this semester.</div>
      )}
      {!performance && !loading && !error && (
        <div className="text-muted-foreground mt-2">Enter a semester to view performance data.</div>
      )}
    </div>
  );
};

export default Performance;