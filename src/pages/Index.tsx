
import { useRef } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DashboardPreview from "@/components/DashboardPreview";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, LineChart, Lock } from "lucide-react";

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return <div className="min-h-screen flex flex-col">
      <Navbar onFeaturesClick={scrollToFeatures} onPricingClick={scrollToPricing} />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <div ref={featuresRef}>
          <Features />
        </div>

        {/* Dashboard Preview Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-base font-semibold text-brand-purple uppercase tracking-wide">
                Dashboard
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Powerful campaign management
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Our intuitive dashboard gives you all the tools you need to manage your sales campaigns effectively
              </p>
            </div>

            <DashboardPreview />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" ref={pricingRef} className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base font-semibold text-brand-purple uppercase tracking-wide">
                Pricing
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                Plans for businesses of all sizes
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                Choose the perfect plan for your sales outreach needs
              </p>
            </div>

            <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
              {/* Free Plan */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Free</h3>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">₹0</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </p>
                  <p className="mt-6 text-gray-500">Perfect for individuals exploring AI-powered sales outreach.</p>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">100 emails per month</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Basic AI email generation</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Limited analytics</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">1 team member</p>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link to="/login?signup=true&plan=free">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="p-8 bg-white border-2 border-brand-purple rounded-lg shadow-md flex flex-col relative">
                <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                  <div className="inline-block px-4 py-1 text-sm font-semibold uppercase tracking-wider text-white bg-brand-purple rounded-full">
                    Most Popular
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-5xl font-extrabold tracking-tight">₹1999</span>
                    <span className="ml-1 text-xl font-semibold">/month</span>
                  </p>
                  <p className="mt-6 text-gray-500">Advanced features for growing sales teams with higher volume needs.</p>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">5,000 emails per month</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Advanced AI personalization</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">
                        <span className="font-medium">Full</span> analytics suite
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <LineChart className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Campaign performance reports</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">10 team members</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Priority support</p>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link to="/login?signup=true&plan=professional">
                    <Button className="w-full bg-brand-purple hover:bg-brand-purple/90">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
                  <p className="mt-4 flex items-baseline text-gray-900">
                    <span className="text-2xl font-extrabold tracking-tight">Custom Pricing</span>
                  </p>
                  <p className="mt-6 text-gray-500">Custom solutions for large organizations with complex sales needs.</p>

                  <ul className="mt-6 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Unlimited emails</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Custom AI models</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Advanced integrations</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Lock className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Enterprise-grade security</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Unlimited team members</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">Dedicated account manager</p>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <a href="mailto:krocodileai@gmail.com?subject=Enterprise%20Plan%20Inquiry&body=I'm%20interested%20in%20learning%20more%20about%20the%20Enterprise%20plan.">
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-brand-purple">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to boost your sales?</span>
              <span className="block text-indigo-200">Start your free trial today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link to="/login?signup=true">
                  <Button className="py-4 px-6 text-base font-medium rounded-md text-brand-purple bg-white hover:bg-gray-50">
                    Get started
                  </Button>
                </Link>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
                <a href="mailto:krocodileai@gmail.com" className="py-4 px-6 text-base font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90">
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};

export default Index;
