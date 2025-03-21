
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-claims-blue py-5 px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium animate-fade-in">Mobile Protection Claims System</h1>
            <div className="text-lg animate-fade-in">Select an option to continue</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-claims-blue flex items-center justify-center text-white">
                <Settings className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-center mb-3">Configure Claim Form</h2>
            <p className="text-gray-600 text-center mb-6">
              Create or modify claim form configurations with multiple stages, fields, and document requirements.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate('/config')} 
                className="bg-claims-blue hover:bg-claims-blue-dark"
              >
                Go to Configuration
              </Button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-claims-green flex items-center justify-center text-white">
                <FileText className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-medium text-center mb-3">Submit a Claim</h2>
            <p className="text-gray-600 text-center mb-6">
              Fill out and submit a claim form using the latest configuration. Your progress will be saved between stages.
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  const hasConfig = localStorage.getItem('claimConfig');
                  if (hasConfig) {
                    navigate('/claim-form');
                  } else {
                    toast.error('No claim configuration found. Please create one first.');
                  }
                }} 
                className="bg-claims-green hover:bg-green-600"
              >
                Start New Claim
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
