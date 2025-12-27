import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

export const SignupUser: React.FC = () => {
  const navigate = useNavigate();
  const [instituteName, setInstituteName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [imageFile, setImageFile] = useState<File | null>(null);
  // student-specific
  const [fullName, setFullName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [batch, setBatch] = useState('');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  // admin / seating fields
  const [department, setDepartment] = useState('');
  const [address, setAddress] = useState('');
  // seating manager
  const [roomsManaged, setRoomsManaged] = useState('');
  const [shift, setShift] = useState('');
  // club coordinator
  const [clubName, setClubName] = useState('');
  const [clubEmail, setClubEmail] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!email || !password || !instituteName) {
      setMessage('Please provide institute name, email and password');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('instituteName', instituteName);
      form.append('phone', phone);
      form.append('email', email);
      form.append('password', password);
      form.append('role', role || 'student');
      if (imageFile) form.append('image', imageFile);

      // student fields
      form.append('fullName', fullName);
      form.append('courseId', courseId);
      form.append('batch', batch);
      form.append('enrollmentNo', enrollmentNo);
      form.append('rollNumber', rollNumber);
      form.append('dob', dob);

      // admin/seating
      form.append('department', department);
      form.append('address', address);

      // seating manager
      form.append('roomsManaged', roomsManaged);
      form.append('shift', shift);

      // club
      form.append('clubName', clubName);
      form.append('clubEmail', clubEmail);
      form.append('clubDescription', clubDescription);

      const res = await fetch('http://localhost:4200/user/signup', {
        method: 'POST',
        body: form,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data && (data.error || data.msg || data.message) ? (data.error || data.msg || data.message) : 'Signup failed';
        setMessage(msg as string);
      } else {
        setMessage('Signup successful — you can now sign in');
        setTimeout(() => navigate('/login'), 1200);
      }
    } catch (err) {
      console.error('signup error', err);
      setMessage('Server error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Create Account</h2>
      {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Student Name</label>
          <input placeholder='First name' value={instituteName} onChange={e => setInstituteName(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 border rounded">
              {Object.values(UserRole).map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full px-3 py-2 border rounded" />
          </div>
        </div>

        {/* Role specific fields */}
        {role === 'student' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input placeholder='Student Full Name' value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="Course ID" value={courseId} onChange={e => setCourseId(e.target.value)} className="px-3 py-2 border rounded" />
              <input placeholder="Batch" value={batch} onChange={e => setBatch(e.target.value)} className="px-3 py-2 border rounded" />
              <input placeholder="Enrollment No" value={enrollmentNo} onChange={e => setEnrollmentNo(e.target.value)} className="px-3 py-2 border rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Roll Number" value={rollNumber} onChange={e => setRollNumber(e.target.value)} className="px-3 py-2 border rounded" />
              <input type="date" placeholder="DOB" value={dob} onChange={e => setDob(e.target.value)} className="px-3 py-2 border rounded" />
            </div>
          </div>
        )}

        {role === 'admin' && (
          <div className="space-y-3">
            <input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded" />
            <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        )}

        {role === 'seating_manager' && (
          <div className="space-y-3">
            <input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded" />
            <input placeholder="Rooms Managed (comma separated)" value={roomsManaged} onChange={e => setRoomsManaged(e.target.value)} className="w-full px-3 py-2 border rounded" />
            <input placeholder="Shift" value={shift} onChange={e => setShift(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        )}

        {role === 'club_coordinator' && (
          <div className="space-y-3">
            <input placeholder="Club Name" value={clubName} onChange={e => setClubName(e.target.value)} className="w-full px-3 py-2 border rounded" />
            <input placeholder="Club Email" value={clubEmail} onChange={e => setClubEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
            <textarea placeholder="Club Description" value={clubDescription} onChange={e => setClubDescription(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          <input type="file" onChange={handleFile} className="mt-1" />
        </div>

        <div className="flex items-center space-x-3">
          <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">{loading ? 'Creating...' : 'Create Account'}</button>
          <button type="button" onClick={() => navigate('/login')} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default SignupUser;
