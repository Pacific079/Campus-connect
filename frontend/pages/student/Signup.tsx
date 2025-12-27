import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [studentId, setStudentId] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [zip, setZip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [comments, setComments] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!firstName || !lastName || !email) {
      setMessage('Please fill required fields: First name, Last name, Email');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
      form.append('firstName', firstName);
      form.append('middleName', middleName);
      form.append('lastName', lastName);
      form.append('fullName', fullName);
      form.append('dob', dob);
      form.append('studentId', studentId);
      form.append('streetAddress', streetAddress);
      form.append('city', city);
      form.append('state', state);
      form.append('country', country);
      form.append('zip', zip);
      form.append('email', email);
      form.append('phone', phone);
      form.append('course', course);
      form.append('address', `${streetAddress} ${city} ${state} ${zip}`.trim());
      form.append('comments', comments);
      form.append('courseId', course);
      if (imageFile) form.append('image', imageFile);

      // Adjust host/port as needed for your backend (server.js listens on 4200)
      const res = await fetch('http://localhost:4200/student/register-student', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const getErrMsg = (e: any): string => {
          if (!e) return 'Failed to submit';
          if (typeof e === 'string') return e;
          if (e.message && typeof e.message === 'string') return e.message;
          if (e.error && typeof e.error === 'string') return e.error;
          if (e.msg && typeof e.msg === 'string') return e.msg;
          // handle nested error objects like { error: { message: '...' } }
          if (e.error && typeof e.error === 'object') {
            return getErrMsg(e.error);
          }
          return JSON.stringify(e);
        };
        setMessage(getErrMsg(err));
      } else {
        setMessage('Student registered successfully');
        setTimeout(() => navigate('/'), 1200);
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Student Registration</h2>
      {message && <div className="mb-4 text-sm text-gray-700">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="px-3 py-2 border rounded" />
          <input placeholder="Middle Name" value={middleName} onChange={e => setMiddleName(e.target.value)} className="px-3 py-2 border rounded" />
          <input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="date" placeholder="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} className="px-3 py-2 border rounded" />
          <input placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} className="px-3 py-2 border rounded" />
        </div>

        <div>
          <input placeholder="Street Address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="px-3 py-2 border rounded" />
          <input placeholder="State / Province" value={state} onChange={e => setState(e.target.value)} className="px-3 py-2 border rounded" />
          <input placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} className="px-3 py-2 border rounded" />
          <input placeholder="ZIP Code" value={zip} onChange={e => setZip(e.target.value)} className="px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input placeholder="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2 border rounded" />
          <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} className="px-3 py-2 border rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Course" value={course} onChange={e => setCourse(e.target.value)} className="px-3 py-2 border rounded" />
          <input type="file" onChange={handleFile} className="px-3 py-2" />
        </div>

        <textarea placeholder="Comments" value={comments} onChange={e => setComments(e.target.value)} className="w-full px-3 py-2 border rounded h-24" />

        <div className="flex items-center space-x-3">
          <button disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">{loading ? 'Submitting...' : 'Register'}</button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
