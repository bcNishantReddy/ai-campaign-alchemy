
import { Link } from "react-router-dom";
import { Mail, Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div>
              <Link to="/" className="text-brand-purple font-bold text-xl">youraicampaign.com</Link>
              <p className="text-gray-500 text-sm mt-2">
                Revolutionizing sales outreach with AI-powered campaigns that deliver results.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <Linkedin size={20} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <Github size={20} />
              </a>
              <a href="mailto:krocodileai@gmail.com" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Email</span>
                <Mail size={20} />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Solutions
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/solutions/sales-outreach" className="text-base text-gray-500 hover:text-gray-900">
                      Sales Outreach
                    </Link>
                  </li>
                  <li>
                    <Link to="/solutions/lead-generation" className="text-base text-gray-500 hover:text-gray-900">
                      Lead Generation
                    </Link>
                  </li>
                  <li>
                    <Link to="/solutions/email-campaigns" className="text-base text-gray-500 hover:text-gray-900">
                      Email Campaigns
                    </Link>
                  </li>
                  <li>
                    <Link to="/solutions/campaign-analytics" className="text-base text-gray-500 hover:text-gray-900">
                      Campaign Analytics
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/support/documentation" className="text-base text-gray-500 hover:text-gray-900">
                      Documentation
                    </Link>
                  </li>
                  <li>
                    <Link to="/support/guides" className="text-base text-gray-500 hover:text-gray-900">
                      Guides
                    </Link>
                  </li>
                  <li>
                    <Link to="/support/api-status" className="text-base text-gray-500 hover:text-gray-900">
                      API Status
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:krocodileai@gmail.com?subject=Support%20Request" className="text-base text-gray-500 hover:text-gray-900">
                      Contact Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/company/about" className="text-base text-gray-500 hover:text-gray-900">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link to="/company/blog" className="text-base text-gray-500 hover:text-gray-900">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/company/jobs" className="text-base text-gray-500 hover:text-gray-900">
                      Jobs
                    </Link>
                  </li>
                  <li>
                    <Link to="/company/press" className="text-base text-gray-500 hover:text-gray-900">
                      Press
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/legal/privacy" className="text-base text-gray-500 hover:text-gray-900">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link to="/legal/terms" className="text-base text-gray-500 hover:text-gray-900">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link to="/legal/cookie-policy" className="text-base text-gray-500 hover:text-gray-900">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; {currentYear} youraicampaign.com. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
