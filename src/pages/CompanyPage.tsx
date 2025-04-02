
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams } from "react-router-dom";

const CompanyPage = () => {
  const { pageType } = useParams();
  
  // Map page types to titles and descriptions
  const pageContent = {
    "about": {
      title: "About youraicampaign.com",
      description: "Learn about our mission, vision, and the team behind youraicampaign.com."
    },
    "blog": {
      title: "Blog",
      description: "Insights, tips, and news from the world of AI-powered sales outreach."
    },
    "jobs": {
      title: "Careers at youraicampaign.com",
      description: "Join our team and help revolutionize sales outreach with AI technology."
    },
    "press": {
      title: "Press & Media",
      description: "News, press releases, and media resources about youraicampaign.com."
    },
    default: {
      title: "youraicampaign.com",
      description: "Revolutionizing sales outreach with AI-powered technology."
    }
  };

  const content = pageType && pageType in pageContent 
    ? pageContent[pageType as keyof typeof pageContent] 
    : pageContent.default;

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
              For immediate assistance, please contact us at <a href="mailto:krocodileai@gmail.com" className="text-brand-purple">krocodileai@gmail.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyPage;
