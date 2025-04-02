
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams } from "react-router-dom";

const SupportPage = () => {
  const { supportType } = useParams();
  
  // Map support types to titles and descriptions
  const supportContent = {
    "documentation": {
      title: "Documentation",
      description: "Comprehensive guides and documentation to help you get the most out of our platform."
    },
    "guides": {
      title: "User Guides",
      description: "Step-by-step guides to help you navigate our platform and maximize your results."
    },
    "api-status": {
      title: "API Status",
      description: "Check the current status of our API services and view historical uptime information."
    },
    default: {
      title: "Support Center",
      description: "Get the help you need to succeed with our platform."
    }
  };

  const content = supportType && supportType in supportContent 
    ? supportContent[supportType as keyof typeof supportContent] 
    : supportContent.default;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{content.title}</h1>
          <p className="mt-4 text-xl text-gray-500">{content.description}</p>
          
          <div className="mt-12 bg-white p-8 rounded-lg shadow">
            <p className="text-gray-600">
              This page is currently under development. Please check back soon for more information.
            </p>
            <p className="mt-4 text-gray-600">
              For immediate support, please contact us at <a href="mailto:krocodileai@gmail.com" className="text-brand-purple">krocodileai@gmail.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;
