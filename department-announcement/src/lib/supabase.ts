import { createClient } from '@supabase/supabase-js';
import { supabase as supabaseClient } from '@/integrations/supabase/client';

// Use the actual Supabase client from the integration if present
export const supabase = supabaseClient;

// Mock functions for development before Supabase integration
const MOCK_USERS = [
  { id: '1', username: 'admin1', password: 'adminpass', role: 'admin', department: 'All' },
  { id: '2', username: 'JamesWilson', password: 'jw2025cs', role: 'student', department: 'Computer Science' },
  { id: '3', username: 'EmmaClark', password: 'ec1998pwd', role: 'student', department: 'Computer Science' },
  { id: '30', username: 'GabrielYoung', password: 'gy2468pwd', role: 'student', department: 'Mathematics' }
];

const MOCK_ANNOUNCEMENTS = [
  {
    id: '1',
    title: 'Department Meeting',
    description: 'There will be a department meeting on Friday at 2 PM in Room 302.',
    department: 'Computer Science',
    postingDate: '2025-04-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Lab Closure',
    description: 'The Physics lab will be closed for maintenance next Monday.',
    department: 'Physics',
    postingDate: '2025-04-12T14:30:00Z'
  },
  {
    id: '3',
    title: 'Guest Lecture',
    description: 'Professor Smith from MIT will give a guest lecture on Advanced Materials on Wednesday at 3 PM.',
    department: 'Mechanical Engineering',
    postingDate: '2025-04-08T09:15:00Z'
  }
];

const MOCK_EXAM_SCHEDULES = [
  {
    id: '1',
    examName: 'Introduction to Programming',
    date: '2025-05-15',
    time: '10:00 AM',
    notes: 'Bring your student ID and a calculator.'
  },
  {
    id: '2',
    examName: 'Mechanics',
    date: '2025-05-18',
    time: '2:00 PM',
    notes: 'Closed book exam. Calculators permitted.'
  },
  {
    id: '3',
    examName: 'Thermodynamics',
    date: '2025-05-20',
    time: '9:00 AM',
    notes: 'Open book exam. Bring your textbook.'
  }
];

// Mock authentication function
export const mockSignIn = async (username: string, password: string) => {
  // First, try using real Supabase if available
  try {
    // Query the users table in Supabase
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, department')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (data) {
      return {
        data: {
          user: data
        },
        error: null
      };
    }
    
    if (error && error.code !== 'PGRST116') { // Only return error if it's not "no rows returned"
      console.error('Supabase error:', error);
    }
  } catch (e) {
    console.log('Using mock authentication fallback', e);
  }
  
  // Fallback to mock authentication using the latest inserted users
  const MOCK_USERS = [
    { id: '1', username: 'admin1', password: 'adminpass', role: 'admin', department: 'All' },
    { id: '2', username: 'JamesWilson', password: 'jw2025cs', role: 'student', department: 'Computer Science' },
    { id: '3', username: 'EmmaClark', password: 'ec1998pwd', role: 'student', department: 'Computer Science' },
    { id: '30', username: 'GabrielYoung', password: 'gy2468pwd', role: 'student', department: 'Mathematics' }
  ];
  
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  
  if (user) {
    return {
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          department: user.department
        }
      },
      error: null
    };
  }
  
  return {
    data: null,
    error: { message: 'Invalid login credentials' }
  };
};

// Mock function to get announcements
export const mockGetAnnouncements = async (department?: string) => {
  // First, try using real Supabase if available
  try {
    let query = supabase.from('announcements').select('*');
    
    if (department && department !== 'All') {
      query = query.eq('department', department);
    }
    
    const { data, error } = await query.order('posting_date', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
    } else if (data && data.length > 0) {
      // Map the database column names to our TypeScript interface names
      const formattedData = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        department: item.department,
        attachmentUrl: item.attachment_url,
        attachmentType: item.attachment_type,
        attachmentName: item.attachment_name,
        postingDate: item.posting_date
      }));
      
      return {
        data: formattedData,
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock announcements fallback', e);
  }
  
  // Fallback to mock data
  let announcements = [...MOCK_ANNOUNCEMENTS];
  
  // Sort by posting date (newest first)
  announcements.sort((a, b) => 
    new Date(b.postingDate).getTime() - new Date(a.postingDate).getTime()
  );
  
  // Filter by department if provided
  if (department && department !== 'All') {
    announcements = announcements.filter(a => a.department === department);
  }
  
  return {
    data: announcements,
    error: null
  };
};

// Mock function to create an announcement
export const mockCreateAnnouncement = async (announcement: Omit<Announcement, 'id' | 'postingDate'>) => {
  // First, try using real Supabase if available
  try {
    // Map our TypeScript interface to the database column names
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        title: announcement.title,
        description: announcement.description,
        department: announcement.department,
        attachment_url: announcement.attachmentUrl,
        attachment_type: announcement.attachmentType,
        attachment_name: announcement.attachmentName
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
    } else if (data) {
      // Map the database column names back to our TypeScript interface names
      return {
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          department: data.department,
          attachmentUrl: data.attachment_url,
          attachmentType: data.attachment_type,
          attachmentName: data.attachment_name,
          postingDate: data.posting_date
        },
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock announcement creation fallback', e);
  }
  
  // Fallback to mock data
  const newAnnouncement = {
    id: (MOCK_ANNOUNCEMENTS.length + 1).toString(),
    ...announcement,
    postingDate: new Date().toISOString()
  };
  
  MOCK_ANNOUNCEMENTS.push(newAnnouncement);
  
  return {
    data: newAnnouncement,
    error: null
  };
};

// Mock function to update an announcement
export const mockUpdateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
  // First, try using real Supabase if available
  try {
    // Map our TypeScript interface to the database column names
    const updates_db: any = {};
    if (updates.title) updates_db.title = updates.title;
    if (updates.description) updates_db.description = updates.description;
    if (updates.department) updates_db.department = updates.department;
    if (updates.attachmentUrl !== undefined) updates_db.attachment_url = updates.attachmentUrl;
    if (updates.attachmentType !== undefined) updates_db.attachment_type = updates.attachmentType;
    if (updates.attachmentName !== undefined) updates_db.attachment_name = updates.attachmentName;
    
    const { data, error } = await supabase
      .from('announcements')
      .update(updates_db)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
    } else if (data) {
      // Map the database column names back to our TypeScript interface names
      return {
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          department: data.department,
          attachmentUrl: data.attachment_url,
          attachmentType: data.attachment_type,
          attachmentName: data.attachment_name,
          postingDate: data.posting_date
        },
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock announcement update fallback', e);
  }
  
  // Fallback to mock data
  const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
  
  if (index !== -1) {
    MOCK_ANNOUNCEMENTS[index] = {
      ...MOCK_ANNOUNCEMENTS[index],
      ...updates
    };
    
    return {
      data: MOCK_ANNOUNCEMENTS[index],
      error: null
    };
  }
  
  return {
    data: null,
    error: { message: 'Announcement not found' }
  };
};

// Mock function to delete an announcement
export const mockDeleteAnnouncement = async (id: string) => {
  // First, try using real Supabase if available
  try {
    const { data, error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') { // ignore "no rows returned" error
      console.error('Supabase error:', error);
      return {
        data: null,
        error
      };
    } else if (data) {
      // Map the database column names back to our TypeScript interface names
      return {
        data: {
          id: data.id,
          title: data.title,
          description: data.description,
          department: data.department,
          attachmentUrl: data.attachment_url,
          attachmentType: data.attachment_type,
          attachmentName: data.attachment_name,
          postingDate: data.posting_date
        },
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock announcement deletion fallback', e);
  }
  
  // Fallback to mock data
  const index = MOCK_ANNOUNCEMENTS.findIndex(a => a.id === id);
  
  if (index !== -1) {
    const deleted = MOCK_ANNOUNCEMENTS.splice(index, 1)[0];
    
    return {
      data: deleted,
      error: null
    };
  }
  
  return {
    data: null,
    error: { message: 'Announcement not found' }
  };
};

// Mock function to get exam schedules
export const mockGetExamSchedules = async () => {
  // First, try using real Supabase if available
  try {
    const { data, error } = await supabase
      .from('exam_schedules')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Supabase error:', error);
    } else if (data && data.length > 0) {
      // Map the database column names to our TypeScript interface names
      const formattedData = data.map(item => ({
        id: item.id,
        examName: item.exam_name,
        date: item.date,
        time: item.time,
        notes: item.notes || ''
      }));
      
      return {
        data: formattedData,
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock exam schedules fallback', e);
  }
  
  // Fallback to mock data
  // Sort by date (upcoming first)
  const schedules = [...MOCK_EXAM_SCHEDULES].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return {
    data: schedules,
    error: null
  };
};

// Mock function to create an exam schedule
export const mockCreateExamSchedule = async (schedule: Omit<ExamSchedule, 'id'>) => {
  // First, try using real Supabase if available
  try {
    const { data, error } = await supabase
      .from('exam_schedules')
      .insert({
        exam_name: schedule.examName,
        date: schedule.date,
        time: schedule.time,
        notes: schedule.notes
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
    } else if (data) {
      return {
        data: {
          id: data.id,
          examName: data.exam_name,
          date: data.date,
          time: data.time,
          notes: data.notes || ''
        },
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock exam schedule creation fallback', e);
  }
  
  // Fallback to mock data
  const newSchedule = {
    id: (MOCK_EXAM_SCHEDULES.length + 1).toString(),
    ...schedule
  };
  
  MOCK_EXAM_SCHEDULES.push(newSchedule);
  
  return {
    data: newSchedule,
    error: null
  };
};

// Mock function to update an exam schedule
export const mockUpdateExamSchedule = async (id: string, updates: Partial<ExamSchedule>) => {
  // First, try using real Supabase if available
  try {
    const updates_db: any = {};
    if (updates.examName) updates_db.exam_name = updates.examName;
    if (updates.date) updates_db.date = updates.date;
    if (updates.time) updates_db.time = updates.time;
    if (updates.notes !== undefined) updates_db.notes = updates.notes;
    
    const { data, error } = await supabase
      .from('exam_schedules')
      .update(updates_db)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
    } else if (data) {
      return {
        data: {
          id: data.id,
          examName: data.exam_name,
          date: data.date,
          time: data.time,
          notes: data.notes || ''
        },
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock exam schedule update fallback', e);
  }
  
  // Fallback to mock data
  const index = MOCK_EXAM_SCHEDULES.findIndex(s => s.id === id);
  
  if (index !== -1) {
    MOCK_EXAM_SCHEDULES[index] = {
      ...MOCK_EXAM_SCHEDULES[index],
      ...updates
    };
    
    return {
      data: MOCK_EXAM_SCHEDULES[index],
      error: null
    };
  }
  
  return {
    data: null,
    error: { message: 'Exam schedule not found' }
  };
};

// Mock function to delete an exam schedule
export const mockDeleteExamSchedule = async (id: string) => {
  // First, try using real Supabase if available
  try {
    const { data, error } = await supabase
      .from('exam_schedules')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error && error.code !== 'PGRST116') { // ignore "no rows returned" error
      console.error('Supabase error:', error);
    } else if (data) {
      return {
        data: {
          id: data.id,
          examName: data.exam_name,
          date: data.date,
          time: data.time,
          notes: data.notes || ''
        },
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock exam schedule deletion fallback', e);
  }
  
  // Fallback to mock data
  const index = MOCK_EXAM_SCHEDULES.findIndex(s => s.id === id);
  
  if (index !== -1) {
    const deleted = MOCK_EXAM_SCHEDULES.splice(index, 1)[0];
    
    return {
      data: deleted,
      error: null
    };
  }
  
  return {
    data: null,
    error: { message: 'Exam schedule not found' }
  };
};

// Mock function to upload a file
export const mockUploadFile = async (file: File) => {
  // Try to use real Supabase storage if available
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('announcement-attachments')
      .upload(filePath, file);
    
    if (error) {
      console.error('Supabase storage error:', error);
    } else if (data) {
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('announcement-attachments')
        .getPublicUrl(data.path);
      
      return {
        data: {
          path: publicUrl,
          fullPath: publicUrl,
          name: file.name,
          type: file.type
        },
        error: null
      };
    }
  } catch (e) {
    console.log('Using mock file upload fallback', e);
  }
  
  // Fallback to mock upload with object URL
  const url = URL.createObjectURL(file);
  
  return {
    data: {
      path: url,
      fullPath: url,
      name: file.name,
      type: file.type
    },
    error: null
  };
};

export type Announcement = typeof MOCK_ANNOUNCEMENTS[0] & {
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
};
export type ExamSchedule = typeof MOCK_EXAM_SCHEDULES[0];
