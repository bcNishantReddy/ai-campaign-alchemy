
import React, { useEffect } from 'react';
import { Spinner } from "@/components/ui/spinner";
import { Check, X, Mail } from "lucide-react";
import { Prospect, Email, Campaign } from "@/types/database.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type ProspectWithEmail = Prospect & {
  email_data: Email | null;
};

interface ProspectEmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: ProspectWithEmail;
  campaign: Campaign;
  emailContent: { subject: string; body: string };
  setEmailContent: React.Dispatch<React.SetStateAction<{ subject: string; body: string }>>;
  isApproving: boolean;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
}

const ProspectEmailDialog: React.FC<ProspectEmailDialogProps> = ({
  isOpen,
  onClose,
  prospect,
  campaign,
  emailContent,
  setEmailContent,
  isApproving,
  onApprove,
  onReject,
}) => {
  // Save email content to database when it changes
  useEffect(() => {
    if (isOpen && prospect?.email_data?.id) {
      const saveEmailContent = async () => {
        // Don't save if the content hasn't changed
        if (
          prospect.email_data?.subject === emailContent.subject &&
          prospect.email_data?.body === emailContent.body
        ) {
          return;
        }
        
        // Save email content to database
        await supabase
          .from('emails')
          .update({
            subject: emailContent.subject,
            body: emailContent.body,
            updated_at: new Date().toISOString()
          })
          .eq('id', prospect.email_data.id);
      };
      
      // Use a debounce to avoid too many updates
      const debounceTimer = setTimeout(saveEmailContent, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [emailContent, isOpen, prospect?.email_data?.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {prospect?.email_data ? "Edit Email" : "Generated Email"}
          </DialogTitle>
          <DialogDescription>
            Review and approve the AI-generated email for {prospect?.name}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 rounded-md bg-gray-50 mt-4">
            <div>
              <p className="text-xs font-medium text-gray-500">From</p>
              <div className="flex items-center mt-1">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium">{campaign.representative_name}</p>
                  <p className="text-xs text-gray-500">{campaign.representative_email}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">To</p>
              <div className="flex items-center mt-1">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium">{prospect.name}</p>
                  <p className="text-xs text-gray-500">{prospect.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 py-2 px-1">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={emailContent.subject}
                onChange={(e) => setEmailContent(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea
                value={emailContent.body}
                onChange={(e) => setEmailContent(prev => ({ ...prev, body: e.target.value }))}
                className="min-h-[200px]"
              />
            </div>
          </div>

          <div className="mt-4 border p-4 rounded-md bg-white">
            <p className="text-sm font-medium text-gray-700 mb-2 border-b pb-2">Email Preview</p>
            <ScrollArea className="max-h-[200px] overflow-y-auto">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: emailContent.body }}
              />
            </ScrollArea>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <X size={16} className="mr-2" />
            Reject
          </Button>
          <Button
            onClick={onApprove}
            disabled={isApproving}
            className="bg-brand-purple hover:bg-brand-purple/90"
          >
            {isApproving ? <Spinner size="sm" className="mr-2" /> : <Check size={16} className="mr-2" />}
            {isApproving ? "Approving..." : "Approve & Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700">{children}</label>
);

export default ProspectEmailDialog;
