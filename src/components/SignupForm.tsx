
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SignupForm = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyDescription: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (isSignup) {
        toast.success("Account created successfully! Redirecting to dashboard...");
        // In a real app, you'd redirect to dashboard or send verification email
      } else {
        toast.success("Logged in successfully! Redirecting to dashboard...");
        // In a real app, you'd redirect to dashboard
      }
    }, 1500);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto border border-gray-200">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {isSignup ? "Create your account" : "Welcome back"}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {isSignup 
            ? "Start leveraging AI for your sales outreach" 
            : "Log in to access your campaigns"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required={isSignup}
              value={formData.name}
              onChange={handleChange}
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignup && (
              <a 
                href="#" 
                className="text-xs text-brand-purple hover:text-brand-purple/80"
              >
                Forgot password?
              </a>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={isSignup ? "Create a password" : "Enter your password"}
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="companyDescription">Company Description</Label>
            <Textarea
              id="companyDescription"
              name="companyDescription"
              placeholder="Tell us about your company"
              required={isSignup}
              value={formData.companyDescription}
              onChange={handleChange}
              className="min-h-24"
            />
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-brand-purple hover:bg-brand-purple/90"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : isSignup ? "Create Account" : "Log In"}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          {" "}
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-brand-purple hover:text-brand-purple/80 font-medium"
          >
            {isSignup ? "Log in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
