import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2 } from "lucide-react";

interface AttendanceRecord {
  attendance_ID: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_duration: number | null;
  status: string;
  emp_ID: number;
}

const AttendanceYesterday = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5001/api/admin/attendance-yesterday");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch attendance records");
      }

      setAttendance(result.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    
    // Handle time string formats
    const timeStr = String(time);
    
    // If it's in HH:MM:SS or HH:MM format
    if (timeStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
      return timeStr.substring(0, 5);
    }
    
    // If it's an ISO date string or contains 'T', extract time portion
    if (timeStr.includes('T') || timeStr.includes('1970')) {
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    
    return timeStr.substring(0, 5);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDuration = (minutes: number | null) => {
    if (minutes == null) return 'N/A';
    return `${minutes} mins`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading attendance records...</span>
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
        <CardTitle>Yesterday's Attendance Records</CardTitle>
        <CardDescription>
          Attendance records for all employees from yesterday ({attendance.length} records)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {attendance.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendance records found for yesterday
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendance ID</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.attendance_ID}>
                    <TableCell className="font-medium">{record.attendance_ID}</TableCell>
                    <TableCell>{record.emp_ID}</TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>{formatTime(record.check_in_time)}</TableCell>
                    <TableCell>{formatTime(record.check_out_time)}</TableCell>
                    <TableCell>{formatDuration(record.total_duration)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'Attended' ? 'default' : 'secondary'}
                      >
                        {record.status || 'N/A'}
                      </Badge>
                    </TableCell>
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

export default AttendanceYesterday;
