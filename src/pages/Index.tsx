
import React, { useState } from 'react';
import ClaimStage from '@/components/ClaimStage';
import StageConnector from '@/components/StageConnector';
import FormFieldRow from '@/components/FormFieldRow';
import DocumentRow from '@/components/DocumentRow';
import ActionRow from '@/components/ActionRow';
import { Plus } from 'lucide-react';

const Index = () => {
  const [activeStage, setActiveStage] = useState('Claim Submission');
  
  const stages = [
    'Claim Submission',
    'Document Upload',
    'Claim Assessment'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-claims-blue py-5 px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium animate-fade-in">Configurable Claims Framework</h1>
            <div className="text-lg animate-fade-in">Mobile Protection Claim Configuration</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stages */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-start">
            {stages.map((stage, index) => (
              <React.Fragment key={stage}>
                <ClaimStage 
                  label={stage} 
                  isActive={stage === activeStage} 
                  onClick={() => setActiveStage(stage)}
                />
                {index < stages.length - 1 && (
                  <StageConnector isActive={
                    stages.indexOf(activeStage) > index
                  } />
                )}
              </React.Fragment>
            ))}
            <StageConnector />
            <ClaimStage 
              label="Add Stage" 
              isActive={false} 
              isAddStage={true}
              onClick={() => {}} 
            />
          </div>
        </div>

        {/* Configure Stage Section */}
        <h2 className="text-2xl font-medium mb-6 animate-fade-in">Configure Stage: {activeStage}</h2>

        {/* Form Fields Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 animate-fade-in-up">
          <div className="p-6">
            <h3 className="text-xl font-medium mb-4">Form Fields</h3>
            <div className="overflow-x-auto">
              <table className="w-full claims-table">
                <thead>
                  <tr className="bg-claims-gray-light">
                    <th className="w-1/4 rounded-tl-md">Field Label</th>
                    <th className="w-1/4">Field Type</th>
                    <th className="w-1/6 text-center">Mandatory</th>
                    <th className="w-1/3 rounded-tr-md">Validation</th>
                  </tr>
                </thead>
                <tbody>
                  <FormFieldRow
                    fieldLabel="Device Model"
                    fieldType="Dropdown"
                    mandatory={true}
                    validation="From pre-defined list"
                  />
                  <FormFieldRow
                    fieldLabel="Issue Type"
                    fieldType="Radio Buttons"
                    mandatory={true}
                    validation="One selection required"
                  />
                </tbody>
              </table>
            </div>

            <button className="mt-4 flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
              <Plus size={16} className="mr-2" />
              Add Field
            </button>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 animate-fade-in-up">
          <div className="p-6">
            <h3 className="text-xl font-medium mb-4">Documents</h3>
            <div className="overflow-x-auto">
              <table className="w-full claims-table">
                <thead>
                  <tr>
                    <th className="w-1/4 rounded-tl-md">Document Type</th>
                    <th className="w-1/4">Format</th>
                    <th className="w-1/6 text-center">Mandatory</th>
                    <th className="w-1/3 rounded-tr-md">Max Size (MB)</th>
                  </tr>
                </thead>
                <tbody>
                  <DocumentRow
                    documentType="Device Photos"
                    format="JPG, PNG"
                    mandatory={false}
                    maxSize={5}
                  />
                </tbody>
              </table>
            </div>

            <button className="mt-4 flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors">
              <Plus size={16} className="mr-2" />
              Add Document
            </button>
          </div>
        </div>

        {/* Actions and Transitions Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 animate-fade-in-up">
          <div className="p-6">
            <h3 className="text-xl font-medium mb-4">Actions and Transitions</h3>
            <div className="overflow-x-auto">
              <table className="w-full claims-table">
                <thead>
                  <tr>
                    <th className="w-1/5 rounded-tl-md">Action</th>
                    <th className="w-1/5">Button Label</th>
                    <th className="w-1/3">Condition</th>
                    <th className="w-1/4 rounded-tr-md">Next Stage</th>
                  </tr>
                </thead>
                <tbody>
                  <ActionRow
                    action="Submit"
                    buttonLabel="Submit Claim"
                    condition="All fields valid"
                    nextStage="Document Upload"
                  />
                  <ActionRow
                    action="Save"
                    buttonLabel="Save for Later"
                    condition="Any state"
                    nextStage="Exit (Save Draft)"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8 animate-fade-in">
          <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-claims-blue text-white rounded-md hover:bg-claims-blue-dark transition-colors">
            Save Configuration
          </button>
        </div>
      </main>
    </div>
  );
};

export default Index;
