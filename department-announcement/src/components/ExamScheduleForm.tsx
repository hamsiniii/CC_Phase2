
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { mockCreateExamSchedule, mockUpdateExamSchedule, ExamSchedule } from '@/lib/supabase';
import { AlertCircle, Calendar, Clock, Loader2 } from 'lucide-react';

interface ExamScheduleFormProps {
  schedule?: ExamSchedule;
  onSuccess: () => void;
  onCancel: () => void;
}

const ExamScheduleForm = ({ schedule, onSuccess, onCancel }: ExamScheduleFormProps) => {
  const [examName, setExamName] = useState(schedule?.examName || '');
  const [date, setDate] = useState(schedule?.date || '');
  const [time, setTime] = useState(schedule?.time || '');
  const [notes, setNotes] = useState(schedule?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const isEditing = !!schedule;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!examName || !date || !time) {
      setError('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create or update exam schedule
      if (isEditing && schedule) {
        await mockUpdateExamSchedule(schedule.id, {
          examName,
          date,
          time,
          notes
        });
        
        toast({
          title: 'Exam schedule updated',
          description: 'The exam schedule has been updated successfully.'
        });
      } else {
        await mockCreateExamSchedule({
          examName,
          date,
          time,
          notes
        });
        
        toast({
          title: 'Exam schedule created',
          description: 'The exam schedule has been created successfully.'
        });
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error submitting exam schedule:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Exam Schedule' : 'Create New Exam Schedule'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="examName" className="block text-sm font-medium">
              Exam Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="examName"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Enter exam name"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="block text-sm font-medium">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="time" className="block text-sm font-medium">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter additional information about the exam"
              rows={3}
            />
          </div>
          
          {error && (
            <div className="flex items-center p-3 text-sm text-red-500 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-department-blue hover:bg-blue-800"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Exam Schedule' : 'Create Exam Schedule'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExamScheduleForm;
