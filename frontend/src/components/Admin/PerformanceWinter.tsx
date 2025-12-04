import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2 } from "lucide-react";

interface PerformanceRecord {
  performance_ID: number;
  rating: number;
  comments: string | null;
  semester: string;
  emp_ID: number;
}

const PerformanceWinter = () => {
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5001/api/admin/performance-winter");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch performance records");
      }

      setPerformance(result.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch performance records");
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rating >= 3) return <Badge className="bg-blue-500">Good</Badge>;
    if (rating >= 2) return <Badge className="bg-yellow-500">Fair</Badge>;
    return <Badge variant="destructive">Poor</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading performance records...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-red-900 dark:text-red-200">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Winter Semester Performance Records</CardTitle>
        <CardDescription>
          Performance details for all employees in all Winter semesters ({performance.length} records)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {performance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No performance records found for Winter semesters
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Performance ID</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.map((record) => (
                  <TableRow key={record.performance_ID}>
                    <TableCell className="font-medium">{record.performance_ID}</TableCell>
                    <TableCell>{record.emp_ID}</TableCell>
                    <TableCell>{record.semester || 'N/A'}</TableCell>
                    <TableCell>{record.rating ?? 'N/A'}</TableCell>
                    <TableCell>{getRatingBadge(record.rating)}</TableCell>
                    <TableCell>{record.comments || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceWinter;
