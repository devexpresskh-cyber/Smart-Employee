export type Language = 'en' | 'km';

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeCode: string;
  role: string;
  department: string;
  avatar: string;
  hourlyRate: number;
  phone: string;
  joinDate: string;
}

export interface BreakRecord {
  id: string;
  type: 'short' | 'lunch';
  start: string;
  end: string | null;
  durationMinutes: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  location: string;
  breaks: BreakRecord[];
  totalMinutes: number;
  status: 'on_time' | 'late' | 'overtime';
  notes: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  completed: boolean;
  estimatedHours: number;
  loggedMinutes: number;
  billable: boolean;
  dueDate: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'active' | 'completed' | 'archived';
  budget: number;
  billableRate: number;
  dueDate: string;
  description: string;
}

export interface ShiftTimelineItem {
  id: string;
  label: string;
  time: string;
  type: 'clock_in' | 'short_break' | 'lunch_break' | 'clock_out';
  completed: boolean;
}

export interface ShiftItem {
  id: string;
  employeeId: string;
  date: string;
  dayName: string;
  dayNumber: number;
  role: string;
  startTime: string;
  endTime: string;
  hours: number;
  location: string;
  timeline: ShiftTimelineItem[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Annual' | 'Sick' | 'Casual' | 'Emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
}

export interface LocationSite {
  id: string;
  name: string;
  address: string;
  activeCount: number;
  radiusMeters: number;
}

export interface DepartmentItem {
  name: string;
  count: number;
  budget: number;
  lead: string;
}

export interface Deal {
  id: string;
  title: string;
  client: string;
  contactPerson: string;
  phone: string;
  value: number;
  stage: 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
  assignedRep: string;
  expectedCloseDate: string;
  notes: string;
  createdAt: string;
}

export interface CianPunchState {
  clockedIn: boolean;
  clockInTime: string | null;
  currentLocation: string;
  onBreak: boolean;
  breakType: 'short' | 'lunch' | null;
  breakStartTime: string | null;
  breaksToday: BreakRecord[];
  todayMinutes: number;
}

export interface AppMetrics {
  totalEmployees: number;
  workingNow: number;
  presentToday: number;
  lateToday: number;
  onLeaveToday: number;
  attendanceRate: string;
  attendanceBreakdown: {
    present: number;
    late: number;
    absent: number;
    onLeave: number;
  };
}

export interface AppState {
  company: {
    name: string;
    adminEmail: string;
    domain: string;
  };
  currentUser: Employee;
  cianPunchState: CianPunchState;
  metrics: AppMetrics;
  employees: Employee[];
  departments: DepartmentItem[];
  locations: LocationSite[];
  projects: Project[];
  tasks: Task[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  weeklyShifts: ShiftItem[];
  salesDeals: Deal[];
}

export type ActiveTab =
  | 'dashboard'
  | 'shifts'
  | 'clock'
  | 'projects'
  | 'sales'
  | 'employees'
  | 'attendance'
  | 'departments'
  | 'leave'
  | 'locations'
  | 'reports'
  | 'admin_hub';

export type UserRoleMode = 'admin' | 'employee';
