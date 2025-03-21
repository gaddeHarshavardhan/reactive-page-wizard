
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Search, List, ChevronRight, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-claims-blue to-claims-blue-dark py-8 px-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0xaDJ2MWgtMnYtMXptLTIgMGgxdjJoLTF2LTJ6TTM0IDI5aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0xaDJ2MWgtMnYtMXptLTIgMGgxdjJoLTF2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-400/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Claims System
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-full"></div>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm py-2 px-4 rounded-full border border-white/20 shadow-inner animate-fade-in">
              <span className="text-lg font-medium">Select an option to continue</span>
              <ChevronRight className="w-5 h-5 animate-pulse text-blue-200" />
            </div>
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
              Create claim journey configuration with multiple stages, fields, and document requirements.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/config')} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all group"
              >
                <span>Go to Configuration</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 shadow-md hover:shadow-lg transition-all group"
              >
                <span>View Claims</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all group"
              >
                <span>View Configurations</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
