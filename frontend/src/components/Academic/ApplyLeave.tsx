import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  user: any;
};

const ApplyLeave = ({ user }: Props) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    console.log("fromDate:", fromDate, "toDate:", toDate, "reason:", reason);
    // Trim reason and check for empty strings
    if (!fromDate || !toDate || !reason.trim()) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      setMessage({ type: "error", text: "From date must be before to date" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/academic/leaves/annual/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.employeeId,
          fromDate,
          toDate,
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Leave request submitted!" });
        setFromDate("");
        setToDate("");
        setReason("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit leave request." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 max-w-md mx-auto" onSubmit={handleApply}>
      <h2 className="text-xl font-semibold mb-2">Apply for Annual Leave</h2>
      <div>
        <label className="block mb-1 font-medium">From Date</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">To Date</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Reason</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Reason for leave"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Apply"}
      </Button>
      {message && (
        <div
          className={`mt-2 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
};

export default ApplyLeave;