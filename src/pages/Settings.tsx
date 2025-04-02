import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Key, Lock, User } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Profile, UserApiKeys } from "@/types/database.types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company_description: z.string().optional(),
});

const apiKeysSchema = z.object({
  mailjet_api_key: z.string().min(1, "API Key is required"),
  mailjet_secret_key: z.string().min(1, "Secret Key is required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [apiKeys, setApiKeys] = useState<UserApiKeys | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      company_description: "",
    },
  });

  const apiKeysForm = useForm<z.infer<typeof apiKeysSchema>>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      mailjet_api_key: "",
      mailjet_secret_key: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfile(profileData as Profile);
        
        if (profileData) {
          profileForm.reset({
            name: profileData.name || "",
            company_description: profileData.company_description || "",
          });
        }
        
        try {
          // Query for user_api_keys using custom approach
          const { data: apiKeysData, error: apiKeysError } = await supabase
            .from("user_api_keys")
            .select("*")
            .eq("user_id", user.id)
            .single();
            
          if (!apiKeysError) {
            setApiKeys(apiKeysData as UserApiKeys);
            
            if (apiKeysData) {
              apiKeysForm.reset({
                mailjet_api_key: apiKeysData.mailjet_api_key || "",
                mailjet_secret_key: apiKeysData.mailjet_secret_key || "",
              });
            }
          }
        } catch (apiKeyError) {
          console.error("Error fetching API keys:", apiKeyError);
        }
        
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const onSubmitProfile = async (values: z.infer<typeof profileSchema>) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from("profiles")
        .update({
          name: values.name,
          company_description: values.company_description,
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      toast.success("Profile updated successfully");
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          name: values.name,
          company_description: values.company_description,
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const onSubmitApiKeys = async (values: z.infer<typeof apiKeysSchema>) => {
    try {
      if (!user) return;
      
      // Using a custom query approach for user_api_keys
      if (apiKeys) {
        // Update existing API keys
        const { error } = await supabase
          .from("user_api_keys")
          .update({
            mailjet_api_key: values.mailjet_api_key,
            mailjet_secret_key: values.mailjet_secret_key,
          })
          .eq("id", apiKeys.id);
          
        if (error) throw error;
      } else {
        // Insert new API keys
        const { error } = await supabase
          .from("user_api_keys")
          .insert({
            user_id: user.id,
            mailjet_api_key: values.mailjet_api_key,
            mailjet_secret_key: values.mailjet_secret_key,
          });
          
        if (error) throw error;
        
        // Fetch the newly created API keys
        try {
          const { data, error: fetchError } = await supabase
            .from("user_api_keys")
            .select("*")
            .eq("user_id", user.id)
            .single();
            
          if (!fetchError && data) {
            setApiKeys(data as UserApiKeys);
          }
        } catch (fetchError) {
          console.error("Error fetching new API keys:", fetchError);
        }
      }
      
      toast.success("API keys saved successfully");
    } catch (error: any) {
      console.error("Error saving API keys:", error);
      toast.error("Failed to save API keys");
    }
  };

  const onSubmitPassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.newPassword,
      });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
      passwordForm.reset();
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    try {
      setUploadingPhoto(true);
      
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('profiles')
        .upload(`public/${fileName}`, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(`public/${fileName}`);
      
      // Update profile with new photo URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo: publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          profile_photo: publicUrl,
        });
      }
      
      toast.success("Profile photo updated successfully");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account settings and preferences
            </p>
          </div>
          
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User size={16} />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center space-x-2">
                <Key size={16} />
                <span>API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center space-x-2">
                <Lock size={16} />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Photo</CardTitle>
                    <CardDescription>
                      Update your profile picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      {profile?.profile_photo ? (
                        <AvatarImage src={profile.profile_photo} alt={profile.name || "User"} />
                      ) : (
                        <AvatarFallback className="text-2xl">
                          {profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-brand-purple text-white px-4 py-2 rounded-md hover:bg-brand-purple/90">
                        <Upload size={16} />
                        <span>{uploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
                      </div>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploadingPhoto}
                      />
                    </Label>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="company_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Describe your company" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-brand-purple hover:bg-brand-purple/90"
                          disabled={profileForm.formState.isSubmitting}
                        >
                          {profileForm.formState.isSubmitting ? (
                            <Spinner className="mr-2" />
                          ) : null}
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="api-keys">
              <Card>
                <CardHeader>
                  <CardTitle>Mailjet API Configuration</CardTitle>
                  <CardDescription>
                    Configure your Mailjet API keys to send emails through your campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...apiKeysForm}>
                    <form onSubmit={apiKeysForm.handleSubmit(onSubmitApiKeys)} className="space-y-4">
                      <FormField
                        control={apiKeysForm.control}
                        name="mailjet_api_key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mailjet API Key</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter Mailjet API key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={apiKeysForm.control}
                        name="mailjet_secret_key"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mailjet Secret Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter Mailjet secret key" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-purple hover:bg-brand-purple/90"
                        disabled={apiKeysForm.formState.isSubmitting}
                      >
                        {apiKeysForm.formState.isSubmitting ? (
                          <Spinner className="mr-2" />
                        ) : null}
                        Save API Keys
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter current password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-brand-purple hover:bg-brand-purple/90"
                        disabled={passwordForm.formState.isSubmitting}
                      >
                        {passwordForm.formState.isSubmitting ? (
                          <Spinner className="mr-2" />
                        ) : null}
                        Update Password
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;
