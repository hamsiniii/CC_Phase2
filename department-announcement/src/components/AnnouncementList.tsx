
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Announcement } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, ImageIcon, Pencil, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementListProps {
  announcements: Announcement[];
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
}

const AnnouncementList = ({ 
  announcements, 
  onEdit, 
  onDelete 
}: AnnouncementListProps) => {
  const { isAdmin } = useAuth();
  
  if (announcements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No announcements found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className="announcement-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{announcement.title}</CardTitle>
              <Badge className="bg-department-blue">{announcement.department}</Badge>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {formatDistanceToNow(new Date(announcement.postingDate), { addSuffix: true })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="whitespace-pre-line">{announcement.description}</p>
            
            {announcement.attachmentUrl && (
              <div className="mt-3">
                {announcement.attachmentType?.includes('image') ? (
                  <div className="attachment-preview">
                    <img 
                      src={announcement.attachmentUrl} 
                      alt="Attachment" 
                      className="image-attachment max-h-64" 
                    />
                  </div>
                ) : announcement.attachmentType?.includes('pdf') ? (
                  <a 
                    href={announcement.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="pdf-attachment"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    <span>
                      {announcement.attachmentName || 'View PDF Document'}
                    </span>
                  </a>
                ) : null}
              </div>
            )}
          </CardContent>
          
          {isAdmin && onEdit && onDelete && (
            <CardFooter className="pt-2 justify-end">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onEdit(announcement)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDelete(announcement.id)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
};

export default AnnouncementList;
