import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import EmployeesList from "@/components/Admin/EmployeesList";
import DepartmentStats from "@/components/Admin/DepartmentStats";
import RejectedMedicals from "@/components/Admin/RejectedMedicals";
import AdminActions from "@/components/Admin/AdminActions";
import AttendanceYesterday from "@/components/Admin/AttendanceYesterday";
import PerformanceWinter from "@/components/Admin/PerformanceWinter";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.userType !== "admin") {
      navigate("/login");
      return;
    }

    setUser(userData);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{user?.department}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="employees" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="medical">Medical Leaves</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="actions">Admin Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <EmployeesList />
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <DepartmentStats />
          </TabsContent>

          <TabsContent value="medical" className="space-y-6">
            <RejectedMedicals />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceYesterday />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceWinter />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <AdminActions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
