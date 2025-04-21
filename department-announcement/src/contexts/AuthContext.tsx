
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { mockSignIn } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored session on load
    const storedUser = localStorage.getItem('dept-board-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('dept-board-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, we would use Supabase auth
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: username,
      //   password,
      // });
      
      // For now, use our mock function
      const { data, error } = await mockSignIn(username, password);
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      if (data?.user) {
        setUser(data.user as User);
        localStorage.setItem('dept-board-user', JSON.stringify(data.user));
        toast({
          title: 'Login successful',
          description: `Welcome, ${username}!`,
        });
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dept-board-user');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
