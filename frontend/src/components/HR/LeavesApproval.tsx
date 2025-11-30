import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface LeaveRequest {
  requestId: number;
  employeeId: number;
  employeeName: string;
  leaveType: "annual" | "accidental" | "unpaid" | "compensation";
  startDate: string;
  endDate: string;
  numDays: number;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  employeeBalance?: number;
  requiredBalance?: number;
}

interface LeavesApprovalProps {
  hrId: number;
}

const LeavesApproval = ({ hrId }: LeavesApprovalProps) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingLeaves();
  }, [hrId]);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      // TODO: Implement backend endpoint to fetch pending leaves
      // const response = await fetch(`http://localhost:5001/api/hr/leaves/pending?hrId=${hrId}`);
      // const data = await response.json();
      // setLeaves(data);
      setLeaves([]);
    } catch (err) {
      setError("Failed to fetch pending leaves");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number, leaveType: string) => {
    try {
      // TODO: Implement backend endpoint for approving leaves
      // const response = await fetch(`http://localhost:5001/api/hr/leaves/approve`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ requestId, hrId, leaveType }),
      // });
      console.log(`Approved ${leaveType} leave request ${requestId}`);
      fetchPendingLeaves();
    } catch (err) {
      setError("Failed to approve leave");
    }
  };

  const handleReject = async (requestId: number, leaveType: string) => {
    try {
      // TODO: Implement backend endpoint for rejecting leaves
      // const response = await fetch(`http://localhost:5001/api/hr/leaves/reject`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ requestId, hrId, leaveType }),
      // });
      console.log(`Rejected ${leaveType} leave request ${requestId}`);
      fetchPendingLeaves();
    } catch (err) {
      setError("Failed to reject leave");
    }
  };

  const LeaveCard = ({ leave }: { leave: LeaveRequest }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{leave.employeeName}</CardTitle>
            <CardDescription>Employee ID: {leave.employeeId}</CardDescription>
          </div>
          <Badge
            variant={
              leave.leaveType === "annual"
                ? "default"
                : leave.leaveType === "accidental"
                ? "secondary"
                : leave.leaveType === "unpaid"
                ? "outline"
                : "destructive"
            }
          >
            {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
            </div>
          </div>

          {leave.numDays && (
            <div className="p-2 bg-muted rounded">
              <p className="text-sm font-medium">Duration: {leave.numDays} days</p>
            </div>
          )}

          {leave.employeeBalance !== undefined && (
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground">
                Current Balance: <span className="font-bold">{leave.employeeBalance}</span> days
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleApprove(leave.requestId, leave.leaveType)}
              className="flex-1 gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(leave.requestId, leave.leaveType)}
              className="flex-1 gap-1"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="all" className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All Pending</TabsTrigger>
        <TabsTrigger value="annual">Annual</TabsTrigger>
        <TabsTrigger value="accidental">Accidental</TabsTrigger>
        <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
        <TabsTrigger value="compensation">Compensation</TabsTrigger>
      </TabsList>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading pending leaves...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No pending leave requests</p>
        </div>
      ) : (
        <>
          <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves.map((leave) => (
              <LeaveCard key={leave.requestId} leave={leave} />
            ))}
          </TabsContent>

          <TabsContent value="annual" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves
              .filter((l) => l.leaveType === "annual")
              .map((leave) => (
                <LeaveCard key={leave.requestId} leave={leave} />
              ))}
          </TabsContent>

          <TabsContent value="accidental" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves
              .filter((l) => l.leaveType === "accidental")
              .map((leave) => (
                <LeaveCard key={leave.requestId} leave={leave} />
              ))}
          </TabsContent>

          <TabsContent value="unpaid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves
              .filter((l) => l.leaveType === "unpaid")
              .map((leave) => (
                <LeaveCard key={leave.requestId} leave={leave} />
              ))}
          </TabsContent>

          <TabsContent value="compensation" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaves
              .filter((l) => l.leaveType === "compensation")
              .map((leave) => (
                <LeaveCard key={leave.requestId} leave={leave} />
              ))}
          </TabsContent>
        </>
      )}
    </Tabs>
  );
};

export default LeavesApproval;
