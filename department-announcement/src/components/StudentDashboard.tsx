
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnnouncementList from './AnnouncementList';
import ExamScheduleList from './ExamScheduleList';
import { useAuth } from '@/contexts/AuthContext';
import { 
  mockGetAnnouncements, 
  mockGetExamSchedules, 
  Announcement,
  ExamSchedule 
} from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { BellRing, CalendarDays, Loader2, School } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // Fetch announcements for student's department only
        const { data: announcementData } = await mockGetAnnouncements(user.department);
        setAnnouncements(announcementData || []);
        
        // Fetch all exam schedules
        const { data: scheduleData } = await mockGetExamSchedules();
        setExamSchedules(scheduleData || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-department-blue" />
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-department-blue">
          Student Dashboard
        </h1>
        
        <div className="mt-2 sm:mt-0 flex items-center">
          <School className="h-5 w-5 mr-2 text-department-blue" />
          <span className="mr-2">Department:</span>
          <Badge variant="outline" className="bg-department-blue text-white font-medium">
            {user?.department}
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="announcements">
        <TabsList className="mb-6">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="exams">Exam Schedules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements">
          <h2 className="section-title">
            <BellRing />
            Department Announcements
          </h2>
          
          <AnnouncementList announcements={announcements} />
        </TabsContent>
        
        <TabsContent value="exams">
          <h2 className="section-title">
            <CalendarDays />
            Upcoming Exams
          </h2>
          
          <ExamScheduleList schedules={examSchedules} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
