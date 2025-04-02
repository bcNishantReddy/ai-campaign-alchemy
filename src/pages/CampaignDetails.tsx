
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash, Send, Check, X, Pencil, Upload, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign, Prospect, Email } from "@/types/database.types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import AddProspectDialog from "@/components/AddProspectDialog";
import ImportProspectsSheet from "@/components/ImportProspectsSheet";
import ProspectRequirements from "@/components/ProspectRequirements";
import { generateEmail, sendEmail } from "@/services/emailService";

type ProspectWithEmail = Prospect & {
  email_data: Email | null;
};

const CampaignDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prospects, setProspects] = useState<ProspectWithEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<ProspectWithEmail | null>(null);
  const [emailContent, setEmailContent] = useState<{ subject: string; body: string }>({
    subject: '',
    body: ''
  });
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [addProspectDialogOpen, setAddProspectDialogOpen] = useState(false);
  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  // New state for API keys
  const [mailjetKeys, setMailjetKeys] = useState<{api_key: string; secret_key: string} | null>(null);

  const fetchCampaignData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch campaign details
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
        
      if (campaignError) throw campaignError;
      setCampaign(campaignData);
      
      // Fetch prospects with their emails
      const { data: prospectsData, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('campaign_id', id);
        
      if (prospectsError) throw prospectsError;
      
      // For each prospect, fetch their email
      const prospectsWithEmails = await Promise.all(
        (prospectsData || []).map(async (prospect) => {
          const { data: emailData } = await supabase
            .from('emails')
            .select('*')
            .eq('prospect_id', prospect.id)
            .maybeSingle();
            
          return {
            ...prospect,
            email_data: emailData || null
          } as ProspectWithEmail;
        })
      );
      
      setProspects(prospectsWithEmails);
      
      // Fetch Mailjet API keys if available
      if (campaignData.user_id) {
        const { data: apiKeysData } = await supabase
          .from('user_api_keys')
          .select('mailjet_api_key, mailjet_secret_key')
          .eq('user_id', campaignData.user_id)
          .maybeSingle();
          
        if (apiKeysData) {
          setMailjetKeys({
            api_key: apiKeysData.mailjet_api_key,
            secret_key: apiKeysData.mailjet_secret_key
          });
        }
      }
    } catch (error: any) {
      toast.error('Error loading campaign: ' + error.message);
      console.error('Error loading campaign:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [id]);

  const deleteCampaign = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Campaign deleted successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Error deleting campaign: ' + error.message);
      console.error('Error deleting campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const generateEmailForProspect = async (prospect: ProspectWithEmail) => {
    if (!campaign) return;
    
    setSelectedProspect(prospect);
    setIsGeneratingEmail(true);
    
    try {
      // If the prospect already has an email, just display it
      if (prospect.email_data) {
        setEmailContent({
          subject: prospect.email_data.subject,
          body: prospect.email_data.body
        });
        setEmailDialogOpen(true);
        return;
      }
      
      // Prepare data for the API call
      const generationData = {
        company_name: campaign.company_name,
        company_description: campaign.company_description,
        campaign_description: campaign.description,
        company_rep_name: campaign.representative_name,
        company_rep_role: campaign.representative_role,
        company_rep_email: campaign.representative_email,
        prospect_company_name: prospect.company_name,
        prospect_rep_name: prospect.name,
        prospect_rep_email: prospect.email
      };
      
      // Call the API
      const generatedEmail = await generateEmail(generationData);
      
      // Update the state with the API response
      setEmailContent({
        subject: generatedEmail.subject,
        body: generatedEmail.body
      });
      
      // Create a new email record in the database
      const { data: emailData, error } = await supabase
        .from('emails')
        .insert({
          prospect_id: prospect.id,
          subject: generatedEmail.subject,
          body: generatedEmail.body,
          status: 'draft'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update the prospect in the local state
      setProspects(prospects.map(p => 
        p.id === prospect.id ? { ...p, email_data: emailData } : p
      ));
      
      // Open the email dialog
      setEmailDialogOpen(true);
    } catch (error: any) {
      toast.error('Error generating email: ' + error.message);
      console.error('Error generating email:', error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const approveEmail = async () => {
    if (!selectedProspect?.email_data?.id || !campaign) return;
    
    try {
      setIsApproving(true);
      
      // Update the email status in the database
      const { data: emailData, error } = await supabase
        .from('emails')
        .update({
          status: 'approved',
          subject: emailContent.subject,
          body: emailContent.body
        })
        .eq('id', selectedProspect.email_data.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update the prospect in the local state
      setProspects(prospects.map(p => 
        p.id === selectedProspect.id ? { ...p, email_data: emailData } : p
      ));
      
      toast.success('Email approved successfully');
      setEmailDialogOpen(false);
      
      // Check if we have Mailjet API keys
      if (!mailjetKeys || !mailjetKeys.api_key || !mailjetKeys.secret_key) {
        toast.warning('Mailjet API keys not found. Please add them in settings to send emails.');
        return;
      }
      
      // Send the email via Mailjet
      const sendData = {
        from_email: campaign.representative_email,
        from_name: campaign.representative_name,
        to_email: selectedProspect.email,
        to_name: selectedProspect.name,
        subject: emailContent.subject,
        body: emailContent.body,
        mailjet_api_key: mailjetKeys.api_key,
        mailjet_api_secret: mailjetKeys.secret_key
      };
      
      // Call the send email API
      const response = await sendEmail(sendData);
      
      // Update email status to sent
      const { data, error: updateError } = await supabase
        .from('emails')
        .update({ status: 'sent' })
        .eq('id', selectedProspect.email_data.id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      
      // Update the prospect in the local state
      setProspects(prospects.map(p => 
        p.id === selectedProspect.id ? { ...p, email_data: data } : p
      ));
      
      toast.success(`Email sent to ${selectedProspect.name}`);
    } catch (error: any) {
      toast.error('Error approving/sending email: ' + error.message);
      console.error('Error approving/sending email:', error);
    } finally {
      setIsApproving(false);
    }
  };

  const rejectEmail = async () => {
    if (!selectedProspect?.email_data?.id) return;
    
    try {
      const { error } = await supabase
        .from('emails')
        .update({ status: 'rejected' })
        .eq('id', selectedProspect.email_data.id);
        
      if (error) throw error;
      
      // Update the prospects in local state
      const updatedProspects = [...prospects];
      const index = updatedProspects.findIndex(p => p.id === selectedProspect.id);
      if (index !== -1 && updatedProspects[index].email_data) {
        updatedProspects[index].email_data!.status = 'rejected';
        setProspects(updatedProspects);
      }
      
      toast.success('Email rejected and marked for revision');
      setEmailDialogOpen(false);
    } catch (error: any) {
      toast.error('Error rejecting email: ' + error.message);
      console.error('Error rejecting email:', error);
    }
  };

  const handleProspectAdded = () => {
    fetchCampaignData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex justify-center items-center">
          <Spinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-24 pb-16 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
            <Link to="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <Link to="/dashboard" className="mr-4">
                  <Button variant="outline" size="sm">
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                  <p className="mt-1 text-sm text-gray-500">{campaign.description}</p>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                      <Trash size={16} className="mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete the campaign and all associated prospects and emails.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={deleteCampaign}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Spinner size="sm" className="mr-2" /> : null}
                        {isDeleting ? "Deleting..." : "Delete Campaign"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Campaign Details</h2>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Company Information</h3>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Company Name:</span> {campaign.company_name || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Company Description:</span> {campaign.company_description || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Representative Information</h3>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Name:</span> {campaign.representative_name || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Role:</span> {campaign.representative_role || 'Not specified'}
                  </p>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Email:</span> {campaign.representative_email || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* API Keys Status */}
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email Sending Status</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {mailjetKeys && mailjetKeys.api_key && mailjetKeys.secret_key 
                      ? "Mailjet API keys configured. Email sending is enabled." 
                      : "Mailjet API keys not configured. Please add them in Settings to enable email sending."}
                  </p>
                </div>
                {(!mailjetKeys || !mailjetKeys.api_key || !mailjetKeys.secret_key) && (
                  <Link to="/settings">
                    <Button variant="outline" size="sm">
                      Configure in Settings
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Prospects Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Prospects List - Takes 2/3 of space on large screens */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-900">Prospects</h2>
                    <button 
                      onClick={() => setShowRequirements(!showRequirements)}
                      className="ml-2 text-xs text-brand-purple font-medium hover:underline md:hidden"
                    >
                      {showRequirements ? "Hide Requirements" : "View Requirements"}
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAddProspectDialogOpen(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setImportSheetOpen(true)}
                    >
                      <Upload size={16} className="mr-2" />
                      Import
                    </Button>
                  </div>
                </div>
                
                {/* Mobile view of requirements that can be toggled */}
                {showRequirements && (
                  <div className="md:hidden p-4 border-b border-gray-200">
                    <ProspectRequirements />
                  </div>
                )}
                
                {prospects.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Email Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prospects.map((prospect) => (
                          <TableRow key={prospect.id}>
                            <TableCell className="font-medium">{prospect.name}</TableCell>
                            <TableCell>{prospect.company_name}</TableCell>
                            <TableCell>{prospect.role}</TableCell>
                            <TableCell>{prospect.email}</TableCell>
                            <TableCell>
                              {prospect.email_data ? (
                                <div className="flex items-center">
                                  <span 
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                      ${prospect.email_data.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                        prospect.email_data.status === 'approved' ? 'bg-blue-100 text-blue-800' : 
                                        prospect.email_data.status === 'sent' ? 'bg-green-100 text-green-800' : 
                                        'bg-red-100 text-red-800'}`}
                                  >
                                    {prospect.email_data.status.charAt(0).toUpperCase() + prospect.email_data.status.slice(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">No email</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => generateEmailForProspect(prospect)}
                                  disabled={isGeneratingEmail}
                                >
                                  {prospect.email_data ? (
                                    <>
                                      <Pencil size={14} className="mr-1" />
                                      Edit
                                    </>
                                  ) : (
                                    <>
                                      <Send size={14} className="mr-1" />
                                      Generate
                                    </>
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No prospects</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding your first prospect or importing a CSV file.
                    </p>
                    <div className="mt-6 flex justify-center space-x-3">
                      <Button onClick={() => setAddProspectDialogOpen(true)}>
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Prospect
                      </Button>
                      <Button variant="outline" onClick={() => setImportSheetOpen(true)}>
                        <Upload className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Import CSV
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Requirements - Shows only on desktop, takes 1/3 of space */}
            <div className="hidden lg:block">
              <ProspectRequirements />
            </div>
          </div>
        </div>
      </main>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProspect?.email_data ? "Edit Email" : "Generated Email"}
            </DialogTitle>
            <DialogDescription>
              Review and approve the AI-generated email for {selectedProspect?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={rejectEmail} className="border-red-200 text-red-600 hover:bg-red-50">
              <X size={16} className="mr-2" />
              Reject
            </Button>
            <Button onClick={approveEmail} disabled={isApproving} className="bg-brand-purple hover:bg-brand-purple/90">
              {isApproving ? <Spinner size="sm" className="mr-2" /> : <Check size={16} className="mr-2" />}
              {isApproving ? "Approving..." : "Approve & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Prospect Dialog */}
      <AddProspectDialog 
        isOpen={addProspectDialogOpen} 
        onClose={() => setAddProspectDialogOpen(false)} 
        onProspectAdded={handleProspectAdded}
      />

      {/* Import Prospects Sheet */}
      <ImportProspectsSheet 
        isOpen={importSheetOpen} 
        onClose={() => setImportSheetOpen(false)} 
        onImportComplete={handleProspectAdded}
      />
      
      <Footer />
    </div>
  );
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700">{children}</label>
);

export default CampaignDetails;
