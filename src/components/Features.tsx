
import { 
  SparklesIcon, 
  BriefcaseIcon, 
  MailIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  CheckIcon 
} from "lucide-react";

const features = [
  {
    name: "AI-powered personalized emails",
    description: "Automatically generate highly personalized emails that resonate with your prospects based on their company profile and role.",
    icon: SparklesIcon,
  },
  {
    name: "Automated prospecting",
    description: "Let our AI find and validate the right contacts at target companies, saving your team countless hours of manual research.",
    icon: BriefcaseIcon,
  },
  {
    name: "Streamlined approval workflows",
    description: "Review and approve AI-generated emails with a simple click, ensuring quality control while maintaining efficiency.",
    icon: CheckIcon,
  },
  {
    name: "Real-time campaign management",
    description: "Monitor campaign performance in real-time, with comprehensive analytics and insights to optimize your outreach.",
    icon: ClockIcon,
  },
  {
    name: "Secure platform",
    description: "Enterprise-grade security and compliance features keep your data and your customers' information protected at all times.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Integrated email sending",
    description: "Send your approved emails directly through our platform with perfect deliverability and tracking capabilities.",
    icon: MailIcon,
  },
];

const Features = () => {
  return (
    <div id="features" className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 space-y-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-brand-purple uppercase tracking-wide">
            Features
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Everything you need for successful sales outreach
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our AI-powered platform streamlines every aspect of your sales development process
          </p>
        </div>

        <div className="mt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="pt-6 h-full">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 h-full border border-gray-100 hover:border-brand-purple/20 hover:shadow-md transition-all duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-brand-blue to-brand-purple rounded-md shadow-lg">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
