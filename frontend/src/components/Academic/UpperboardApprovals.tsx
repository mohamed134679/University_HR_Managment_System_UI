import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  user: any;
};

const UpperboardApprovals = ({ user }: Props) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Annual Leave Approval State
  const [annualRequestId, setAnnualRequestId] = useState("");
  const [annualReplacementId, setAnnualReplacementId] = useState("");

  // Unpaid Leave Approval State
  const [unpaidRequestId, setUnpaidRequestId] = useState("");

  // Debug: Log user object on mount
  console.log("UpperboardApprovals - User object:", user);
  console.log("UpperboardApprovals - User ID:", user?.id);

  const handleAnnualApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!annualRequestId.trim() || !annualReplacementId.trim()) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requestId: parseInt(annualRequestId),
        upperboardId: user.id,
        replacementId: parseInt(annualReplacementId),
      };
      console.log("Annual Approval Payload:", payload);

      const res = await fetch("http://localhost:5001/api/academic/leaves/annual/upperboard-approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Annual Approval Response:", data);

      if (data.success) {
        setMessage({ type: "success", text: data.message || "Annual leave processed!" });
        setAnnualRequestId("");
        setAnnualReplacementId("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpaidApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!unpaidRequestId.trim()) {
      setMessage({ type: "error", text: "Request ID is required" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requestId: parseInt(unpaidRequestId),
        upperboardId: user.id,
      };
      console.log("Unpaid Approval Payload:", payload);

      const res = await fetch("http://localhost:5001/api/academic/leaves/unpaid/upperboard-approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Unpaid Approval Response:", data);

      if (data.success) {
        setMessage({ type: "success", text: data.message || "Unpaid leave processed!" });
        setUnpaidRequestId("");
      } else {
        setMessage({ type: "error", text: data.error || "Failed to process." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upperboard Leave Approvals</h2>
      <p className="text-sm text-gray-600 mb-4">
        Available for: Dean, Vice-dean, President
      </p>

      <Tabs defaultValue="annual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="annual">Annual Leave</TabsTrigger>
          <TabsTrigger value="unpaid">Unpaid Leave</TabsTrigger>
        </TabsList>

        {/* Annual Leave Approval */}
        <TabsContent value="annual">
          <form className="space-y-4" onSubmit={handleAnnualApproval}>
            <div>
              <label className="block mb-1 font-medium">Request ID</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Leave request ID"
                value={annualRequestId}
                onChange={(e) => setAnnualRequestId(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Replacement Employee ID</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Employee ID for replacement"
                value={annualReplacementId}
                onChange={(e) => setAnnualReplacementId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Process Annual Leave"}
            </Button>
          </form>
        </TabsContent>

        {/* Unpaid Leave Approval */}
        <TabsContent value="unpaid">
          <form className="space-y-4" onSubmit={handleUnpaidApproval}>
            <div>
              <label className="block mb-1 font-medium">Request ID</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Leave request ID"
                value={unpaidRequestId}
                onChange={(e) => setUnpaidRequestId(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Process Unpaid Leave"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

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

export default UpperboardApprovals;
