
import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SignupForm from "@/components/SignupForm";

const Login = () => {
  const [searchParams] = useSearchParams();
  const isSignupMode = searchParams.get("signup") === "true";
  const selectedPlan = searchParams.get("plan");

  useEffect(() => {
    if (selectedPlan) {
      console.log(`Selected plan: ${selectedPlan}`);
      // In a real app, you would use this to pre-select a plan or show relevant info
    }
  }, [selectedPlan]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          {selectedPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    You selected the <span className="font-semibold capitalize">{selectedPlan}</span> plan. You'll configure this after sign-up.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <SignupForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
