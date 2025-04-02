
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          We're building an amazing dashboard for you to manage your AI-powered campaigns.
        </p>
        <Link to="/">
          <Button className="bg-brand-purple hover:bg-brand-purple/90">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
