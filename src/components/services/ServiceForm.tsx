
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ServiceFormData } from "@/hooks/use-services";

interface ServiceFormProps {
  initialData?: ServiceFormData & { id?: string };
  onSubmit: (data: ServiceFormData & { id?: string }) => void;
  isSubmitting: boolean;
}

const SERVICE_CATEGORIES = [
  "Accommodation",
  "Beauty & Wellness",
  "Consulting",
  "Education",
  "Entertainment",
  "Food & Dining",
  "Health & Medical",
  "Home & Garden",
  "Legal Services",
  "Personal Care",
  "Pet Services",
  "Professional Services",
  "Sports & Recreation", 
  "Transportation",
  "Other"
];

const LOCATION_TYPES = [
  { value: "in-person", label: "In Person" },
  { value: "remote", label: "Remote/Virtual" },
  { value: "both", label: "Both Options Available" }
];

const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<ServiceFormData & { id?: string }>(initialData || {
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    duration: 60, // Default to 60 minutes
    category: null,
    location_type: "in-person",
    preparation_time: 0,
    cleanup_time: 0,
    is_available: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_available: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Service Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name of your service"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Describe your service in detail"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select 
              value={formData.currency} 
              onValueChange={(value) => handleSelectChange(value, "currency")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CAD">CAD (C$)</SelectItem>
                <SelectItem value="AUD">AUD (A$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              name="duration"
              type="number"
              min="1"
              value={formData.duration}
              onChange={handleChange}
              placeholder="60"
              required
            />
          </div>

          <div>
            <Label htmlFor="preparation_time">Prep Time (minutes)</Label>
            <Input
              id="preparation_time"
              name="preparation_time"
              type="number"
              min="0"
              value={formData.preparation_time || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="cleanup_time">Cleanup Time (minutes)</Label>
            <Input
              id="cleanup_time"
              name="cleanup_time"
              type="number"
              min="0"
              value={formData.cleanup_time || 0}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category || ""} 
              onValueChange={(value) => handleSelectChange(value, "category")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location_type">Location Type *</Label>
            <Select 
              value={formData.location_type} 
              onValueChange={(value) => handleSelectChange(value, "location_type")}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="is_available" className="cursor-pointer">Available for Booking</Label>
          <Switch
            id="is_available"
            checked={formData.is_available || false}
            onCheckedChange={handleSwitchChange}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-artijam-purple hover:bg-artijam-purple/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : initialData?.id ? "Update Service" : "Create Service"}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
