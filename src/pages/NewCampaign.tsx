
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NewCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_name: "",
    company_description: "",
    representative_name: "",
    representative_role: "",
    representative_email: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a campaign");
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...formData,
          user_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Campaign created successfully!");
      if (data) {
        navigate(`/campaigns/${data.id}`);
      }
    } catch (error: any) {
      toast.error("Error creating campaign: " + error.message);
      console.error("Error creating campaign:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center">
            <Link to="/dashboard" className="mr-4">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900">Campaign Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Provide basic information about your campaign
                </p>
                
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Campaign Name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Campaign Description
                    </label>
                    <div className="mt-1">
                      <Textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the purpose of this campaign"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-lg font-medium text-gray-900">Company Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Details about your company that will be used in email outreach
                </p>
                
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="company_name"
                        id="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="company_description" className="block text-sm font-medium text-gray-700">
                      Company Description
                    </label>
                    <div className="mt-1">
                      <Textarea
                        name="company_description"
                        id="company_description"
                        rows={3}
                        value={formData.company_description}
                        onChange={handleChange}
                        placeholder="Briefly describe what your company does"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-medium text-gray-900">Representative Information</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Who is sending these emails from your company
                </p>
                
                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="representative_name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="representative_name"
                        id="representative_name"
                        value={formData.representative_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="representative_role" className="block text-sm font-medium text-gray-700">
                      Role / Title
                    </label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="representative_role"
                        id="representative_role"
                        value={formData.representative_role}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-4">
                    <label htmlFor="representative_email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <Input
                        type="email"
                        name="representative_email"
                        id="representative_email"
                        value={formData.representative_email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link to="/dashboard">
                  <Button variant="outline" className="mr-3">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-brand-purple hover:bg-brand-purple/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewCampaign;
