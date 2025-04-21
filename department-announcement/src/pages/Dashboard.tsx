
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/AdminDashboard';
import StudentDashboard from '@/components/StudentDashboard';
import { Button } from '@/components/ui/button';
import { LogOut, School } from 'lucide-react';

const Dashboard = () => {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl font-semibold text-department-blue">
          Loading...
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="department-header">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <School className="h-6 w-6 mr-2" />
            <h1 className="text-xl font-bold hidden sm:block">University Department Portal</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm opacity-80">Logged in as</div>
              <div className="font-medium">
                {user.username} ({isAdmin ? 'Admin' : 'Student'})
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={logout}
              className="text-white hover:bg-blue-800"
            >
              <LogOut className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {isAdmin ? <AdminDashboard /> : <StudentDashboard />}
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
        <div className="container mx-auto">
          <p>&copy; 2025 University Department Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
