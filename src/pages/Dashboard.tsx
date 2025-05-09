
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Mail, Users, BarChart3, Clock, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Campaign, Profile } from "@/types/database.types";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalEmails: number;
  totalProspects: number;
  pendingApprovals: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalEmails: 0,
    totalProspects: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else {
            setProfile(profileData as Profile);
          }
        }
        
        // Fetch campaigns
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user?.id || '')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCampaigns(data || []);

        // Fetch statistics after campaigns are loaded
        if (user) {
          await fetchDashboardStats(user.id);
        }
      } catch (error: any) {
        toast.error('Error loading campaigns: ' + error.message);
        console.error('Error loading campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const fetchDashboardStats = async (userId: string) => {
    try {
      // Get all campaign IDs for the user
      const { data: userCampaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', userId);

      if (campaignsError) throw campaignsError;
      
      if (!userCampaigns || userCampaigns.length === 0) {
        setStats({ totalEmails: 0, totalProspects: 0, pendingApprovals: 0 });
        return;
      }

      const campaignIds = userCampaigns.map(campaign => campaign.id);

      // Get total prospects
      const { count: totalProspects, error: prospectsError } = await supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .in('campaign_id', campaignIds);

      if (prospectsError) throw prospectsError;

      // Get prospects IDs to fetch emails
      const { data: prospectIds, error: prospectIdsError } = await supabase
        .from('prospects')
        .select('id')
        .in('campaign_id', campaignIds);

      if (prospectIdsError) throw prospectIdsError;

      if (!prospectIds || prospectIds.length === 0) {
        setStats({ totalEmails: 0, totalProspects: totalProspects || 0, pendingApprovals: 0 });
        return;
      }

      const pIds = prospectIds.map(p => p.id);

      // Get sent emails count
      const { count: sentEmails, error: sentEmailsError } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .in('prospect_id', pIds)
        .eq('status', 'sent');

      if (sentEmailsError) throw sentEmailsError;

      // Get pending approval emails count
      const { count: pendingApprovals, error: pendingApprovalsError } = await supabase
        .from('emails')
        .select('*', { count: 'exact', head: true })
        .in('prospect_id', pIds)
        .eq('status', 'draft');

      if (pendingApprovalsError) throw pendingApprovalsError;

      setStats({
        totalEmails: sentEmails || 0,
        totalProspects: totalProspects || 0,
        pendingApprovals: pendingApprovals || 0
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const getUserInitial = () => {
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (profile?.name) {
      return profile.name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (campaign.description && campaign.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 text-white p-4 rounded-t-lg mb-8">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 bg-brand-purple mr-3">
                {profile?.profile_photo ? (
                  <AvatarImage src={profile.profile_photo} alt={getUserDisplayName()} />
                ) : (
                  <AvatarFallback>{getUserInitial()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">AI Campaign Dashboard</h1>
                <p className="text-sm text-gray-300">Welcome back, {getUserDisplayName()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="mt-4 md:mt-0 flex justify-end">
              <Link to="/campaigns/new">
                <Button className="bg-brand-purple hover:bg-brand-purple/90">
                  <Plus size={16} className="mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-brand-purple/10 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Campaigns</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{campaigns.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-brand-purple/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Emails Sent</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.totalEmails}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-brand-purple/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Prospects</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.totalProspects}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-brand-purple/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-brand-purple" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Your Campaigns</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search campaigns..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Spinner />
              </div>
            ) : filteredCampaigns.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {filteredCampaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <Link to={`/campaigns/${campaign.id}`} className="block hover:bg-gray-50">
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="min-w-0 flex-1 px-4">
                              <p className="text-sm font-medium text-brand-purple truncate">{campaign.name}</p>
                              <p className="mt-1 text-sm text-gray-500 truncate">{campaign.description || 'No description'}</p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {campaign.status || 'Active'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between text-sm text-gray-500">
                          <p>
                            Created: {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                          <p className="flex items-center">
                            <Mail className="mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                            {stats.totalEmails} emails
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'No campaigns match your search.' : 'Get started by creating a new campaign.'}
                </p>
                {!searchQuery && (
                  <div className="mt-6">
                    <Link to="/campaigns/new">
                      <Button className="bg-brand-purple hover:bg-brand-purple/90">
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        New Campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
