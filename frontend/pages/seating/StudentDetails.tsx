import React, { useEffect, useState } from 'react';
import { Users, Search, Download, Filter, FileDown } from 'lucide-react';

interface Student {
  _id: string;
  uId?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  courseId: string;
  batch?: string;
  enrollmentNo?: string;
  rollNumber?: string;
}

export const StudentDetails: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [uniqueCourses, setUniqueCourses] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const session = localStorage.getItem('user_session');
      const token = session ? JSON.parse(session).token : null;

      const response = await fetch('http://localhost:4200/student/approved-students', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });

      if (response.ok) {
        const data = await response.json();
        const studentList = data.getAllstudent || [];
        setStudents(studentList);
        setFilteredStudents(studentList);

        // Extract unique courses
        const courses = [...new Set(studentList.map(s => s.courseId).filter(Boolean))];
        setUniqueCourses(courses as string[]);
      } else {
        console.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and course filter
  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm)
      );
    }

    if (courseFilter) {
      filtered = filtered.filter(student => student.courseId === courseFilter);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, courseFilter, students]);

  const handleExportCSV = () => {
    const headers = ['#', 'Name', 'Email', 'Phone', 'Address', 'Course ID', 'Batch', 'Enrollment No', 'Roll Number'];
    const rows = filteredStudents.map((student, idx) => [
      idx + 1,
      student.fullName,
      student.email,
      student.phone,
      student.address,
      student.courseId,
      student.batch || '',
      student.enrollmentNo || '',
      student.rollNumber || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-details-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={32} />
                Student Details
              </h1>
              <p className="text-gray-600 mt-2">View and manage all registered students</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <FileDown size={18} />
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-gray-600 text-sm">Total Students</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{students.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-gray-600 text-sm">Displaying</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{filteredStudents.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="text-gray-600 text-sm">Unique Courses</div>
            <div className="text-3xl font-bold text-purple-600 mt-1">{uniqueCourses.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search size={16} className="inline mr-2" />
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter size={16} className="inline mr-2" />
                Filter by Course
              </label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">#</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Course ID</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Batch</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Roll Number</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">Enrollment No</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50 transition print:border-b">
                    <td className="px-6 py-3 text-gray-600">{idx + 1}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">{student.fullName}</td>
                    <td className="px-6 py-3 text-gray-600 break-all">{student.email}</td>
                    <td className="px-6 py-3 text-gray-600">{student.phone}</td>
                    <td className="px-6 py-3 text-gray-600 max-w-xs truncate">{student.address || 'N/A'}</td>
                    <td className="px-6 py-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {student.courseId}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{student.batch || '-'}</td>
                    <td className="px-6 py-3 font-semibold text-blue-600">{student.rollNumber || '-'}</td>
                    <td className="px-6 py-3 text-gray-600">{student.enrollmentNo || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No students found matching your filters</p>
              <p className="text-sm mt-2">Try adjusting your search or course filter</p>
            </div>
          )}
        </div>

        {/* Footer with summary */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Showing {filteredStudents.length} of {students.length} students
            {courseFilter && ` • Course: ${courseFilter}`}
          </p>
        </div>
      </div>
    </div>
  );
};
