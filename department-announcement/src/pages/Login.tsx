
import React from 'react';
import LoginForm from '@/components/LoginForm';
import { School } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="department-header">
        <div className="container mx-auto flex items-center justify-center sm:justify-start">
          <School className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold">University Department Portal</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <LoginForm />
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>&copy; 2025 University Department Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
