
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PlusCircle, X, Loader2 } from 'lucide-react';
import { ServiceAvailabilityFormData, ServiceAvailability } from '@/hooks/use-service-availability';
import { toast } from 'sonner';

interface AvailabilityManagerProps {
  serviceId: string;
  availabilities: ServiceAvailability[];
  onAdd: (availability: ServiceAvailabilityFormData) => Promise<any>;
  onDelete: (availabilityId: string) => Promise<any>;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({
  serviceId,
  availabilities,
  onAdd,
  onDelete
}) => {
  const [newAvailability, setNewAvailability] = useState<ServiceAvailabilityFormData>({
    service_id: serviceId,
    day_of_week: 1, // Monday by default
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleChange = (name: string, value: any) => {
    setNewAvailability(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAvailability = () => {
    if (!newAvailability.start_time || !newAvailability.end_time) {
      toast.error("Start time and end time are required");
      return false;
    }
    
    // Check if start time is before end time
    if (newAvailability.start_time >= newAvailability.end_time) {
      toast.error("Start time must be before end time");
      return false;
    }
    return true;
  };

  const handleAddAvailability = async () => {
    if (!validateAvailability()) return;
    
    try {
      setIsSubmitting(true);
      await onAdd({
        ...newAvailability,
        service_id: serviceId
      });
      
      // Reset form to default values
      setNewAvailability({
        service_id: serviceId,
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      });
    } catch (error) {
      console.error("Error adding availability:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      setIsDeleting(id);
      await onDelete(id);
      toast.success("Availability slot removed");
    } catch (error) {
      console.error("Error deleting availability:", error);
      toast.error("Failed to remove availability slot");
    } finally {
      setIsDeleting(null);
    }
  };

  // Group availabilities by day
  const availabilitiesByDay = DAYS_OF_WEEK.map(day => {
    const dayAvailabilities = availabilities.filter(a => a.day_of_week === day.value);
    return {
      ...day,
      availabilities: dayAvailabilities
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Service Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="day_of_week">Day of Week</Label>
            <Select
              value={newAvailability.day_of_week.toString()}
              onValueChange={(value) => handleChange('day_of_week', parseInt(value))}
            >
              <SelectTrigger id="day_of_week">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              value={newAvailability.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              value={newAvailability.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
            />
          </div>
        </div>

        <Button 
          type="button" 
          onClick={handleAddAvailability} 
          className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" /> 
              Add Availability Slot
            </>
          )}
        </Button>

        <div className="mt-8 space-y-4">
          {availabilitiesByDay.map(day => (
            day.availabilities.length > 0 && (
              <div key={day.value} className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">{day.label}</h3>
                <div className="space-y-2">
                  {day.availabilities.map(availability => (
                    <div 
                      key={availability.id} 
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span>
                        {availability.start_time.substring(0, 5)} - {availability.end_time.substring(0, 5)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAvailability(availability.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        disabled={isDeleting === availability.id}
                      >
                        {isDeleting === availability.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          
          {!availabilities.length && (
            <div className="text-center py-8 text-gray-500">
              No availability set. Add your first availability slot above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
