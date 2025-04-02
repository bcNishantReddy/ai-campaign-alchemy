
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, BarChart, Zap, ShieldCheck } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-white pt-20 pb-12">
      <div className="absolute inset-0 hero-pattern opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
            <div className="lg:py-8">
              <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 sm:mt-5 sm:text-5xl lg:mt-6">
                <span className="block text-gradient">
                  Revolutionize Your Sales
                </span>
                <span className="block">
                  Outreach with AI
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Streamline your sales outreach and boost conversion with AI-driven email generation, real-time prospecting, and automated campaign management.
              </p>
              <div className="mt-8 sm:mt-12">
                <div className="sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link to="/login?signup=true">
                      <Button className="w-full flex items-center justify-center px-8 py-6 text-base font-medium rounded-md text-white bg-brand-purple hover:bg-brand-purple/90 md:py-5 md:text-lg md:px-10">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link to="/login">
                      <Button variant="outline" className="w-full flex items-center justify-center px-8 py-6 text-base font-medium rounded-md md:py-5 md:text-lg md:px-10">
                        Request Demo
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white overflow-hidden rounded-lg border border-gray-200">
                <div className="px-4 pt-5 pb-4 bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 h-[350px] flex flex-col items-center justify-center space-y-8">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-purple text-white">
                      <Mail className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">AI-Powered Email Generation</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-brand-blue text-white">
                      <BarChart className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Real-time Campaign Analytics</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Automated Prospecting</p>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-3">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <p className="text-lg font-medium text-gray-900">Secure Workflows</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
