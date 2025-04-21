
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExamSchedule } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast } from 'date-fns';
import { CalendarDays, Clock, FileText, Pencil, Trash } from 'lucide-react';

interface ExamScheduleListProps {
  schedules: ExamSchedule[];
  onEdit?: (schedule: ExamSchedule) => void;
  onDelete?: (id: string) => void;
}

const ExamScheduleList = ({ 
  schedules, 
  onEdit, 
  onDelete 
}: ExamScheduleListProps) => {
  const { isAdmin } = useAuth();
  
  if (schedules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No exam schedules found.</p>
      </div>
    );
  }
  
  // Helper to format date from YYYY-MM-DD to more readable format
  const formatExamDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'EEEE, MMMM do, yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  // Helper to check if an exam is past
  const isExamPast = (dateStr: string) => {
    try {
      const examDate = new Date(dateStr);
      // Setting time to end of day for accurate comparison
      examDate.setHours(23, 59, 59);
      return isPast(examDate);
    } catch (e) {
      return false;
    }
  };
  
  return (
    <div className="space-y-4">
      {schedules.map((schedule) => {
        const examPast = isExamPast(schedule.date);
        
        return (
          <Card 
            key={schedule.id} 
            className={`exam-card ${examPast ? 'opacity-70' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{schedule.examName}</CardTitle>
                {examPast && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Past
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center text-sm">
                  <CalendarDays className="h-4 w-4 mr-2 text-department-gold" />
                  <span>{formatExamDate(schedule.date)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-department-gold" />
                  <span>{schedule.time}</span>
                </div>
              </div>
              
              {schedule.notes && (
                <div className="mt-3 flex items-start">
                  <FileText className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                  <p className="text-sm text-gray-700">{schedule.notes}</p>
                </div>
              )}
            </CardContent>
            
            {isAdmin && onEdit && onDelete && (
              <CardFooter className="pt-2 justify-end">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit(schedule)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onDelete(schedule.id)}
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ExamScheduleList;
