import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, LogOut, CheckCircle2, XCircle } from "lucide-react";
import LeavesApproval from "@/components/HR/LeavesApproval";
import DeductionsManagement from "@/components/HR/DeductionsManagement";
import PayrollGeneration from "@/components/HR/PayrollGeneration";

const HRDashboard = () => {
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
    if (userData.userType !== "hr") {
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              HR Management Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-1">Will show pending count</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Approved Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-1">Will show approved count</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejected Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-1">Will show rejected count</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Functionalities */}
        <Tabs defaultValue="leaves" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="leaves">Leave Approvals</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          {/* Leaves Approval Tab */}
          <TabsContent value="leaves" className="space-y-6">
            <LeavesApproval hrId={user?.id} />
          </TabsContent>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-6">
            <DeductionsManagement hrId={user?.id} />
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <PayrollGeneration hrId={user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HRDashboard;
