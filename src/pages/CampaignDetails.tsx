import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash, Send, Check, X, Pencil, Upload, Users, Edit, Mail, RefreshCw } from "lucide-react";
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
import EditCampaignDialog from "@/components/EditCampaignDialog";
import { generateEmail, sendEmail, deleteCampaignWithRelated } from "@/services/emailService";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProspectEmailDialog from "@/components/ProspectEmailDialog";
import CampaignDetailsSidebar from "@/components/CampaignDetailsSidebar";

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
  const [editCampaignDialogOpen, setEditCampaignDialogOpen] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [mailjetKeys, setMailjetKeys] = useState<{api_key: string; secret_key: string} | null>(null);
  const [prospectLoadingStates, setProspectLoadingStates] = useState<Record<string, boolean>>({});
  const [deleteProspectId, setDeleteProspectId] = useState<string | null>(null);
  const [isDeletingProspect, setIsDeletingProspect] = useState(false);
  const [deleteProspectDialogOpen, setDeleteProspectDialogOpen] = useState(false);

  const fetchCampaignData = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
        
      if (campaignError) throw campaignError;
      setCampaign(campaignData as Campaign);
      
      const { data: prospectsData, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('campaign_id', id);
        
      if (prospectsError) throw prospectsError;
      
      const prospectIds = (prospectsData || []).map(prospect => prospect.id);
      
      let emailsData: any[] = [];
      
      if (prospectIds.length > 0) {
        const { data: emails, error: emailsError } = await supabase
          .from('emails')
          .select('*')
          .in('prospect_id', prospectIds);
          
        if (emailsError) {
          console.error("Error fetching emails:", emailsError);
        } else {
          emailsData = emails || [];
          console.log(`Fetched ${emailsData.length} emails for ${prospectIds.length} prospects`);
        }
      }
      
      const prospectsWithEmails: ProspectWithEmail[] = (prospectsData || []).map(prospect => {
        const email = emailsData.find(email => email.prospect_id === prospect.id);
        return {
          ...prospect,
          email_data: email || null
        } as ProspectWithEmail;
      });
      
      setProspects(prospectsWithEmails);
      
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
      
      await deleteCampaignWithRelated(id);
      
      toast.success('Campaign deleted successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Error deleting campaign: ' + error.message);
      console.error('Error deleting campaign:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteProspect = async () => {
    if (!deleteProspectId) return;
    
    try {
      setIsDeletingProspect(true);
      
      const { error: emailError } = await supabase
        .from('emails')
        .delete()
        .eq('prospect_id', deleteProspectId);
        
      if (emailError) throw emailError;
      
      const { error: prospectError } = await supabase
        .from('prospects')
        .delete()
        .eq('id', deleteProspectId);
        
      if (prospectError) throw prospectError;
      
      setProspects(prospects.filter(p => p.id !== deleteProspectId));
      toast.success('Prospect deleted successfully');
      
    } catch (error: any) {
      toast.error('Error deleting prospect: ' + error.message);
      console.error('Error deleting prospect:', error);
    } finally {
      setIsDeletingProspect(false);
      setDeleteProspectDialogOpen(false);
      setDeleteProspectId(null);
    }
  };

  const generateEmailForProspect = async (prospect: ProspectWithEmail, regenerate: boolean = false) => {
    if (!campaign) return;
    
    setProspectLoadingStates(prev => ({ ...prev, [prospect.id]: true }));
    
    setSelectedProspect(prospect);
    
    try {
      if (prospect.email_data && !regenerate) {
        setEmailContent({
          subject: prospect.email_data.subject || '',
          body: prospect.email_data.body || ''
        });
        setEmailDialogOpen(true);
        setProspectLoadingStates(prev => ({ ...prev, [prospect.id]: false }));
        return;
      }
      
      setIsGeneratingEmail(true);
      
      const generatingToast = toast.loading(`${regenerate ? 'Regenerating' : 'Generating'} email for ${prospect.name}...`);
      
      const generationData = {
        company_name: campaign.company_name || 'Your Company',
        company_description: campaign.company_description || 'No description provided.',
        campaign_description: campaign.description || 'No description provided.',
        company_rep_name: campaign.representative_name || 'Representative',
        company_rep_role: campaign.representative_role || 'Role',
        company_rep_email: campaign.representative_email || 'email@example.com',
        prospect_company_name: prospect.company_name || 'Prospect Company',
        prospect_rep_name: prospect.name || 'Prospect',
        prospect_rep_email: prospect.email || 'prospect@example.com',
        prospect_rep_role: prospect.role || 'Unknown Role',
        prospect_id: prospect.id
      };
      
      console.log("Sending email generation data:", generationData);
      
      const generatedEmail = await generateEmail(generationData);
      
      toast.dismiss(generatingToast);
      
      toast.success(`Email ${regenerate ? 'regenerated' : 'generated'} for ${prospect.name}`);
      
      setEmailContent({
        subject: generatedEmail.subject || '',
        body: generatedEmail.body || ''
      });
      
      if (generatedEmail.email_record) {
        setProspects(prospects.map(p => 
          p.id === prospect.id ? { ...p, email_data: generatedEmail.email_record } : p
        ));
      } else {
        const { data: emailData, error } = await supabase
          .from('emails')
          .select('*')
          .eq('prospect_id', prospect.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching email:", error);
        } else if (emailData) {
          setProspects(prospects.map(p => 
            p.id === prospect.id ? { ...p, email_data: emailData } : p
          ));
        } else {
          console.warn("No email record returned from API or found in database, creating one manually");
          const { data: newEmail, error: insertError } = await supabase
            .from('emails')
            .insert({
              prospect_id: prospect.id,
              subject: generatedEmail.subject,
              body: generatedEmail.body,
              status: 'draft'
            })
            .select()
            .single();
            
          if (insertError) {
            console.error("Error creating email record:", insertError);
          } else {
            setProspects(prospects.map(p => 
              p.id === prospect.id ? { ...p, email_data: newEmail } : p
            ));
          }
        }
      }
      
      setEmailDialogOpen(true);
    } catch (error: any) {
      toast.error('Error generating email: ' + error.message);
      console.error('Error generating email:', error);
    } finally {
      setIsGeneratingEmail(false);
      setProspectLoadingStates(prev => ({ ...prev, [prospect.id]: false }));
    }
  };

  const approveEmail = async () => {
    if (!selectedProspect?.email_data?.id || !campaign) return;
    
    try {
      setIsApproving(true);
      
      const { data: emailData, error } = await supabase
        .from('emails')
        .update({
          status: 'approved',
          subject: emailContent.subject,
          body: emailContent.body,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProspect.email_data.id)
        .select()
        .single();
        
      if (error) throw error;
      
      setProspects(prospects.map(p => 
        p.id === selectedProspect.id ? { ...p, email_data: emailData as Email } : p
      ));
      
      toast.success('Email approved successfully');
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.warning('User not authenticated. Please log in again.');
        setIsApproving(false);
        setEmailDialogOpen(false);
        return;
      }
      
      const sendingToast = toast.loading(`Sending email to ${selectedProspect.name}...`);
      
      const sendData = {
        from_email: campaign.representative_email || '',
        from_name: campaign.representative_name || '',
        to_email: selectedProspect.email || '',
        to_name: selectedProspect.name || '',
        subject: emailContent.subject,
        body: emailContent.body,
        user_id: sessionData.session.user.id,
        email_id: selectedProspect.email_data.id
      };
      
      const response = await sendEmail(sendData);
      
      toast.dismiss(sendingToast);
      
      const { data, error: updateError } = await supabase
        .from('emails')
        .update({ 
          status: 'sent',
          updated_at: new Date().toISOString() 
        })
        .eq('id', selectedProspect.email_data.id)
        .select()
        .single();
        
      if (updateError) throw updateError;
      
      setProspects(prospects.map(p => 
        p.id === selectedProspect.id ? { ...p, email_data: data as Email } : p
      ));
      
      toast.success(`Email sent to ${selectedProspect.name}`);
      setEmailDialogOpen(false);
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
      
      const updatedProspects = prospects.map(p => {
        if (p.id === selectedProspect.id && p.email_data) {
          return {
            ...p,
            email_data: {
              ...p.email_data,
              status: 'rejected'
            }
          } as ProspectWithEmail;
        }
        return p;
      });
      
      setProspects(updatedProspects);
      
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

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaign(updatedCampaign);
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-brand-purple border-brand-purple/20 hover:bg-brand-purple/10"
                  onClick={() => setEditCampaignDialogOpen(true)}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
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

          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Campaign Details</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditCampaignDialogOpen(true)}
                className="md:hidden"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-9">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <h2 className="text-lg font-medium text-gray-900">Prospects</h2>
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
                                  disabled={prospectLoadingStates[prospect.id] || isGeneratingEmail}
                                >
                                  {prospectLoadingStates[prospect.id] ? (
                                    <>
                                      <Spinner size="sm" className="mr-2" />
                                      Processing...
                                    </>
                                  ) : prospect.email_data ? (
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
                                
                                {prospect.email_data && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => generateEmailForProspect(prospect, true)}
                                    disabled={prospectLoadingStates[prospect.id] || isGeneratingEmail}
                                    title="Regenerate Email"
                                  >
                                    <RefreshCw size={14} />
                                  </Button>
                                )}
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteProspectId(prospect.id);
                                    setDeleteProspectDialogOpen(true);
                                  }}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <Trash size={14} />
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
            
            <div className="lg:col-span-3">
              <CampaignDetailsSidebar />
            </div>
          </div>
        </div>
      </main>

      {selectedProspect && campaign && (
        <ProspectEmailDialog
          isOpen={emailDialogOpen}
          onClose={() => setEmailDialogOpen(false)}
          prospect={selectedProspect}
          campaign={campaign}
          emailContent={emailContent}
          setEmailContent={setEmailContent}
          isApproving={isApproving}
          onApprove={approveEmail}
          onReject={rejectEmail}
        />
      )}

      <AddProspectDialog 
        isOpen={addProspectDialogOpen} 
        onClose={() => setAddProspectDialogOpen(false)} 
        onProspectAdded={handleProspectAdded}
      />

      <ImportProspectsSheet 
        isOpen={importSheetOpen} 
        onClose={() => setImportSheetOpen(false)} 
        onImportComplete={handleProspectAdded}
      />
      
      {campaign && (
        <EditCampaignDialog
          campaign={campaign}
          isOpen={editCampaignDialogOpen}
          onClose={() => setEditCampaignDialogOpen(false)}
          onCampaignUpdated={handleCampaignUpdated}
        />
      )}

      <AlertDialog open={deleteProspectDialogOpen} onOpenChange={setDeleteProspectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prospect</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prospect? This will also remove any associated emails and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteProspectDialogOpen(false);
              setDeleteProspectId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteProspect}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeletingProspect}
            >
              {isDeletingProspect ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Prospect"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default CampaignDetails;
