import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimStage from '@/components/ClaimStage';
import StageConnector from '@/components/StageConnector';
import FormFieldRow from '@/components/FormFieldRow';
import DocumentRow from '@/components/DocumentRow';
import ActionRow from '@/components/ActionRow';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { error } from 'console';

interface FormField {
  fieldLabel: string;
  fieldType: string;
  mandatory: boolean;
  validation: string;
}

interface Document {
  documentType: string;
  format: string[];
  mandatory: boolean;
  maxSize: number;
}

interface Action {
  action: string;
  buttonLabel: string;
  condition: string;
  nextStage: string;
}

const formatOptions = ["PDF", "JPG", "PNG", "DOC", "DOCX", "XLS", "XLSX", "TXT"];

const Index = () => {
  const navigate = useNavigate();
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
        format: ["JPG", "PNG"],
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
    format: ["PDF"],
    mandatory: false,
    maxSize: 10
  });

  // State for add action dialog
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newAction, setNewAction] = useState<Action>({
    action: "Submit",
    buttonLabel: "",
    condition: "All fields valid",
    nextStage: ""
  });

  // State for saving configuration
  const [isSaving, setIsSaving] = useState(false);

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

  // Function to rename a stage
  const handleRenameStage = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    // Check if the name already exists
    if (stages.includes(newName)) {
      toast.error("A stage with this name already exists");
      return;
    }

    const newStages = stages.map(stage => stage === oldName ? newName : stage);
    setStages(newStages);

    // Update active stage if it's the renamed one
    if (activeStage === oldName) {
      setActiveStage(newName);
    }

    // Update the data references
    const newFormFields = { ...formFields };
    newFormFields[newName] = formFields[oldName] || [];
    delete newFormFields[oldName];
    setFormFields(newFormFields);

    const newDocuments = { ...documents };
    newDocuments[newName] = documents[oldName] || [];
    delete newDocuments[oldName];
    setDocuments(newDocuments);

    const newActions = { ...actions };
    newActions[newName] = actions[oldName] || [];
    delete newActions[oldName];
    setActions(newActions);

    // Update next stage references in actions
    Object.keys(newActions).forEach(stageName => {
      newActions[stageName] = newActions[stageName].map(action => ({
        ...action,
        nextStage: action.nextStage === oldName ? newName : action.nextStage
      }));
    });
    setActions(newActions);

    toast.success(`Stage renamed to "${newName}"`);
  };

  // Function to remove a stage
  const handleRemoveStage = (stageName: string) => {
    if (stages.length <= 1) {
      toast.error("Cannot remove the last stage");
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

    // Update next stage references in actions
    Object.keys(newActions).forEach(stage => {
      newActions[stage] = newActions[stage].map(action => ({
        ...action,
        nextStage: action.nextStage === stageName ? "" : action.nextStage
      }));
    });
    setActions(newActions);

    toast.success(`Stage "${stageName}" removed`);
  };

  // Function to add a new field
  const handleAddField = () => {
    if (!newField.fieldLabel.trim()) {
      toast.error("Field label is required");
      return;
    }
    
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
    toast.success("Field added successfully");
  };

  // Function to remove a field
  const handleRemoveField = (index: number) => {
    const newFields = [...formFields[activeStage]];
    newFields.splice(index, 1);
    
    setFormFields({
      ...formFields,
      [activeStage]: newFields
    });

    toast.success("Field removed");
  };

  // Function to add a new document
  const handleAddDocument = () => {
    if (!newDocument.documentType.trim()) {
      toast.error("Document type is required");
      return;
    }
    
    if (newDocument.format.length === 0) {
      toast.error("At least one format must be selected");
      return;
    }
    
    setDocuments({
      ...documents,
      [activeStage]: [...(documents[activeStage] || []), newDocument]
    });
    
    setNewDocument({
      documentType: "",
      format: ["PDF"],
      mandatory: false,
      maxSize: 10
    });
    
    setIsAddDocumentOpen(false);
    toast.success("Document added successfully");
  };

  // Function to remove a document
  const handleRemoveDocument = (index: number) => {
    const newDocs = [...documents[activeStage]];
    newDocs.splice(index, 1);
    
    setDocuments({
      ...documents,
      [activeStage]: newDocs
    });

    toast.success("Document removed");
  };

  // Function to add a new action
  const handleAddAction = () => {
    if (!newAction.buttonLabel.trim()) {
      toast.error("Button label is required");
      return;
    }

    if (!newAction.nextStage.trim()) {
      toast.error("Next stage is required");
      return;
    }
    
    setActions({
      ...actions,
      [activeStage]: [...(actions[activeStage] || []), newAction]
    });
    
    setNewAction({
      action: "Submit",
      buttonLabel: "",
      condition: "All fields valid",
      nextStage: ""
    });
    
    setIsAddActionOpen(false);
    toast.success("Action added successfully");
  };

  // Function to remove an action
  const handleRemoveAction = (index: number) => {
    const newActions = [...actions[activeStage]];
    newActions.splice(index, 1);
    
    setActions({
      ...actions,
      [activeStage]: newActions
    });

    toast.success("Action removed");
  };

  // Function to toggle document format selection
  const toggleFormat = (format: string) => {
    if (newDocument.format.includes(format)) {
      setNewDocument({
        ...newDocument,
        format: newDocument.format.filter(f => f !== format)
      });
    } else {
      setNewDocument({
        ...newDocument,
        format: [...newDocument.format, format]
      });
    }
  };

  // Function to save configuration and navigate to form
  const handleSaveAndPreview = async () => {
    setIsSaving(true);
    
    // Transform the data into the requested structure
    const transformedData = {
      stages: stages.map(stageName => {
        return {
          stageName: stageName,
          fields: formFields[stageName]?.map(field => ({
            name: field.fieldLabel,
            type: field.fieldType.toLowerCase(),
            mandatory: field.mandatory,
            validation: field.validation
          })) || [],
          documents: documents[stageName]?.map(doc => ({
            name: doc.documentType,
            mandatory: doc.mandatory,
            maxSize: doc.maxSize,
            allowedFormat: doc.format
          })) || [],
          actions: actions[stageName]?.map(action => {
            const actionData: {
              option: string;
              stage?: string;
              buttonLabel?: string;
              condition?: string;
            } = {
              option: action.action.toLowerCase(),
              buttonLabel: action.buttonLabel,
              condition: action.condition
            };
            
            // Only include stage if it's specified and not an exit action
            if (action.nextStage && !action.nextStage.startsWith("Exit")) {
              actionData.stage = action.nextStage;
            }
            
            return actionData;
          }) || []
        };
      })
    };
    
    try {
      // In a real app, this would save to an API
      console.log('Configuration for preview:', transformedData);
      
      // Store in localStorage to simulate persistence
      localStorage.setItem('claimConfig', JSON.stringify(transformedData));
      
      setIsSaving(false);
      toast.success("Configuration saved and ready for preview");
      
      // Navigate to the claim form page
      setTimeout(() => {
        navigate('/claim-form');
      }, 1000);
      
    } catch (error) {
      console.error("Error saving configuration:", error);
      setIsSaving(false);
      toast.error("Error saving configuration");
    }
  };

  // Function to save configuration
  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    
    // Transform the data into the requested structure
    const transformedData = {
      stages: stages.map(stageName => {
        return {
          stageName: stageName,
          fields: formFields[stageName]?.map(field => ({
            name: field.fieldLabel,
            type: field.fieldType.toLowerCase(),
            mandatory: field.mandatory,
            validation: field.validation
          })) || [],
          documents: documents[stageName]?.map(doc => ({
            name: doc.documentType,
            mandatory: doc.mandatory,
            maxSize: doc.maxSize,
            allowedFormat: doc.format
          })) || [],
          actions: actions[stageName]?.map(action => {
            const actionData: {
              option: string;
              stage?: string;
              buttonLabel?: string;
              condition?: string;
            } = {
              option: action.action.toLowerCase(),
              buttonLabel: action.buttonLabel,
              condition: action.condition
            };
            
            // Only include stage if it's specified and not an exit action
            if (action.nextStage && !action.nextStage.startsWith("Exit")) {
              actionData.stage = action.nextStage;
            }
            
            return actionData;
          }) || []
        };
      })
    };
    
    const response = await fetch('https://localhost:9000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    }).then(
      (res) => {
        console.log(res);
        toast.success("Configuration saved successfully");
      }
    ).catch(
      (error) => { 
        console.log(error);
        toast.error("Configuration Failed")
      }
    ).finally(
      () => {
        setIsSaving(false);
      }
    );
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
                  onRename={(newName) => handleRenameStage(stage, newName)}
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
                      <td className="p-4">{doc.format.join(", ")}</td>
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
                          onClick={() => handleRemoveAction(index)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove action"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {actions[activeStage]?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No actions added yet. Click "Add Action" to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => setIsAddActionOpen(true)}
              className="mt-4 flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Action
            </button>
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
              
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right pt-2">Format</label>
                <div className="col-span-3 flex flex-col space-y-2">
                  {formatOptions.map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`format-${format}`}
                        checked={newDocument.format.includes(format)}
                        onCheckedChange={() => toggleFormat(format)}
                      />
                      <Label htmlFor={`format-${format}`}>{format}</Label>
                    </div>
                  ))}
                </div>
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

        {/* Add Action Dialog */}
        <Dialog open={isAddActionOpen} onOpenChange={setIsAddActionOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Action</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="actionType" className="text-right">Action Type</label>
                <select
                  id="actionType"
                  value={newAction.action}
                  onChange={(e) => setNewAction({...newAction, action: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                >
                  <option value="Submit">Submit</option>
                  <option value="Save">Save</option>
                  <option value="Cancel">Cancel</option>
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="buttonLabel" className="text-right">Button Label</label>
                <input
                  id="buttonLabel"
                  value={newAction.buttonLabel}
                  onChange={(e) => setNewAction({...newAction, buttonLabel: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                  placeholder="e.g., Submit Claim"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="condition" className="text-right">Condition</label>
                <select
                  id="condition"
                  value={newAction.condition}
                  onChange={(e) => setNewAction({...newAction, condition: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                >
                  <option value="All fields valid">All fields valid</option>
                  <option value="Any state">Any state</option>
                  <option value="Custom condition">Custom condition</option>
                </select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="nextStage" className="text-right">Next Stage</label>
                <select
                  id="nextStage"
                  value={newAction.nextStage}
                  onChange={(e) => setNewAction({...newAction, nextStage: e.target.value})}
                  className="col-span-3 border p-2 rounded"
                >
                  <option value="">Select next stage</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                  <option value="Exit (Save Draft)">Exit (Save Draft)</option>
                  <option value="Complete Claim">Complete Claim</option>
                </select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddActionOpen(false)}>Cancel</Button
