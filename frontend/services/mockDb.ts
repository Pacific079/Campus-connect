import { User, UserRole, AcademicEvent, Syllabus, ExamRoom, Exam } from '../types';

// Service Class to simulate Mongoose Models
class MockDatabase {
  private users: User[] = [];
  private events: AcademicEvent[] = [];
  private rooms: ExamRoom[] = [];
  private syllabi: Syllabus[] = [];

  // Auth
  async login(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  // Events
  getEvents() { return this.events; }
  addEvent(event: AcademicEvent) { this.events.push(event); }
  updateEventStatus(id: string, status: 'approved' | 'rejected') {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx !== -1) this.events[idx].status = status;
  }

  // Users
  getStudents() { return this.users.filter(u => u.role === UserRole.STUDENT); }

  // Rooms
  getRooms() { return this.rooms; }
  addRoom(room: ExamRoom) { this.rooms.push(room); }

  // Syllabus
  getSyllabi() { return this.syllabi; }
  addSyllabus(syllabus: Syllabus) { this.syllabi.push(syllabus); }
}

export const db = null; // Mock database removed
