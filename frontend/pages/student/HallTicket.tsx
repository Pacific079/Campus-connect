import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';

export const HallTicket: React.FC = () => {
  const { user } = useAuth();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
    const [registeredExams, setRegisteredExams] = useState<any[]>([]);
    const [loadingExams, setLoadingExams] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  // Removed PDF download logic; printing via browser is used instead.

  if (!user) return null;

  // fetch profile for current user
  React.useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const token = (user as any).token;
        const res = await fetch('http://localhost:4200/user/profile', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error('profile fetch failed', err);
          setProfile(null);
        } else {
          const data = await res.json();
          setProfile(data.profile || null);
        }
      } catch (err) {
        console.error('profile fetch error', err);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();

    const fetchExams = async () => {
      setLoadingExams(true);
      try {
        const token = (user as any).token;
        const res = await fetch('http://localhost:4200/student/registered-exams', { headers: { Authorization: token ? `Bearer ${token}` : '' } });
        if (!res.ok) {
          console.debug('no registered exams or error', res.status);
          setRegisteredExams([]);
        } else {
          const data = await res.json();
          setRegisteredExams(Array.isArray(data.exams) ? data.exams : []);
        }
      } catch (err) {
        console.error('registered exams fetch error', err);
        setRegisteredExams([]);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, [user]);

  const schedule = React.useMemo(() => {
    if (profile && profile.schedule && Array.isArray(profile.schedule)) return profile.schedule;
    // fallback sample schedule
    return [
      { date: '2024-05-15', time: '10:00 AM - 01:00 PM', code: 'CS-CN', name: 'Computer Networks' },
      { date: '2024-05-18', time: '10:00 AM - 01:00 PM', code: 'CS-OS', name: 'Operating Systems' },
    ];
  }, [profile]);

  const candidateName = profile?.fullName || (user as any).name || 'Candidate Name';
  const registrationNumber = profile?.enrollmentNo || (user as any).studentId || (user as any).id || 'REG-0000';
  const programBatch = profile?.batch || (user as any).batch || 'N/A';
  const courseId = profile?.courseId || 'N/A';
  const centerCode = profile?.centerCode || 'CTR-101';
  const candidateImage = profile?.imageUrl || (user as any).avatar || null;

  const printExam = (exam: any) => {
    try {
      const printWindow = window.open('', '_blank', 'noopener');
      if (!printWindow) {
        alert('Unable to open print window — please allow popups.');
        return;
      }
      const html = `
        <html>
          <head>
            <title>Exam Ticket - ${exam.examCode || ''}</title>
            <style>
              body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
              .ticket { border: 1px solid #222; padding: 16px; max-width: 600px; }
              .header { display:flex; justify-content:space-between; align-items:center; }
              .center { text-align:center; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <div>
                  <h2 style="margin:0">MLRIT</h2>
                  <div style="font-size:12px;color:#666">Exam Ticket</div>
                </div>
                <div class="center">
                  <div style="font-weight:700">${candidateName}</div>
                  <div style="font-family:monospace">${registrationNumber}</div>
                </div>
              </div>
              <hr/>
              <h3 style="margin:8px 0">${exam.examName} <small>(${exam.examCode || ''})</small></h3>
              <p style="margin:4px 0">Date: ${exam.date || 'TBD'}</p>
              <p style="margin:4px 0">Time: ${exam.time || 'TBD'}</p>
              <p style="margin:4px 0">Venue: ${exam.venue || ''} ${exam.centerCode ? `• ${exam.centerCode}` : ''}</p>
              <div style="margin-top:20px; text-align:center; font-size:12px; color:#444">Please bring this ticket and a valid photo ID to the exam center.</div>
            </div>
          </body>
        </html>
      `;
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } catch (err) {
      console.error('printExam error', err);
      alert('Failed to open print window');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-2xl font-bold text-gray-800">Exam Hall Ticket</h2>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Printer size={18} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Ticket Design */}
      <div ref={ticketRef} className="bg-white border-2 border-slate-800 p-8 rounded-sm shadow-lg print-area text-slate-900">
        {/* Header + Student Info */}
        <div>
          <div className="border-b-2 border-slate-800 pb-6 mb-6 flex justify-between items-start">
          <div className="flex items-center gap-4">
             <div className="w-20 h-20 bg-slate-900 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-2xl">
               {candidateImage ? <img src={candidateImage} alt="avatar" className="w-full h-full object-cover" /> : 'EN'}
             </div>
             <div>
               <h1 className="text-2xl font-bold uppercase tracking-wide">MLRIT</h1>
               <p className="text-sm font-semibold text-gray-600">Academic Year 2023-2024</p>
               <p className="text-xs text-gray-500">Official Examination Hall Ticket</p>
             </div>
          </div>
          <div className="text-right">
             <div className="bg-slate-100 p-2 border border-slate-300 inline-block">
                <QRCodeSVG value={`HALL_TICKET:${registrationNumber}:${(user as any).id}`} size={80} />
             </div>
             <p className="text-[10px] mt-1 text-center font-mono">SCAN TO VERIFY</p>
          </div>
        </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs uppercase text-gray-500 font-bold mb-1">Candidate Name</p>
            <p className="text-lg font-bold border-b border-gray-300 pb-1">{candidateName}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 font-bold mb-1">Registration Number</p>
            <p className="text-lg font-bold border-b border-gray-300 pb-1 font-mono">{registrationNumber}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 font-bold mb-1">Program / Batch</p>
            <p className="text-lg font-bold border-b border-gray-300 pb-1">{programBatch}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 font-bold mb-1">Exam Center Code</p>
            <p className="text-lg font-bold border-b border-gray-300 pb-1 font-mono">{centerCode}</p>
          </div>
          </div>
        </div>

        {/* Schedule */}
        {/* Registered Exams */}
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase bg-slate-100 p-2 mb-2 border border-slate-200">Registered Exams</h3>
          {loadingExams ? (
            <p className="text-sm text-gray-500">Loading exams...</p>
          ) : registeredExams.length === 0 ? (
            <p className="text-sm text-gray-500">No registered exams found.</p>
          ) : (
            <ul className="space-y-2">
              {registeredExams.map((ex: any) => (
                <li key={ex._id || ex.examCode} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <div className="font-semibold">{ex.examName} <span className="text-xs text-gray-500">({ex.examCode})</span></div>
                    <div className="text-sm text-gray-600">{ex.date || ''} {ex.time ? `• ${ex.time}` : ''} {ex.venue ? `• ${ex.venue}` : ''}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => printExam(ex)}
                      className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                    >
                      Print
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase bg-slate-100 p-2 mb-2 border border-slate-200">Exam Schedule</h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2">Date</th>
                <th className="py-2">Time</th>
                <th className="py-2">Subject Code</th>
                <th className="py-2">Subject Name</th>
                <th className="py-2 text-right">Invigilator Sign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 font-mono">2024-05-15</td>
                <td className="py-3">10:00 AM - 01:00 PM</td>
                <td className="py-3 font-mono">CS-CN</td>
                <td className="py-3">Computer Networks</td>
                <td className="py-3 text-right">________________</td>
              </tr>
               <tr>
                <td className="py-3 font-mono">2024-05-18</td>
                <td className="py-3">10:00 AM - 01:00 PM</td>
                <td className="py-3 font-mono">CS-OS</td>
                <td className="py-3">Operating Systems</td>
                <td className="py-3 text-right">________________</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-gray-500 mt-12 border-t pt-4 flex justify-between">
            <p>1. Candidates must bring this ticket and valid ID.<br/>2. Mobile phones are prohibited.</p>
            <div className="text-center">
              <div className="h-8 border-b border-gray-400 w-32 mb-1"></div>
              <p>Controller of Examinations</p>
            </div>
        </div>
      </div>
    </div>
  );
};


