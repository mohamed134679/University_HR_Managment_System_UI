import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Users, Building2 } from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
  const [stats, setStats] = useState<{ employees: number; departments: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/stats/counts");
        const data = await response.json();
        console.log("Stats API response:", data);
        if (data.success) {
          console.log("Setting stats:", { employees: data.employees, departments: data.departments });
          setStats({ employees: data.employees, departments: data.departments });
        } else {
          console.error("API returned success: false");
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="text-center max-w-2xl space-y-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-4 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-xl">
            <GraduationCap className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold leading-tight">
            German University in Cairo
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              HR Management System
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            A comprehensive solution for managing university human resources, attendance, and employee operations.
          </p>
        </div>

        {!loading && stats && (
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto pt-4">
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Employees</p>
              </div>
              <p className="text-3xl font-bold">{stats.employees}</p>
            </div>
            <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
              </div>
              <p className="text-3xl font-bold">{stats.departments}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center pt-4">
          <Link to="/login">
            <Button variant="login" size="lg" className="gap-2 h-12 px-8">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="h-12 px-8">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;

