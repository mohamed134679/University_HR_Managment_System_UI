import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Performance from "@/components/Academic/Performance";
import Attendance from "@/components/Academic/Attendance";
import Payroll from "@/components/Academic/Payroll";
import Deductions from "@/components/Academic/Deductions";
import ApplyLeave from "@/components/Academic/ApplyLeave";
import LeaveStatus from "@/components/Academic/LeaveStatus";
import UpperboardApprovals from "@/components/Academic/UpperboardApprovals";
import DeanEvaluation from "@/components/Academic/DeanEvaluation";

const AcademicDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const userData = JSON.parse(storedUser);
    if (userData.userType !== "academic") {
      navigate("/login");
      return;
    }
    setUser(userData);
    
    // Fetch user role
    const fetchUserRole = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/academic/user-role?employeeId=${userData.id}`);
        const data = await res.json();
        if (data.success) {
          setUserRole(data.role);
        }
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
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
              <h1 className="text-2xl font-bold">Academic Dashboard</h1>
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
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className={`grid w-full ${userRole === 'Dean' ? 'grid-cols-8' : (userRole === 'Vice Dean' || userRole === 'President') ? 'grid-cols-7' : 'grid-cols-6'}`}>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="apply-leave">Apply Leave</TabsTrigger>
            <TabsTrigger value="leave-status">Leave Status</TabsTrigger>
            {(userRole === 'Dean' || userRole === 'Vice Dean' || userRole === 'President') && (
              <>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                {userRole === 'Dean' && <TabsTrigger value="evaluation">Evaluation</TabsTrigger>}
              </>
            )}
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <Performance user={user} />
          </TabsContent>
          <TabsContent value="attendance" className="space-y-6">
            <Attendance user={user} />
          </TabsContent>
          <TabsContent value="payroll" className="space-y-6">
            <Payroll user={user} />
          </TabsContent>
          <TabsContent value="deductions" className="space-y-6">
            <Deductions user={user} />
          </TabsContent>
          <TabsContent value="apply-leave" className="space-y-6">
            <ApplyLeave user={user} />
          </TabsContent>
          <TabsContent value="leave-status" className="space-y-6">
            <LeaveStatus user={user} />
          </TabsContent>
          {(userRole === 'Dean' || userRole === 'Vice Dean' || userRole === 'President') && (
            <TabsContent value="approvals" className="space-y-6">
              <UpperboardApprovals user={user} />
            </TabsContent>
          )}
          {userRole === 'Dean' && (
            <TabsContent value="evaluation" className="space-y-6">
              <DeanEvaluation user={user} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AcademicDashboard;