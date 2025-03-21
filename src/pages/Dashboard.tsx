
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Search, List } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-claims-blue py-5 px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium animate-fade-in">Claims System</h1>
            <div className="text-lg animate-fade-in">Select an option to continue</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg hover:border-blue-200 group">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
                <Settings className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Configure Claim Journey</h2>
            <p className="text-gray-600 text-center mb-6">
              Create or modify claim journey configurations with multiple stages, fields, and document requirements.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/config')} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all"
              >
                Go to Configuration
              </Button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg hover:border-green-200 group">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
                <Search className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-700">View Claims</h2>
            <p className="text-gray-600 text-center mb-6">
              Search and view submitted claims by their reference number to check status and details.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/view-claims')} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all"
              >
                View Claims
              </Button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 transition-all hover:shadow-lg hover:border-amber-200 group">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center text-white transform transition-transform group-hover:scale-110">
                <List className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-700">View Configurations</h2>
            <p className="text-gray-600 text-center mb-6">
              Browse and preview existing claim journey configurations for all categories and services.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/view-configurations')} 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all"
              >
                View Configurations
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
