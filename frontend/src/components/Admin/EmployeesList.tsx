import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";

interface Employee {
  employee_ID: number;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  address: string;
  years_of_experience: number;
  official_day_off: string;
  type_of_contract: string;
  employment_status: string;
  annual_balance: number;
  accidental_balance: number;
}

const EmployeesList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/admin/employees");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch employees");
      }
      
      setEmployees(data.employees || data);
    } catch (err: any) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading employees...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
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
        <CardTitle>All Employees</CardTitle>
        <CardDescription>Complete list of all employees in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Experience (Years)</TableHead>
                <TableHead>Day Off</TableHead>
                <TableHead>Contract Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Annual Balance</TableHead>
                <TableHead>Accidental Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.employee_ID}>
                    <TableCell className="font-medium">{emp.employee_ID || 'N/A'}</TableCell>
                    <TableCell>{emp.first_name && emp.last_name ? `${emp.first_name} ${emp.last_name}` : 'N/A'}</TableCell>
                    <TableCell>{emp.gender || 'N/A'}</TableCell>
                    <TableCell>{emp.email || 'N/A'}</TableCell>
                    <TableCell>{emp.years_of_experience ?? 'N/A'}</TableCell>
                    <TableCell>{emp.official_day_off || 'N/A'}</TableCell>
                    <TableCell>{emp.type_of_contract || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        emp.employment_status === 'active' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        {emp.employment_status || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>{emp.annual_balance ?? 'N/A'}</TableCell>
                    <TableCell>{emp.accidental_balance ?? 'N/A'}</TableCell>
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

export default EmployeesList;
