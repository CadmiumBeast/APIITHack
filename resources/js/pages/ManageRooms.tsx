import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/layouts/AdminLayout';

interface VenueType {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface Location {
  id: number;
  name: string;
  levels: number;
  created_at?: string;
  updated_at?: string;
}

interface Room {
  id?: number;
  roomId: string;
  building: string;
  venueType: string;
  level: string;
  capacity: number;
  created_at?: string;
  updated_at?: string;
  raw_data?: {
    building_id: number;
    venue_type_id: number;
    location_data: any;
    venue_type_data: any;
  };
}

interface DebugInfo {
  total_rooms: number;
  raw_rooms: any[];
  controller_timestamp: string;
}

interface ManageRoomsProps {
  rooms: Room[];
  debug_info?: DebugInfo;
  venueTypes: VenueType[];
  locations: Location[];
}

export default function ManageRooms({ rooms: initialRooms, debug_info, venueTypes, locations }: ManageRoomsProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms || []);
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [newRoom, setNewRoom] = useState<Room>({
    roomId: '',
    building: '',
    venueType: '',
    level: '',
    capacity: 0,
  });

  // Generate levels based on selected location
  const getAvailableLevels = () => {
    if (!selectedLocationId) return [];
    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    if (!selectedLocation) return [];
    
    return Array.from({ length: selectedLocation.levels }, (_, i) => ({
      value: (i + 1).toString(),
      label: `Level ${i + 1}`,
    }));
  };

  // Handle building selection
  const handleBuildingChange = (locationId: string) => {
    const location = locations.find(loc => loc.id === parseInt(locationId));
    setSelectedLocationId(parseInt(locationId));
    setNewRoom({ 
      ...newRoom, 
      building: location?.name || '',
      level: '' // Reset level when building changes
    });
  };

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
    setSelectedLocationId(null);
    setOpen(false);
  };

  const handleEdit = (index: number) => {
    setEditIndex(index);
    const roomToEdit = rooms[index];
    setNewRoom(roomToEdit);
    
    // Find the location ID for the selected building
    const location = locations.find(loc => loc.name === roomToEdit.building);
    if (location) {
      setSelectedLocationId(location.id);
    }
    
    setOpen(true);
  };

  const handleDelete = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#00b2a7]">Manage Rooms</h1>
        </div>
      

        <Dialog open={open} onOpenChange={(isOpen) => { 
          setOpen(isOpen); 
          if (!isOpen) {
            setEditIndex(null);
            setSelectedLocationId(null);
            setNewRoom({ roomId: '', building: '', venueType: '', level: '', capacity: 0 });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#00b2a7] hover:bg-[#009688] text-white mb-4">Add Room</Button>
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
              
              {/* Dynamic Building/Location Selection */}
              <Select onValueChange={handleBuildingChange} value={selectedLocationId?.toString() || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Building/Location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name} ({location.levels} levels)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Dynamic Venue Type Selection */}
              <Select onValueChange={(value) => setNewRoom({ ...newRoom, venueType: value })} value={newRoom.venueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Venue Type" />
                </SelectTrigger>
                <SelectContent>
                  {venueTypes.map((venueType) => (
                    <SelectItem key={venueType.id} value={venueType.name}>
                      {venueType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Dynamic Level Selection based on selected building */}
              <Select 
                onValueChange={(value) => setNewRoom({ ...newRoom, level: value })} 
                value={newRoom.level}
                disabled={!selectedLocationId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedLocationId ? "Select Level" : "Select Building First"} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableLevels().map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
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
              <tr key={room.id || index} className="border-t">
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
    </AdminLayout>
  );
}
