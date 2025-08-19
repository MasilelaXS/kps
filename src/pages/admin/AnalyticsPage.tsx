import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { Button } from '@heroui/react';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="light"
              onPress={() => navigate('/admin/reports')}
              startContent={<ArrowLeft className="h-4 w-4" />}
              className="text-gray-600 hover:text-gray-800"
            >
              Back to Reports
            </Button>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* Icon Grid */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                <PieChart className="h-8 w-8 text-green-600" />
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Coming Soon Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Analytics Metrics Coming Soon
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            We're working on comprehensive analytics and reporting features that will provide insights into:
          </p>

          {/* Feature List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
            <ul className="text-left space-y-3 text-sm text-gray-700">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Report completion trends and statistics
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                PCO performance metrics and comparisons
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Client service history and patterns
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                Chemical usage and inventory insights
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                System-wide operational dashboards
              </li>
            </ul>
          </div>

          {/* Back Button */}
          <Button
            onPress={() => navigate('/admin/reports')}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            startContent={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Reports
          </Button>
        </div>
      </div>
    </div>
  );
};
