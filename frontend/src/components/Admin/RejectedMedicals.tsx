import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

interface RejectedMedical {
  request_ID: number;
  employee_ID: number;
  employee_name: string;
  from_date: string;
  to_date: string;
  reason: string;
  rejected_at: string;
}

const RejectedMedicals = () => {
  const [rejectedRequests, setRejectedRequests] = useState<RejectedMedical[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRejectedMedicals();
  }, []);

  const fetchRejectedMedicals = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/admin/rejected-medicals");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rejected medical leaves");
      }

      setRejectedRequests(data.rejectedRequests || data);
    } catch (err: any) {
      setError(err.message || "Failed to load rejected medical leaves");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading rejected medical leaves...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejected Medical Leaves</CardTitle>
        <CardDescription>Medical leave requests that were rejected</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Rejected At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejectedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No rejected medical leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                rejectedRequests.map((request) => (
                  <TableRow key={request.request_ID}>
                    <TableCell className="font-medium">{request.request_ID}</TableCell>
                    <TableCell>{request.employee_ID}</TableCell>
                    <TableCell>{request.employee_name}</TableCell>
                    <TableCell>{formatDate(request.from_date)}</TableCell>
                    <TableCell>{formatDate(request.to_date)}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>{formatDate(request.rejected_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RejectedMedicals;
