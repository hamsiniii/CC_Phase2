
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DEPARTMENTS } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { mockCreateAnnouncement, mockUpdateAnnouncement, mockUploadFile, Announcement } from '@/lib/supabase';
import { AlertCircle, FileText, ImageIcon, Loader2, X } from 'lucide-react';

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSuccess: () => void;
  onCancel: () => void;
}

const AnnouncementForm = ({ announcement, onSuccess, onCancel }: AnnouncementFormProps) => {
  const [title, setTitle] = useState(announcement?.title || '');
  const [description, setDescription] = useState(announcement?.description || '');
  const [department, setDepartment] = useState(announcement?.department || '');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(announcement?.attachmentUrl || null);
  const [fileName, setFileName] = useState<string | null>(announcement?.attachmentName || null);
  const [fileType, setFileType] = useState<string | null>(announcement?.attachmentType || null);
  
  const isEditing = !!announcement;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      return;
    }
    
    // Check if file is PDF or image
    if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('image')) {
      setError('Only PDF or image files are allowed');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileType(selectedFile.type);
    setError('');
    
    // Create preview URL for images
    if (selectedFile.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For PDFs, just show the filename
      setFilePreview(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title || !description || !department) {
      setError('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let attachmentUrl = announcement?.attachmentUrl;
      let attachmentType = announcement?.attachmentType;
      let attachmentName = announcement?.attachmentName;
      
      // Upload file if a new one is selected
      if (file) {
        const { data, error: uploadError } = await mockUploadFile(file);
        
        if (uploadError) {
          setError(uploadError.message || 'File upload failed');
          setIsSubmitting(false);
          return;
        }
        
        attachmentUrl = data.path;
        attachmentType = file.type;
        attachmentName = file.name;
      }
      
      // Create or update announcement
      if (isEditing && announcement) {
        await mockUpdateAnnouncement(announcement.id, {
          title,
          description,
          department,
          attachmentUrl,
          attachmentType,
          attachmentName
        });
        
        toast({
          title: 'Announcement updated',
          description: 'The announcement has been updated successfully.'
        });
      } else {
        await mockCreateAnnouncement({
          title,
          description,
          department,
          attachmentUrl,
          attachmentType,
          attachmentName
        });
        
        toast({
          title: 'Announcement created',
          description: 'The announcement has been created successfully.'
        });
      }
      
      onSuccess();
    } catch (err) {
      console.error('Error submitting announcement:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileName(null);
    setFileType(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter announcement title"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="department" className="block text-sm font-medium">
              Department <span className="text-red-500">*</span>
            </label>
            <Select
              value={department}
              onValueChange={setDepartment}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter announcement details"
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="attachment" className="block text-sm font-medium">
              Attachment (PDF or Image, max 5MB)
            </label>
            <Input
              id="attachment"
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            
            {/* File preview */}
            {(filePreview || fileName) && (
              <div className="attachment-preview">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Attachment Preview:</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {filePreview && fileType?.includes('image') ? (
                  <img src={filePreview} alt="Preview" className="image-attachment max-h-40" />
                ) : (
                  <div className="pdf-attachment">
                    <FileText className="h-5 w-5 mr-2" />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>
            )}
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
            isEditing ? 'Update Announcement' : 'Create Announcement'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnnouncementForm;
