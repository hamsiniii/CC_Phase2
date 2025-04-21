
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementList from './AnnouncementList';
import ExamScheduleForm from './ExamScheduleForm';
import ExamScheduleList from './ExamScheduleList';
import { useAuth } from '@/contexts/AuthContext';
import { 
  mockGetAnnouncements, 
  mockGetExamSchedules, 
  mockDeleteAnnouncement, 
  mockDeleteExamSchedule,
  Announcement,
  ExamSchedule 
} from '@/lib/supabase';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { BellRing, CalendarDays, Loader2, PlusCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showExamScheduleForm, setShowExamScheduleForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | undefined>(undefined);
  const [selectedExamSchedule, setSelectedExamSchedule] = useState<ExamSchedule | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'announcement' | 'exam' } | null>(null);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch announcements (admin sees all departments)
      const { data: announcementData } = await mockGetAnnouncements();
      setAnnouncements(announcementData || []);
      
      // Fetch exam schedules
      const { data: scheduleData } = await mockGetExamSchedules();
      setExamSchedules(scheduleData || []);
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
  }, []);
  
  const handleCreateAnnouncement = () => {
    setSelectedAnnouncement(undefined);
    setShowAnnouncementForm(true);
  };
  
  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };
  
  const handleCreateExamSchedule = () => {
    setSelectedExamSchedule(undefined);
    setShowExamScheduleForm(true);
  };
  
  const handleEditExamSchedule = (schedule: ExamSchedule) => {
    setSelectedExamSchedule(schedule);
    setShowExamScheduleForm(true);
  };
  
  const confirmDelete = (id: string, type: 'announcement' | 'exam') => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };
  
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'announcement') {
        await mockDeleteAnnouncement(itemToDelete.id);
        toast({
          title: 'Announcement deleted',
          description: 'The announcement has been deleted successfully.'
        });
      } else {
        await mockDeleteExamSchedule(itemToDelete.id);
        toast({
          title: 'Exam schedule deleted',
          description: 'The exam schedule has been deleted successfully.'
        });
      }
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-department-blue" />
      </div>
    );
  }
  
  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold text-department-blue mb-6">
        Admin Dashboard
      </h1>
      
      <Tabs defaultValue="announcements">
        <TabsList className="mb-6">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="exams">Exam Schedules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="announcements">
          {showAnnouncementForm ? (
            <AnnouncementForm
              announcement={selectedAnnouncement}
              onSuccess={() => {
                setShowAnnouncementForm(false);
                fetchData();
              }}
              onCancel={() => setShowAnnouncementForm(false)}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <BellRing />
                  Announcements Management
                </h2>
                <Button 
                  onClick={handleCreateAnnouncement}
                  className="bg-department-blue hover:bg-blue-800"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Announcement
                </Button>
              </div>
              
              <AnnouncementList
                announcements={announcements}
                onEdit={handleEditAnnouncement}
                onDelete={(id) => confirmDelete(id, 'announcement')}
              />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="exams">
          {showExamScheduleForm ? (
            <ExamScheduleForm
              schedule={selectedExamSchedule}
              onSuccess={() => {
                setShowExamScheduleForm(false);
                fetchData();
              }}
              onCancel={() => setShowExamScheduleForm(false)}
            />
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <CalendarDays />
                  Exam Schedules Management
                </h2>
                <Button 
                  onClick={handleCreateExamSchedule}
                  className="bg-department-blue hover:bg-blue-800"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Exam Schedule
                </Button>
              </div>
              
              <ExamScheduleList
                schedules={examSchedules}
                onEdit={handleEditExamSchedule}
                onDelete={(id) => confirmDelete(id, 'exam')}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
