
import { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddProspectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProspectAdded: () => void;
}

export default function AddProspectDialog({ isOpen, onClose, onProspectAdded }: AddProspectDialogProps) {
  const { id: campaignId } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company_name: "",
    role: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignId) {
      toast.error("Campaign ID is missing");
      return;
    }
    
    if (!formData.name || !formData.email || !formData.company_name) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('prospects')
        .insert({
          campaign_id: campaignId,
          name: formData.name,
          email: formData.email,
          company_name: formData.company_name,
          role: formData.role || null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Prospect added successfully");
      onProspectAdded();
      onClose();
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        company_name: "",
        role: ""
      });
    } catch (error: any) {
      toast.error(`Error adding prospect: ${error.message}`);
      console.error("Error adding prospect:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Prospect</DialogTitle>
          <DialogDescription>
            Add a new prospect to your campaign. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="required">Contact Name</Label>
            <Input 
              id="name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="required">Email</Label>
            <Input 
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_name" className="required">Company Name</Label>
            <Input 
              id="company_name"
              name="company_name"
              placeholder="Acme Inc."
              value={formData.company_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role/Position</Label>
            <Input 
              id="role"
              name="role"
              placeholder="CEO, CTO, Marketing Director, etc."
              value={formData.role}
              onChange={handleChange}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-brand-purple hover:bg-brand-purple/90">
              {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
              {isSubmitting ? "Adding..." : "Add Prospect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
