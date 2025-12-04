import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface RejectedMedical {
  request_ID: number;
  insurance_status: boolean;
  disability_details: string | null;
  type: string;
  Emp_ID: number;
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
                <TableHead>Type</TableHead>
                <TableHead>Insurance Status</TableHead>
                <TableHead>Disability Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejectedRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No rejected medical leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                rejectedRequests.map((request) => (
                  <TableRow key={request.request_ID}>
                    <TableCell className="font-medium">{request.request_ID || 'N/A'}</TableCell>
                    <TableCell>{request.Emp_ID || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={request.type === "sick" ? "secondary" : "default"}>
                        {request.type || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={request.insurance_status ? "default" : "destructive"}>
                        {request.insurance_status != null ? (request.insurance_status ? "Covered" : "Not Covered") : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.disability_details || "N/A"}</TableCell>
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
