
import React, { useState } from 'react';
import ClaimStage from '@/components/ClaimStage';
import StageConnector from '@/components/StageConnector';
import FormFieldRow from '@/components/FormFieldRow';
import DocumentRow from '@/components/DocumentRow';
import ActionRow from '@/components/ActionRow';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';

interface FormField {
  fieldLabel: string;
  fieldType: string;
  mandatory: boolean;
  validation: string;
}

interface Document {
  documentType: string;
  format: string;
  mandatory: boolean;
  maxSize: number;
}

interface Action {
  action: string;
  buttonLabel: string;
  condition: string;
  nextStage: string;
}

const Index = () => {
  const [activeStage, setActiveStage] = useState('Claim Submission');
  const [stages, setStages] = useState(['Claim Submission', 'Document Upload', 'Claim Assessment']);
  
  // State for fields, documents, and actions
  const [formFields, setFormFields] = useState<Record<string, FormField[]>>({
    'Claim Submission': [
      {
        fieldLabel: "Device Model",
        fieldType: "Dropdown",
        mandatory: true,
        validation: "From pre-defined list"
      },
      {
        fieldLabel: "Issue Type",
        fieldType: "Radio Buttons",
        mandatory: true,
        validation: "One selection required"
      }
    ],
    'Document Upload': [],
    'Claim Assessment': []
  });

  const [documents, setDocuments] = useState<Record<string, Document[]>>({
    'Claim Submission': [],
    'Document Upload': [
      {
        documentType: "Device Photos",
        format: "JPG, PNG",
        mandatory: false,
        maxSize: 5
      }
    ],
    'Claim Assessment': []
  });

  const [actions, setActions] = useState<Record<string, Action[]>>({
    'Claim Submission': [
      {
        action: "Submit",
        buttonLabel: "Submit Claim",
        condition: "All fields valid",
        nextStage: "Document Upload"
      },
      {
        action: "Save",
        buttonLabel: "Save for Later",
        condition: "Any state",
        nextStage: "Exit (Save Draft)"
      }
    ],
    'Document Upload': [],
    'Claim Assessment': []
  });

  // State for add field dialog
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [newField, setNewField] = useState<FormField>({
    fieldLabel: "",
    fieldType: "Text",
    mandatory: false,
    validation: ""
  });

  // State for add document dialog
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<Document>({
    documentType: "",
    format: "PDF",
    mandatory: false,
    maxSize: 10
  });

  // Function to add a new stage
  const handleAddStage = () => {
    const stageName = `New Stage ${stages.length + 1}`;
    setStages([...stages, stageName]);
    setFormFields({
      ...formFields,
      [stageName]: []
    });
    setDocuments({
      ...documents,
      [stageName]: []
    });
    setActions({
      ...actions,
      [stageName]: []
    });
    setActiveStage(stageName);
  };

  // Function to remove a stage
  const handleRemoveStage = (stageName: string) => {
    if (stages.length <= 1) {
      alert("Cannot remove the last stage");
      return;
    }

    const newStages = stages.filter(stage => stage !== stageName);
    setStages(newStages);
    
    // Update active stage if the current one is removed
    if (activeStage === stageName) {
      setActiveStage(newStages[0]);
    }

    // Remove stage data
    const newFormFields = { ...formFields };
    delete newFormFields[stageName];
    setFormFields(newFormFields);

    const newDocuments = { ...documents };
    delete newDocuments[stageName];
    setDocuments(newDocuments);

    const newActions = { ...actions };
    delete newActions[stageName];
    setActions(newActions);
  };

  // Function to add a new field
  const handleAddField = () => {
    if (!newField.fieldLabel.trim()) return;
    
    setFormFields({
      ...formFields,
      [activeStage]: [...(formFields[activeStage] || []), newField]
    });
    
    setNewField({
      fieldLabel: "",
      fieldType: "Text",
      mandatory: false,
      validation: ""
    });
    
    setIsAddFieldOpen(false);
  };

  // Function to remove a field
  const handleRemoveField = (index: number) => {
    const newFields = [...formFields[activeStage]];
    newFields.splice(index, 1);
    
    setFormFields({
      ...formFields,
      [activeStage]: newFields
    });
  };

  // Function to add a new document
  const handleAddDocument = () => {
    if (!newDocument.documentType.trim()) return;
    
    setDocuments({
      ...documents,
      [activeStage]: [...(documents[activeStage] || []), newDocument]
    });
    
    setNewDocument({
      documentType: "",
      format: "PDF",
      mandatory: false,
      maxSize: 10
    });
    
    setIsAddDocumentOpen(false);
  };

  // Function to remove a document
  const handleRemoveDocument = (index: number) => {
    const newDocs = [...documents[activeStage]];
    newDocs.splice(index, 1);
    
    setDocuments({
      ...documents,
      [activeStage]: newDocs
    });
  };

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
                  onRemove={() => handleRemoveStage(stage)}
                  canRemove={stages.length > 1}
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
              onClick={handleAddStage} 
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
                    <th className="w-1/4">Validation</th>
                    <th className="w-1/12 rounded-tr-md">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formFields[activeStage]?.map((field, index) => (
                    <tr key={index} className="border-t border-gray-200 animate-fade-in">
                      <td className="p-4">{field.fieldLabel}</td>
                      <td className="p-4">{field.fieldType}</td>
                      <td className="p-4 text-center">
                        {field.mandatory && (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-claims-green rounded-full">
                            <svg 
                              className="w-4 h-4 text-white" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="p-4">{field.validation}</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleRemoveField(index)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove field"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {formFields[activeStage]?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No fields added yet. Click "Add Field" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => setIsAddFieldOpen(true)}
              className="mt-4 flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
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
                    <th className="w-1/4">Max Size (MB)</th>
                    <th className="w-1/12 rounded-tr-md">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents[activeStage]?.map((doc, index) => (
                    <tr key={index} className="border-t border-gray-200 animate-fade-in">
                      <td className="p-4">{doc.documentType}</td>
                      <td className="p-4">{doc.format}</td>
                      <td className="p-4 text-center">
                        {doc.mandatory && (
                          <div className="inline-flex items-center justify-center w-6 h-6 bg-claims-green rounded-full">
                            <svg 
                              className="w-4 h-4 text-white" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M5 13l4 4L19 7" 
                              />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="p-4">{doc.maxSize} MB</td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => handleRemoveDocument(index)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove document"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {documents[activeStage]?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No documents added yet. Click "Add Document" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => setIsAddDocumentOpen(true)}
              className="mt-4 flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
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
                    <th className="w-1/4">Next Stage</th>
                    <th className="w-1/12 rounded-tr-md">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {actions[activeStage]?.map((action, index) => (
                    <tr key={index} className="border-t border-gray-200 animate-fade-in">
                      <td className="p-4">{action.action}</td>
                      <td className="p-4">{action.buttonLabel}</td>
                      <td className="p-4">{action.condition}</td>
                      <td className="p-4">{action.nextStage}</td>
                      <td className="p-4 text-center">
                        <button 
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove action"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add Field Dialog */}
        <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Field</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="fieldLabel" className="text-right">Field Label</label>
                <input
                  id="fieldLabel"
                  value={newField.fieldLabel}
                  onChange={(e) => setNewField({...newField, fieldLabel: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="fieldType" className="text-right">Field Type</label>
                <select
                  id="fieldType"
                  value={newField.fieldType}
                  onChange={(e) => setNewField({...newField, fieldType: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                >
                  <option value="Text">Text</option>
                  <option value="Number">Number</option>
                  <option value="Dropdown">Dropdown</option>
                  <option value="Radio Buttons">Radio Buttons</option>
                  <option value="Checkbox">Checkbox</option>
                  <option value="Date">Date</option>
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="validation" className="text-right">Validation</label>
                <input
                  id="validation"
                  value={newField.validation}
                  onChange={(e) => setNewField({...newField, validation: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                  placeholder="e.g., Required, Min length: 5"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">Mandatory</div>
                <div className="col-span-3">
                  <input
                    type="checkbox"
                    checked={newField.mandatory}
                    onChange={(e) => setNewField({...newField, mandatory: e.target.checked})}
                    className="mr-2"
                  />
                  <label>Required field</label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddFieldOpen(false)}>Cancel</Button>
              <Button onClick={handleAddField}>Add Field</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Document Dialog */}
        <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="documentType" className="text-right">Document Type</label>
                <input
                  id="documentType"
                  value={newDocument.documentType}
                  onChange={(e) => setNewDocument({...newDocument, documentType: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="format" className="text-right">Format</label>
                <input
                  id="format"
                  value={newDocument.format}
                  onChange={(e) => setNewDocument({...newDocument, format: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                  placeholder="e.g., PDF, JPG, PNG"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="maxSize" className="text-right">Max Size (MB)</label>
                <input
                  id="maxSize"
                  type="number"
                  value={newDocument.maxSize}
                  onChange={(e) => setNewDocument({...newDocument, maxSize: Number(e.target.value)})}
                  className="col-span-3 border p-2 rounded"
                  min="1"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">Mandatory</div>
                <div className="col-span-3">
                  <input
                    type="checkbox"
                    checked={newDocument.mandatory}
                    onChange={(e) => setNewDocument({...newDocument, mandatory: e.target.checked})}
                    className="mr-2"
                  />
                  <label>Required document</label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDocumentOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDocument}>Add Document</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
