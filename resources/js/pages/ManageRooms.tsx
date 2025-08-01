import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Room {
  roomId: string;
  building: string;
  venueType: string;
  level: string;
  capacity: number;
}

const initialRooms: Room[] = [
  { roomId: 'L1Lab1', building: 'City Campus', venueType: 'Lab', level: '1', capacity: 30 },
  { roomId: 'L3CR7', building: 'Access Tower 1', venueType: 'Classroom', level: '3', capacity: 40 },
];

export default function ManageRooms() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newRoom, setNewRoom] = useState<Room>({
    roomId: '',
    building: '',
    venueType: '',
    level: '',
    capacity: 0,
  });

  const handleAddOrUpdateRoom = () => {
    if (editIndex !== null) {
      const updatedRooms = [...rooms];
      updatedRooms[editIndex] = newRoom;
      setRooms(updatedRooms);
      setEditIndex(null);
    } else {
      setRooms([...rooms, newRoom]);
    }
    setNewRoom({ roomId: '', building: '', venueType: '', level: '', capacity: 0 });
    setOpen(false);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setNewRoom(rooms[index]);
    setOpen(true);
  };

  const handleDelete = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#00b2a7]">Manage Rooms</h1>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setEditIndex(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#00b2a7] hover:bg-[#009688] text-white">Add Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editIndex !== null ? 'Edit Room' : 'Add a New Room'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Room ID (e.g., L1CR3)"
                value={newRoom.roomId}
                onChange={(e) => setNewRoom({ ...newRoom, roomId: e.target.value })}
              />
              <Input
                placeholder="Building (e.g., City Campus)"
                value={newRoom.building}
                onChange={(e) => setNewRoom({ ...newRoom, building: e.target.value })}
              />
              <Select onValueChange={(value) => setNewRoom({ ...newRoom, venueType: value })} value={newRoom.venueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Venue Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Classroom">Classroom</SelectItem>
                  <SelectItem value="Lab">Lab</SelectItem>
                  <SelectItem value="Discussion Room">Discussion Room</SelectItem>
                  <SelectItem value="Auditorium">Auditorium</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value) => setNewRoom({ ...newRoom, level: value })} value={newRoom.level}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Capacity"
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || 0 })}
              />
              <Button onClick={handleAddOrUpdateRoom} className="w-full bg-[#00b2a7] hover:bg-[#009688] text-white">
                {editIndex !== null ? 'Update Room' : 'Save Room'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left text-[#00b2a7]">
            <th className="p-2">Room ID</th>
            <th className="p-2">Building</th>
            <th className="p-2">Venue Type</th>
            <th className="p-2">Level</th>
            <th className="p-2">Capacity</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">{room.roomId}</td>
              <td className="p-2">{room.building}</td>
              <td className="p-2">{room.venueType}</td>
              <td className="p-2">{room.level}</td>
              <td className="p-2">{room.capacity}</td>
              <td className="p-2 space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[#00b2a7] border-[#00b2a7] hover:bg-[#00b2a7] hover:text-white"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
