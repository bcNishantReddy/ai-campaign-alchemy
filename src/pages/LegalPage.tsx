
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useParams } from "react-router-dom";

const LegalPage = () => {
  const { documentType } = useParams();
  
  // Map document types to titles and descriptions
  const documentContent = {
    "privacy": {
      title: "Privacy Policy",
      description: "Information about how we collect, use, and protect your personal data."
    },
    "terms": {
      title: "Terms of Service",
      description: "The terms and conditions that govern your use of our platform and services."
    },
    "cookie-policy": {
      title: "Cookie Policy",
      description: "Information about how we use cookies and similar technologies on our website."
    },
    default: {
      title: "Legal Information",
      description: "Important legal documents and policies for youraicampaign.com."
    }
  };

  const content = documentType && documentType in documentContent 
    ? documentContent[documentType as keyof typeof documentContent] 
    : documentContent.default;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{content.title}</h1>
          <p className="mt-4 text-xl text-gray-500">{content.description}</p>
          
          <div className="mt-12 bg-white p-8 rounded-lg shadow">
            <p className="text-gray-600">
              This document is currently being updated. Please check back soon for the complete {content.title}.
            </p>
            <p className="mt-4 text-gray-600">
              For any legal inquiries, please contact us at <a href="mailto:krocodileai@gmail.com" className="text-brand-purple">krocodileai@gmail.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPage;
