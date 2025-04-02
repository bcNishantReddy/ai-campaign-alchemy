
import { BarChart3, Mail, Users, CheckCircle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const DashboardPreview = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 max-w-5xl mx-auto">
      {/* Dashboard Header - Updated to match the image */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 bg-brand-purple mr-3">
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-xl">AI Campaign Dashboard</h3>
            <p className="text-sm text-gray-300">Welcome back, Alex</p>
          </div>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50">
        <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Campaigns</span>
            <span className="bg-blue-100 text-blue-800 p-1 rounded-full">
              <BarChart3 size={14} />
            </span>
          </div>
          <p className="text-2xl font-semibold mt-2">12</p>
          <span className="text-xs text-green-600 mt-1">↑ 24% from last month</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Emails Sent</span>
            <span className="bg-purple-100 text-purple-800 p-1 rounded-full">
              <Mail size={14} />
            </span>
          </div>
          <p className="text-2xl font-semibold mt-2">1,284</p>
          <span className="text-xs text-green-600 mt-1">↑ 12% from last week</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Prospects</span>
            <span className="bg-green-100 text-green-800 p-1 rounded-full">
              <Users size={14} />
            </span>
          </div>
          <p className="text-2xl font-semibold mt-2">326</p>
          <span className="text-xs text-green-600 mt-1">↑ 18% from last month</span>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Response Rate</span>
            <span className="bg-orange-100 text-orange-800 p-1 rounded-full">
              <CheckCircle size={14} />
            </span>
          </div>
          <p className="text-2xl font-semibold mt-2">22%</p>
          <span className="text-xs text-green-600 mt-1">↑ 5% from last campaign</span>
        </div>
      </div>
      
      {/* Campaigns Table */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-800">Recent Campaigns</h3>
          <button className="text-sm text-brand-purple">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emails
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Q2 SaaS Outreach</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  245/500
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  52 (21%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-gray-400" />
                    2 hours ago
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Tech Decision Makers</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  189/250
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  43 (23%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-gray-400" />
                    5 hours ago
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">Enterprise Follow-up</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Drafting
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0/150
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1 text-gray-400" />
                    1 day ago
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
