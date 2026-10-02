import { AppState, Project, Task, LeaveRequest, Employee, Deal } from '../types';

export async function fetchAppState(): Promise<AppState> {
  const res = await fetch('/api/state');
  if (!res.ok) throw new Error('Failed to fetch initial state');
  return res.json();
}

export async function clockInAPI(location: string, notes?: string) {
  const res = await fetch('/api/attendance/clock-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: 'emp_cian', location, notes })
  });
  if (!res.ok) throw new Error('Failed to clock in');
  return res.json();
}

export async function clockOutAPI(notes?: string) {
  const res = await fetch('/api/attendance/clock-out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: 'emp_cian', notes })
  });
  if (!res.ok) throw new Error('Failed to clock out');
  return res.json();
}

export async function toggleBreakAPI(type: 'short' | 'lunch') {
  const res = await fetch('/api/attendance/break', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type })
  });
  if (!res.ok) throw new Error('Failed to toggle break');
  return res.json();
}

export async function createProjectAPI(projectData: Partial<Project>) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function createTaskAPI(taskData: Partial<Task>) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function toggleTaskCompleteAPI(taskId: string) {
  const res = await fetch(`/api/tasks/${taskId}/toggle`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function logTaskTimeAPI(taskId: string, minutes: number) {
  const res = await fetch(`/api/tasks/${taskId}/log-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes })
  });
  if (!res.ok) throw new Error('Failed to log time');
  return res.json();
}

export async function setTaskTimeAPI(taskId: string, loggedMinutes: number) {
  const res = await fetch(`/api/tasks/${taskId}/time`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loggedMinutes })
  });
  if (!res.ok) throw new Error('Failed to set task time');
  return res.json();
}

export async function updateTaskAPI(taskId: string, data: Partial<Task>) {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function createLeaveAPI(leaveData: Partial<LeaveRequest>) {
  const res = await fetch('/api/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData)
  });
  if (!res.ok) throw new Error('Failed to submit leave');
  return res.json();
}

export async function updateLeaveStatusAPI(leaveId: string, status: 'approved' | 'rejected') {
  const res = await fetch(`/api/leave/${leaveId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update leave');
  return res.json();
}

export async function createEmployeeAPI(empData: Partial<Employee>) {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empData)
  });
  if (!res.ok) throw new Error('Failed to create employee');
  return res.json();
}

export async function fetchReportDataAPI(reportType: string) {
  const res = await fetch(`/api/reports/export/${reportType}?format=json`);
  if (!res.ok) throw new Error('Failed to fetch report');
  return res.json();
}

export async function fetchSalesDealsAPI() {
  const res = await fetch('/api/sales/deals');
  if (!res.ok) throw new Error('Failed to fetch sales deals');
  return res.json();
}

export async function createDealAPI(dealData: Partial<Deal>) {
  const res = await fetch('/api/sales/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dealData)
  });
  if (!res.ok) throw new Error('Failed to create deal');
  return res.json();
}

export async function updateDealStageAPI(dealId: string, stage: Deal['stage']) {
  const res = await fetch(`/api/sales/deals/${dealId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage })
  });
  if (!res.ok) throw new Error('Failed to update deal stage');
  return res.json();
}

export async function updateAttendanceAPI(id: string, data: any) {
  const res = await fetch(`/api/attendance/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update attendance');
  return res.json();
}

export async function addManualAttendanceAPI(data: any) {
  const res = await fetch('/api/attendance/manual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add manual attendance');
  return res.json();
}
