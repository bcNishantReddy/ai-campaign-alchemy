
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Campaign } from "@/types/database.types";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditCampaignDialogProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onCampaignUpdated: (updatedCampaign: Campaign) => void;
}

const EditCampaignDialog = ({
  campaign,
  isOpen,
  onClose,
  onCampaignUpdated,
}: EditCampaignDialogProps) => {
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description || '',
    company_name: campaign.company_name || '',
    company_description: campaign.company_description || '',
    representative_name: campaign.representative_name || '',
    representative_role: campaign.representative_role || '',
    representative_email: campaign.representative_email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const { data, error } = await supabase
        .from("campaigns")
        .update(formData)
        .eq("id", campaign.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Campaign updated successfully!");
      onCampaignUpdated(data as Campaign);
      onClose();
    } catch (error: any) {
      toast.error("Error updating campaign: " + error.message);
      console.error("Error updating campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update the details for your campaign
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Campaign Information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Campaign Description
                </label>
                <Textarea
                  name="description"
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose of this campaign"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-sm font-medium text-gray-900">
              Company Information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <Input
                  type="text"
                  name="company_name"
                  id="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="company_description" className="block text-sm font-medium text-gray-700">
                  Company Description
                </label>
                <Textarea
                  name="company_description"
                  id="company_description"
                  rows={2}
                  value={formData.company_description}
                  onChange={handleChange}
                  placeholder="Briefly describe what your company does"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Representative Information
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label htmlFor="representative_name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  type="text"
                  name="representative_name"
                  id="representative_name"
                  value={formData.representative_name}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label htmlFor="representative_role" className="block text-sm font-medium text-gray-700">
                  Role / Title
                </label>
                <Input
                  type="text"
                  name="representative_role"
                  id="representative_role"
                  value={formData.representative_role}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="representative_email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  name="representative_email"
                  id="representative_email"
                  value={formData.representative_email}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-brand-purple hover:bg-brand-purple/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
              {isSubmitting ? "Updating..." : "Update Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCampaignDialog;
