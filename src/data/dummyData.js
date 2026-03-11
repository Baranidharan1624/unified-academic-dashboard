// Dummy Students Data
export const dummyStudents = [
  {
    id: 1,
    registerNumber: '22CSR001',
    name: 'Arun Kumar',
    email: 'arun.kumar@campusone.edu',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '9876543210',
    cgpa: 8.7,
    attendance: 92,
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arun',
    dob: '2004-05-15',
    address: '123, Main Road, Chennai'
  },
  {
    id: 2,
    registerNumber: '22CSR002',
    name: 'Priya Sharma',
    email: 'priya.sharma@campusone.edu',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '9876543211',
    cgpa: 9.1,
    attendance: 95,
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    dob: '2004-08-22',
    address: '456, Park Avenue, Coimbatore'
  },
  {
    id: 3,
    registerNumber: '22CSR003',
    name: 'Mohammad Rizwan',
    email: 'rizwan@campusone.edu',
    department: 'CSE',
    year: 'III',
    section: 'B',
    mobile: '9876543212',
    cgpa: 7.8,
    attendance: 88,
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rizwan',
    dob: '2004-02-10',
    address: '789, Temple Street, Madurai'
  },
  {
    id: 4,
    registerNumber: '22CSR004',
    name: 'Lakshmi Devi',
    email: 'lakshmi.devi@campusone.edu',
    department: 'CSE',
    year: 'III',
    section: 'B',
    mobile: '9876543213',
    cgpa: 8.9,
    attendance: 90,
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lakshmi',
    dob: '2004-11-30',
    address: '321, Gandhi Nagar, Salem'
  },
  {
    id: 5,
    registerNumber: '22CSR005',
    name: 'Vijay Kumar',
    email: 'vijay.kumar@campusone.edu',
    department: 'CSE',
    year: 'III',
    section: 'A',
    mobile: '9876543214',
    cgpa: 7.5,
    attendance: 82,
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vijay',
    dob: '2004-07-18',
    address: '654, Railway Station Road, Trichy'
  }
]

// Dummy Faculty Data
export const dummyFaculty = [
  {
    id: 1,
    facultyId: 'FAC001',
    name: 'Dr. R. Suresh Kumar',
    email: 'suresh.kumar@campusone.edu',
    department: 'CSE',
    designation: 'Professor & HOD',
    mobile: '9988776655',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
    specialization: 'Artificial Intelligence',
    experience: '15 years',
    status: 'active'
  },
  {
    id: 2,
    facultyId: 'FAC002',
    name: 'Dr. M. Kavitha',
    email: 'kavitha@campusone.edu',
    department: 'CSE',
    designation: 'Associate Professor',
    mobile: '9988776656',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavitha',
    specialization: 'Machine Learning',
    experience: '10 years',
    status: 'active'
  },
  {
    id: 3,
    facultyId: 'FAC003',
    name: 'Mr. A. Bharathi',
    email: 'bharathi@campusone.edu',
    department: 'CSE',
    designation: 'Assistant Professor',
    mobile: '9988776657',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bharathi',
    specialization: 'Data Structures',
    experience: '5 years',
    status: 'active'
  },
  {
    id: 4,
    facultyId: 'FAC004',
    name: 'Ms. S. Divya',
    email: 'divya@campusone.edu',
    department: 'CSE',
    designation: 'Assistant Professor',
    mobile: '9988776658',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Divya',
    specialization: 'Computer Networks',
    experience: '4 years',
    status: 'active'
  },
  {
    id: 5,
    facultyId: 'FAC005',
    name: 'Dr. P. Murugan',
    email: 'murugan@campusone.edu',
    department: 'CSE',
    designation: 'Professor',
    mobile: '9988776659',
    profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Murugan',
    specialization: 'Database Systems',
    experience: '12 years',
    status: 'active'
  }
]

// Dummy Announcements
export const dummyAnnouncements = [
  {
    id: 1,
    title: 'Mid Semester Examination Schedule',
    message: 'The mid semester examinations will be conducted from 15th March 2024 to 25th March 2024. All students are advised to prepare accordingly.',
    sender: 'Dr. R. Suresh Kumar',
    senderRole: 'HOD',
    targetType: 'department',
    target: 'CSE',
    date: '2024-02-28',
    priority: 'high'
  },
  {
    id: 2,
    title: 'Guest Lecture on AI & ML',
    message: 'A guest lecture on "Recent Trends in AI and ML" will be held on 5th March 2024 at 2:00 PM in the Seminar Hall. All III year CSE students must attend.',
    sender: 'Dr. M. Kavitha',
    senderRole: 'Faculty',
    targetType: 'class',
    target: 'III Year CSE',
    date: '2024-02-25',
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Campus Placement Drive',
    message: 'TCS recruitment drive will be conducted on 10th March 2024. Eligible students with CGPA 7.0 and above can apply through the placement portal.',
    sender: 'Admin',
    senderRole: 'Admin',
    targetType: 'department',
    target: 'CSE',
    date: '2024-02-20',
    priority: 'high'
  },
  {
    id: 4,
    title: 'Lab Maintenance Notice',
    message: 'The AI Lab will be closed for maintenance from 1st March to 3rd March 2024. Use the DBMS Lab as alternative.',
    sender: 'Mr. A. Bharathi',
    senderRole: 'Faculty',
    targetType: 'group',
    target: 'III Year A',
    date: '2024-02-18',
    priority: 'low'
  },
  {
    id: 5,
    title: 'Anti-Ragging Awareness Program',
    message: 'An anti-ragging awareness program will be conducted on 2nd March 2024 at 10:00 AM. Attendance is mandatory.',
    sender: 'Admin',
    senderRole: 'Admin',
    targetType: 'all',
    target: 'All',
    date: '2024-02-15',
    priority: 'high'
  }
]

// Dummy Requests
export const dummyRequests = [
  {
    id: 1,
    type: 'OD',
    category: 'Industrial Visit',
    studentName: 'Arun Kumar',
    registerNumber: '22CSR001',
    department: 'CSE',
    year: 'III',
    reason: 'Industrial visit to TCS Chennai',
    date: '2024-03-05',
    status: 'pending',
    facultyApproval: 'pending',
    adminApproval: 'pending'
  },
  {
    id: 2,
    type: 'OD',
    category: 'Workshop',
    studentName: 'Priya Sharma',
    registerNumber: '22CSR002',
    department: 'CSE',
    year: 'III',
    reason: 'Python Workshop at IIT Madras',
    date: '2024-03-10',
    status: 'approved',
    facultyApproval: 'approved',
    adminApproval: 'approved'
  },
  {
    id: 3,
    type: 'Bonafide',
    category: 'Bonafide Certificate',
    studentName: 'Mohammad Rizwan',
    registerNumber: '22CSR003',
    department: 'CSE',
    year: 'III',
    reason: 'For passport application',
    date: '2024-02-20',
    status: 'approved',
    facultyApproval: 'approved',
    adminApproval: 'approved'
  },
  {
    id: 4,
    type: 'Leave',
    category: 'Sick Leave',
    facultyName: 'Ms. S. Divya',
    facultyId: 'FAC004',
    department: 'CSE',
    reason: 'Medical emergency',
    date: '2024-03-01',
    duration: '2 days',
    status: 'pending',
    adminApproval: 'pending'
  },
  {
    id: 5,
    type: 'Mass OD',
    category: 'Sports Event',
    studentName: 'Vijay Kumar',
    registerNumber: '22CSR005',
    department: 'CSE',
    year: 'III',
    reason: 'State level basketball tournament',
    date: '2024-03-15',
    count: 5,
    status: 'pending',
    facultyApproval: 'pending',
    adminApproval: 'pending'
  }
]

// Dummy Complaints
export const dummyComplaints = [
  {
    id: 1,
    type: 'Infrastructure',
    category: 'Lab Equipment',
    studentName: 'Arun Kumar',
    registerNumber: '22CSR001',
    department: 'CSE',
    description: 'Several computers in AI Lab are not working properly. Need immediate attention.',
    date: '2024-02-28',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 2,
    type: 'Administrative',
    category: 'Certificate Issue',
    studentName: 'Priya Sharma',
    registerNumber: '22CSR002',
    department: 'CSE',
    description: 'Bonafide certificate not received even after 2 weeks.',
    date: '2024-02-25',
    status: 'in_progress',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'Technical',
    category: 'Portal Issue',
    studentName: 'Mohammad Rizwan',
    registerNumber: '22CSR003',
    department: 'CSE',
    description: 'Unable to download marksheet from student portal.',
    date: '2024-02-20',
    status: 'resolved',
    priority: 'low'
  },
  {
    id: 4,
    type: 'Infrastructure',
    category: 'Washroom',
    facultyName: 'Mr. A. Bharathi',
    facultyId: 'FAC003',
    description: 'Staff washroom in Block A needs repair.',
    date: '2024-02-22',
    status: 'pending',
    priority: 'medium'
  }
]

// Dummy Attendance Data
export const dummyAttendance = [
  { id: 1, studentId: 1, studentName: 'Arun Kumar', registerNumber: '22CSR001', subjectId: 1, subject: 'Machine Learning', status: 'present', date: '2024-02-28' },
  { id: 2, studentId: 2, studentName: 'Priya Sharma', registerNumber: '22CSR002', subjectId: 1, subject: 'Machine Learning', status: 'present', date: '2024-02-28' },
  { id: 3, studentId: 3, studentName: 'Mohammad Rizwan', registerNumber: '22CSR003', subjectId: 1, subject: 'Machine Learning', status: 'absent', date: '2024-02-28' },
  { id: 4, studentId: 4, studentName: 'Lakshmi Devi', registerNumber: '22CSR004', subjectId: 1, subject: 'Machine Learning', status: 'present', date: '2024-02-28' },
  { id: 5, studentId: 5, studentName: 'Vijay Kumar', registerNumber: '22CSR005', subjectId: 1, subject: 'Machine Learning', status: 'present', date: '2024-02-28' },
  { id: 6, studentId: 1, studentName: 'Arun Kumar', registerNumber: '22CSR001', subjectId: 2, subject: 'Database Systems', status: 'present', date: '2024-02-27' },
  { id: 7, studentId: 2, studentName: 'Priya Sharma', registerNumber: '22CSR002', subjectId: 2, subject: 'Database Systems', status: 'present', date: '2024-02-27' },
  { id: 8, studentId: 3, studentName: 'Mohammad Rizwan', registerNumber: '22CSR003', subjectId: 2, subject: 'Database Systems', status: 'present', date: '2024-02-27' },
  { id: 9, studentId: 4, studentName: 'Lakshmi Devi', registerNumber: '22CSR004', subjectId: 2, subject: 'Database Systems', status: 'od', date: '2024-02-27' },
  { id: 10, studentId: 5, studentName: 'Vijay Kumar', registerNumber: '22CSR005', subjectId: 2, subject: 'Database Systems', status: 'absent', date: '2024-02-27' },
]

// Dummy Marks Data
export const dummyMarks = [
  { id: 1, studentId: 1, studentName: 'Arun Kumar', registerNumber: '22CSR001', subjectId: 1, subject: 'Machine Learning', cat1: 25, cat2: 28, lab: 45, assignment: 10, total: 108, grade: 'A' },
  { id: 2, studentId: 2, studentName: 'Priya Sharma', registerNumber: '22CSR002', subjectId: 1, subject: 'Machine Learning', cat1: 28, cat2: 30, lab: 48, assignment: 10, total: 116, grade: 'S' },
  { id: 3, studentId: 3, studentName: 'Mohammad Rizwan', registerNumber: '22CSR003', subjectId: 1, subject: 'Machine Learning', cat1: 20, cat2: 22, lab: 40, assignment: 8, total: 90, grade: 'B' },
  { id: 4, studentId: 4, studentName: 'Lakshmi Devi', registerNumber: '22CSR004', subjectId: 1, subject: 'Machine Learning', cat1: 27, cat2: 29, lab: 47, assignment: 10, total: 113, grade: 'S' },
  { id: 5, studentId: 5, studentName: 'Vijay Kumar', registerNumber: '22CSR005', subjectId: 1, subject: 'Machine Learning', cat1: 18, cat2: 20, lab: 38, assignment: 7, total: 83, grade: 'C' },
  { id: 6, studentId: 1, studentName: 'Arun Kumar', registerNumber: '22CSR001', subjectId: 2, subject: 'Database Systems', cat1: 26, cat2: 27, lab: 44, assignment: 9, total: 106, grade: 'A' },
  { id: 7, studentId: 2, studentName: 'Priya Sharma', registerNumber: '22CSR002', subjectId: 2, subject: 'Database Systems', cat1: 29, cat2: 30, lab: 49, assignment: 10, total: 118, grade: 'S' },
]

// Dummy Subjects
export const dummySubjects = [
  { id: 1, code: 'CS301', name: 'Machine Learning', credits: 4, faculty: 'Dr. M. Kavitha', type: 'theory' },
  { id: 2, code: 'CS302', name: 'Database Systems', credits: 4, faculty: 'Dr. P. Murugan', type: 'theory' },
  { id: 3, code: 'CS303', name: 'Computer Networks', credits: 3, faculty: 'Ms. S. Divya', type: 'theory' },
  { id: 4, code: 'CS304', name: 'Operating Systems', credits: 3, faculty: 'Mr. A. Bharathi', type: 'theory' },
  { id: 5, code: 'CS305', name: 'Machine Learning Lab', credits: 2, faculty: 'Dr. M. Kavitha', type: 'lab' },
  { id: 6, code: 'CS306', name: 'Database Lab', credits: 2, faculty: 'Dr. P. Murugan', type: 'lab' },
]

// Dummy Tasks
export const dummyTasks = [
  { id: 1, title: 'Upload CAT-2 Question Paper', description: 'Upload ML CAT-2 QP to portal', dueDate: '2024-03-05', subject: 'Machine Learning', class: 'III Year CSE', status: 'pending', priority: 'high' },
  { id: 2, title: 'Complete Internal Assessment', description: 'Submit IA marks for DBMS', dueDate: '2024-03-10', subject: 'Database Systems', class: 'III Year CSE', status: 'in_progress', priority: 'medium' },
  { id: 3, title: 'Prepare Lecture Notes', description: 'Upload CN lecture notes', dueDate: '2024-03-08', subject: 'Computer Networks', class: 'III Year CSE', status: 'completed', priority: 'low' },
  { id: 4, title: 'Review Lab Submissions', description: 'Check ML Lab assignments', dueDate: '2024-03-03', subject: 'Machine Learning Lab', class: 'III Year CSE', status: 'pending', priority: 'high' },
]

// Dummy Notifications
export const dummyNotifications = [
  { id: 1, title: 'New OD Request', message: 'Arun Kumar has requested OD for Industrial Visit', type: 'request', date: '2024-02-28', read: false },
  { id: 2, title: 'Complaint Received', message: 'New complaint from Arun Kumar regarding Lab Equipment', type: 'complaint', date: '2024-02-28', read: false },
  { id: 3, title: 'Leave Request', message: 'Ms. S. Divya requested leave for 2 days', type: 'request', date: '2024-02-27', read: true },
  { id: 4, title: 'Announcement Posted', message: 'Mid Semester Exam schedule has been published', type: 'announcement', date: '2024-02-26', read: true },
  { id: 5, title: 'Marks Updated', message: 'CAT-1 marks for Machine Learning have been uploaded', type: 'info', date: '2024-02-25', read: true },
]

// Dummy Courses/Materials
export const dummyCourses = [
  {
    id: 1,
    subject: 'Machine Learning',
    materials: [
      { id: 1, title: 'Introduction to ML', type: 'pdf', url: '#', uploadedDate: '2024-01-15', faculty: 'Dr. M. Kavitha' },
      { id: 2, title: 'Linear Regression Notes', type: 'pdf', url: '#', uploadedDate: '2024-01-20', faculty: 'Dr. M. Kavitha' },
      { id: 3, title: 'Classification Algorithms', type: 'slide', url: '#', uploadedDate: '2024-02-01', faculty: 'Dr. M. Kavitha' },
      { id: 4, title: 'Assignment 1', type: 'assignment', url: '#', uploadedDate: '2024-02-10', dueDate: '2024-02-25', faculty: 'Dr. M. Kavitha' },
    ]
  },
  {
    id: 2,
    subject: 'Database Systems',
    materials: [
      { id: 1, title: 'ER Model Basics', type: 'pdf', url: '#', uploadedDate: '2024-01-15', faculty: 'Dr. P. Murugan' },
      { id: 2, title: 'SQL Queries', type: 'pdf', url: '#', uploadedDate: '2024-01-22', faculty: 'Dr. P. Murugan' },
      { id: 3, title: 'Normalization Notes', type: 'slide', url: '#', uploadedDate: '2024-02-05', faculty: 'Dr. P. Murugan' },
    ]
  },
  {
    id: 3,
    subject: 'Computer Networks',
    materials: [
      { id: 1, title: 'OSI Model', type: 'pdf', url: '#', uploadedDate: '2024-01-18', faculty: 'Ms. S. Divya' },
      { id: 2, title: 'TCP/IP Protocol', type: 'pdf', url: '#', uploadedDate: '2024-01-25', faculty: 'Ms. S. Divya' },
    ]
  }
]

// Chatbot FAQ Data
export const chatbotFAQs = [
  { keywords: ['od', 'on duty', 'on-duty', 'permission'], answer: 'To apply for OD (On Duty), go to the Attendance section and click on "OD Request Form". Fill in the reason, date, and attach supporting documents. Your request will be sent to faculty and admin for approval.' },
  { keywords: ['attendance', 'attendance percentage', 'my attendance'], answer: 'You can view your attendance in the Attendance section. It shows overall attendance percentage and subject-wise breakdown. Minimum 75% attendance is required to appear for exams.' },
  { keywords: ['exam', 'exam schedule', 'exams', 'test'], answer: 'Mid semester examinations will be conducted from March 15-25, 2024. The detailed timetable will be announced soon. Check the Announcements section for updates.' },
  { keywords: ['marks', 'grades', 'cat', 'internal'], answer: 'Your marks are available in the Marks section. CAT-1, CAT-2, lab marks, and assignment marks are displayed. Contact your faculty if you have any discrepancies.' },
  { keywords: ['material', 'notes', 'pdf', 'download', 'lecture'], answer: 'You can access study materials in the Course section. Click on any subject to view and download notes, PDFs, and lecture slides uploaded by faculty.' },
  { keywords: ['faculty', 'teacher', 'professor', 'contact'], answer: 'You can find faculty contact details in the Course section when clicking on each subject. For other queries, please contact the HOD through the Grievance Redressal section.' },
  { keywords: ['complaint', 'grievance', 'problem', 'issue'], answer: 'To submit a complaint, go to Grievance Redressal in the sidebar. Fill in the form with your issue details. You can track the status of your complaints in the same section.' },
  { keywords: ['timetable', 'schedule', 'class'], answer: 'The class timetable is available in the Academic Calendar section. It shows your daily class schedule and lab sessions.' },
  { keywords: ['cgpa', 'gpa', 'grade'], answer: 'Your CGPA is calculated based on your performance in all subjects. You can view your current CGPA in your profile section at the top right.' },
  { keywords: ['hello', 'hi', 'hey', 'help'], answer: 'Hello! I\'m here to help you with common questions about CampusOne. You can ask me about:\n- OD applications\n- Attendance\n- Exam schedules\n- Marks\n- Study materials\n- Faculty contact\n- Complaints' },
]

