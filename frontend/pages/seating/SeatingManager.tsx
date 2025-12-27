import React, { useEffect, useState, useCallback } from 'react';
import { Allocation, StudentSeat } from '../../types';
import { Grid, Shuffle, Download, User, RefreshCw, Plus, Edit, Trash2, Save, X, Users } from 'lucide-react';

export const SeatingManager: React.FC = () => {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Room management state
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ name: '', rows: '', cols: '' });

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);

      const session = localStorage.getItem('user_session');
      const token = session ? JSON.parse(session).token : null;

      // Fetch approved students only
      const studentsResponse = await fetch('http://localhost:4200/student/approved-students', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      console.log('Students API response status:', studentsResponse.status);
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        console.log('Students data received:', studentsData);
        setStudents(studentsData.getAllstudent || []);
      } else {
        console.error('Failed to fetch students:', studentsResponse.status, await studentsResponse.text());
      }

      // Fetch rooms from backend
      const roomsResponse = await fetch('http://localhost:4200/rooms/seating-rooms', {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      console.log('Rooms API response status:', roomsResponse.status);
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        console.log('Rooms data received:', roomsData);
        setRooms(roomsData.rooms || []);
      } else {
        console.error('Failed to fetch rooms:', roomsResponse.status, await roomsResponse.text());
        // Fallback to mock rooms if API fails
        console.warn('Failed to fetch rooms from backend, using mock data');
        const mockRooms = [
          { id: 1, name: 'Room A', rows: 5, cols: 6 },
          { id: 2, name: 'Room B', rows: 4, cols: 8 },
          { id: 3, name: 'Room C', rows: 6, cols: 5 }
        ];
        setRooms(mockRooms);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Poll for updates every 30 seconds to get new student registrations
    const interval = setInterval(() => {
      fetchData(false); // Don't show loading spinner for background updates
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Room Management Functions
  const handleAddRoom = () => {
    setEditingRoom(null);
    setRoomForm({ name: '', rows: '', cols: '' });
    setShowRoomForm(true);
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({ 
      name: room.name, 
      rows: room.rows.toString(), 
      cols: room.cols.toString() 
    });
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const session = localStorage.getItem('user_session');
      const token = session ? JSON.parse(session).token : null;
      const response = await fetch(`http://localhost:4200/rooms/seating-rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      
      if (response.ok) {
        setRooms(rooms.filter(room => (room.id || room._id) !== roomId));
        setGenerated(false); // Reset allocations when rooms change
      } else {
        alert('Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room');
    }
  };

  const handleSaveRoom = async () => {
    if (!roomForm.name || !roomForm.rows || !roomForm.cols) {
      alert('Please fill all fields');
      return;
    }

    const roomData = {
      name: roomForm.name,
      rows: parseInt(roomForm.rows),
      cols: parseInt(roomForm.cols)
    };

    try {
      const session = localStorage.getItem('user_session');
      const token = session ? JSON.parse(session).token : null;
      console.log('Saving room with token:', token ? 'present' : 'missing');
      console.log('Room data:', roomData);
      let response;
      
      if (editingRoom) {
        // Update existing room
        response = await fetch(`http://localhost:4200/rooms/seating-rooms/${editingRoom.id || editingRoom._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(roomData)
        });
      } else {
        // Add new room
        response = await fetch('http://localhost:4200/rooms/seating-rooms', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(roomData)
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log('Room saved successfully:', result);
        if (editingRoom) {
          setRooms(rooms.map(room => 
            (room.id || room._id) === (editingRoom.id || editingRoom._id) ? result.room : room
          ));
        } else {
          setRooms([...rooms, result.room]);
        }
        setShowRoomForm(false);
        setGenerated(false); // Reset allocations when rooms change
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to save room:', response.status, errorData);
        alert(`Failed to save room: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Error saving room');
    }
  };

  // Advanced Random Seating Algorithm
  // Advanced Sequential Seating Algorithm (in registration order)
  const runSeatingAlgorithm = () => {
    console.log('🔥 Generate Plan button clicked - function called!');
    console.log('Students:', students.length, students);
    console.log('Rooms:', rooms.length, rooms);

    if (students.length === 0) {
      console.log('No students available, returning early');
      alert('No approved students available. Students must be registered and approved by an admin first.');
      return;
    }

    if (rooms.length === 0) {
      console.log('No rooms available, returning early');
      alert('Please add at least one room before generating a seating plan.');
      return;
    }

    // 1. Calculate total available seats
    const totalSeats = rooms.reduce((total, room) => total + (room.rows * room.cols), 0);
    console.log('Total available seats:', totalSeats);

    // 2. Use students in REGISTRATION ORDER (no shuffling)
    console.log('Students in registration order:', students.length);

    // 3. Distribute students across rooms SEQUENTIALLY
    const newAllocations: Allocation[] = [];

    let studentIndex = 0;

    rooms.forEach((room, roomIndex) => {
      console.log(`Processing room ${roomIndex + 1}: ${room.name} (${room.rows}x${room.cols})`);
      const roomSeats: StudentSeat[] = [];
      const totalRoomSeats = room.rows * room.cols;

      // Calculate how many students to assign to this room
      // Distribute evenly: if 10 students and 2 rooms, each gets 5
      const remainingStudents = students.length - studentIndex;
      const remainingRooms = rooms.length - roomIndex;
      const roomStudentCount = Math.ceil(remainingStudents / remainingRooms);

      console.log(`  Room capacity: ${totalRoomSeats} seats`);
      console.log(`  Assigning ${roomStudentCount} students to this room`);

      const roomStudents = students.slice(studentIndex, studentIndex + roomStudentCount);
      studentIndex += roomStudentCount;

      // 4. Create seat positions in ORDER (A1, A2, A3... B1, B2, B3...)
      const seatPositions: string[] = [];
      for (let row = 0; row < room.rows; row++) {
        for (let col = 0; col < room.cols; col++) {
          const rowChar = String.fromCharCode(65 + row); // A, B, C...
          const colNum = col + 1;
          seatPositions.push(`${rowChar}${colNum}`);
        }
      }

      console.log(`  Available seat positions: ${seatPositions.length}`);

      // 5. Assign students to seats SEQUENTIALLY (no shuffling)
      roomStudents.forEach((student, idx) => {
        if (idx < seatPositions.length) {
          const seatNumber = seatPositions[idx]; // Sequential order
          roomSeats.push({
            studentId: student._id,
            studentName: student.fullName,
            examSubject: 'General',
            seatNumber: seatNumber
          });
          console.log(`    Student ${idx + 1}: ${student.fullName} → Seat ${seatNumber}`);
        }
      });

      newAllocations.push({
        roomId: room.id || room._id,
        examId: `exam_${Date.now()}_${roomIndex}`,
        seats: roomSeats
      });
    });

    setAllocations(newAllocations);
    setGenerated(true);
    console.log('Seating plan generated successfully!');
    console.log('Allocations:', newAllocations);
  };

  const getRoomAllocation = (roomId: string) => allocations.find(a => a.roomId === roomId);

  // Get room and seat for a specific student
  const getStudentAllocation = (studentId: string) => {
    for (const allocation of allocations) {
      const seatAllocation = allocation.seats.find(s => s.studentId === studentId);
      if (seatAllocation) {
        const room = rooms.find(r => r._id === allocation.roomId || r.id === allocation.roomId);
        return {
          room: room?.name || 'Unknown Room',
          seat: seatAllocation.seatNumber,
          roomId: allocation.roomId
        };
      }
    }
    return null;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Grid className="text-orange-600" /> Seating Allocation
          </h2>
          <p className="text-gray-500">Automated Seating Plan Generator</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 shadow-lg"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <button 
            onClick={runSeatingAlgorithm}
            className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 shadow-lg"
          >
            <Shuffle size={18} />
            <span>{generated ? 'Regenerate Plan' : 'Generate Plan'}</span>
          </button>
           {generated && (
             <button 
             onClick={() => window.print()}
             className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
           >
             <Download size={18} />
             <span>Export</span>
           </button>
           )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex gap-6">
            <span><strong>{students.length}</strong> Students Registered</span>
            <span><strong>{rooms.length}</strong> Exam Rooms Available</span>
            <span><strong>{rooms.reduce((total, room) => total + (room.rows * room.cols), 0)}</strong> Total Seats</span>
          </div>
          <div className="text-xs opacity-75">
            Auto-updates every 30s • Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Room Management Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Room Management</h3>
          <button 
            onClick={handleAddRoom}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-lg"
          >
            <Plus size={18} />
            <span>Add Room</span>
          </button>
        </div>

        {/* Room Form */}
        {showRoomForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-3">{editingRoom ? 'Edit Room' : 'Add New Room'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Room Name"
                value={roomForm.name}
                onChange={(e) => setRoomForm({...roomForm, name: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Rows"
                value={roomForm.rows}
                onChange={(e) => setRoomForm({...roomForm, rows: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <input
                type="number"
                placeholder="Columns"
                value={roomForm.cols}
                onChange={(e) => setRoomForm({...roomForm, cols: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSaveRoom}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Save size={18} />
                <span>Save</span>
              </button>
              <button 
                onClick={() => setShowRoomForm(false)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Rooms List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => (
            <div key={room.id || room._id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{room.name}</h4>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditRoom(room)}
                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteRoom(room.id || room._id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Rows: {room.rows}</p>
                <p>Columns: {room.cols}</p>
                <p>Capacity: {room.rows * room.cols} seats</p>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Grid size={48} className="mx-auto mb-4 opacity-50" />
            <p>No rooms configured yet. Add your first room to get started.</p>
          </div>
        )}
      </div>

      {!generated && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center text-orange-800">
          <Grid size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="font-bold text-lg">No Plan Generated</h3>
          <p>Click "Generate Plan" to randomly allocate {students.length} registered students across {rooms.length} rooms.</p>
          <p className="text-sm mt-2 opacity-75">Data updates automatically every 30 seconds as new students register.</p>
        </div>
      )}

      {/* Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {generated && rooms.map(room => {
          const alloc = getRoomAllocation(room.id || room._id);
          return (
            <div key={room.id || room._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between mb-4 border-b pb-2">
                <h3 className="font-bold text-gray-800">{room.name}</h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  Capacity: {room.capacity}
                </span>
              </div>
              
              <div 
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${room.cols}, 1fr)` }}
              >
                {Array.from({ length: room.rows * room.cols }).map((_, idx) => {
                  const rowChar = String.fromCharCode(65 + Math.floor(idx / room.cols));
                  const colNum = (idx % room.cols) + 1;
                  const seatId = `${rowChar}${colNum}`;
                  const assigned = alloc?.seats.find(s => s.seatNumber === seatId);

                  return (
                    <div 
                      key={idx}
                      className={`
                        aspect-square rounded-lg border flex flex-col items-center justify-center p-1 text-center
                        transition-all text-[10px] relative group
                        ${assigned 
                          ? 'bg-blue-50 border-blue-200 text-blue-800' 
                          : 'bg-gray-50 border-gray-100 text-gray-300'}
                      `}
                    >
                      <span className="absolute top-1 left-1 text-[8px] opacity-50">{seatId}</span>
                      {assigned ? (
                        <>
                          <User size={14} className="mb-1" />
                          <span className="font-bold leading-tight line-clamp-2 w-full text-[9px]">{assigned.studentName.split(' ')[0]}</span>
                        </>
                      ) : (
                        <span className="text-[9px]">Empty</span>
                      )}
                      
                      {/* Tooltip */}
                      {assigned && (
                         <div className="absolute hidden group-hover:block z-10 bottom-full mb-2 bg-slate-900 text-white text-xs p-2 rounded whitespace-nowrap">
                            {assigned.studentName} ({assigned.studentId})
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 text-center">
                <div className="w-24 h-1 bg-gray-300 mx-auto mb-1"></div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Whiteboard / Podium</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
