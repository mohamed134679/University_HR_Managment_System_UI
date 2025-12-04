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
      if (data.success && Array.isArray(data.performance) && data.performance.length > 0) {
        setPerformance(data.performance[0]);
      } else {
        setError(data.error || "No performance data found for this semester.");
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
          placeholder="Semester (e.g. W24)"
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
          <p><span className="font-medium">Semester:</span> {performance.semester}</p>
          <p><span className="font-medium">Rating:</span> {performance.rating}</p>
          <p><span className="font-medium">Comments:</span> {performance.comments}</p>
        </div>
      )}
      {!performance && !loading && !error && (
        <div className="text-muted-foreground mt-2">No performance data found for this semester.</div>
      )}
    </div>
  );
};

export default Performance;