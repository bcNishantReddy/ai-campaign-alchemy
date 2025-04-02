
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams } from "react-router-dom";

const SolutionsPage = () => {
  const { solutionType } = useParams();
  
  // Map solution types to titles and descriptions
  const solutionContent = {
    "sales-outreach": {
      title: "Sales Outreach Solutions",
      description: "Our AI-powered sales outreach tools help you connect with prospects more effectively and close more deals."
    },
    "lead-generation": {
      title: "Lead Generation Solutions",
      description: "Generate high-quality leads with our AI tools that identify and qualify the best prospects for your business."
    },
    "email-campaigns": {
      title: "Email Campaign Solutions",
      description: "Create, manage, and optimize email campaigns that convert using our advanced AI technology."
    },
    "campaign-analytics": {
      title: "Campaign Analytics Solutions",
      description: "Get detailed insights and analytics on your campaigns to continuously improve your results."
    },
    default: {
      title: "Our Solutions",
      description: "Explore our range of AI-powered sales and marketing solutions designed to help your business grow."
    }
  };

  const content = solutionType && solutionType in solutionContent 
    ? solutionContent[solutionType as keyof typeof solutionContent] 
    : solutionContent.default;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{content.title}</h1>
          <p className="mt-4 text-xl text-gray-500">{content.description}</p>
          
          <div className="mt-12 bg-white p-8 rounded-lg shadow">
            <p className="text-gray-600">
              This page is currently under development. Please check back soon for more information about our {solutionType?.replace('-', ' ')} solutions.
            </p>
            <p className="mt-4 text-gray-600">
              For immediate assistance or to learn more, please contact us at <a href="mailto:krocodileai@gmail.com" className="text-brand-purple">krocodileai@gmail.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SolutionsPage;
