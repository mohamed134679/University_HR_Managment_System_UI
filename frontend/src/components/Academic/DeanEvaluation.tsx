import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
};

const DeanEvaluation = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [rating, setRating] = useState("");
  const [comment, setComment] = useState("");
  const [semester, setSemester] = useState("");

  const handleEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!employeeId.trim() || !rating.trim() || !comment.trim() || !semester.trim()) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      setMessage({ type: "error", text: "Rating must be between 1 and 5" });
      return;
    }

    const semesterPattern = /^[WS]\d{2}$/;
    if (!semesterPattern.test(semester)) {
      setMessage({ type: "error", text: "Invalid semester format. Use W## or S## (e.g., W24, S23)" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        deanId: user.id,
        employeeId: parseInt(employeeId),
        rating: ratingNum,
        comment,
        semester,
      };
      console.log("Dean Evaluation Payload:", payload);

      const res = await fetch("http://localhost:5001/api/academic/evaluation/dean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Dean Evaluation Response:", data);

      if (data.success) {
        setMessage({ type: "success", text: data.message || "Evaluation submitted!" });
        setEmployeeId("");
        setRating("");
        setComment("");
        setSemester("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit evaluation." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Evaluate Employee</h2>
      <p className="text-sm text-gray-600 mb-4">
        Available for: Dean only (employees in same department)
      </p>

      <form className="space-y-4" onSubmit={handleEvaluation}>
        <div>
          <label className="block mb-1 font-medium">Employee ID</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Employee ID to evaluate"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            className="w-full border rounded px-3 py-2"
            placeholder="Rating from 1 to 5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Comment</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Evaluation comments"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Semester</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., W24 or S23"
            maxLength={3}
            value={semester}
            onChange={(e) => setSemester(e.target.value.toUpperCase())}
          />
          <p className="text-xs text-gray-500 mt-1">Format: W## for Winter or S## for Summer</p>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Evaluation"}
        </Button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded ${
            message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default DeanEvaluation;
