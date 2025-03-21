
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { error } from 'console';

interface FormField {
  fieldLabel: string;
  fieldType: string;
  mandatory: boolean;
  options?: string[]; // Added options for dropdown and radio buttons
}

interface Document {
  documentType: string;
  format: string[];
  mandatory: boolean;
}

interface Action {
  action: string;
  nextStage: string;
}

const formatOptions = ["PDF", "JPG", "PNG", "TXT"];

// Updated category options with full display text and values
const categoryOptions = [
  { display: "Personal Electronics", value: "PE" },
  { display: "Home Appliances", value: "HA" },
  { display: "Motor", value: "Motor" }
];

// Updated service options with full display text and values
const serviceOptionsMap: Record<string, { display: string; value: string }[]> = {
  "PE": [
    { display: "Accidental Damage", value: "ADLD" },
    { display: "Extended Warranty", value: "EW" }
  ],
  "HA": [
    { display: "Extended Warranty", value: "EW" },
    { display: "Preventive Maintenance", value: "PMS" }
  ],
  "Motor": [
    { display: "Accidental Damage", value: "ADLD" }
  ]
};

const Index = () => {
  const navigate = useNavigate();
  // Changed default state to not display any stages
  const [activeStage, setActiveStage] = useState('');
  const [stages, setStages] = useState<string[]>([]);
  
  // State for category and service selection
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [showConfigSection, setShowConfigSection] = useState(false);
  
  // State for fields, documents, and actions
  const [formFields, setFormFields] = useState<Record<string, FormField[]>>({});
  const [documents, setDocuments] = useState<Record<string, Document[]>>({});
  const [actions, setActions] = useState<Record<string, Action[]>>({});

  // State for add field dialog
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [newField, setNewField] = useState<FormField>({
    fieldLabel: "",
    fieldType: "Text",
    mandatory: false,
    options: []
  });

  // State for options input
  const [optionInput, setOptionInput] = useState("");
  
  // State for add document dialog
  const [isAddDocumentOpen, setIsAddDocumentOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<Document>({
    documentType: "",
    format: ["PDF"],
    mandatory: false
  });

  // State for add action dialog
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newAction, setNewAction] = useState<Action>({
    action: "Submit",
    nextStage: ""
  });

  // State for saving configuration
  const [isSaving, setIsSaving] = useState(false);

  // Handle category change
  const handleCategoryChange = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setSelectedService('');
  };

  // Handle service change
  const handleServiceChange = (service: string) => {
    setSelectedService(service);
  };

  // Get service display name from value
  const getServiceDisplayName = (serviceValue: string) => {
    if (!selectedCategory || !serviceValue) return "";
    
    const service = serviceOptionsMap[selectedCategory]?.find(s => s.value === serviceValue);
    return service?.display || serviceValue;
  };

  // Function to get available services for selected category
  const getAvailableServices = () => {
    return selectedCategory ? serviceOptionsMap[selectedCategory] || [] : [];
  };

  // Handle start configuration button
  const handleStartConfiguration = () => {
    if (!selectedCategory || !selectedService) {
      toast.error("Please select both category and service");
      return;
    }
    
    setShowConfigSection(true);
    
    // If no stages exist, add initial stage
    if (stages.length === 0) {
      handleAddStage();
    }
  };

  // Function to add a new stage
  const handleAddStage = () => {
    const stageName = stages.length === 0 ? "Claim Submission" : `New Stage ${stages.length + 1}`;
    const newStages = [...stages, stageName];
    setStages(newStages);
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
    
    // Create field with options if it's a dropdown or radio button
    const fieldToAdd = { ...newField };
    if ((fieldToAdd.fieldType === "Dropdown" || fieldToAdd.fieldType === "Radio Buttons") && 
        (!fieldToAdd.options || fieldToAdd.options.length === 0)) {
      toast.error(`Please add at least one option for the ${fieldToAdd.fieldType}`);
      return;
    }
    
    setFormFields({
      ...formFields,
      [activeStage]: [...(formFields[activeStage] || []), fieldToAdd]
    });
    
    setNewField({
      fieldLabel: "",
      fieldType: "Text",
      mandatory: false,
      options: []
    });
    
    setOptionInput("");
    setIsAddFieldOpen(false);
    toast.success("Field added successfully");
  };

  // Function to add an option to dropdown or radio buttons
  const handleAddOption = () => {
    if (!optionInput.trim()) {
      toast.error("Option cannot be empty");
      return;
    }
    
    setNewField(prev => ({
      ...prev,
      options: [...(prev.options || []), optionInput.trim()]
    }));
    
    setOptionInput("");
  };
  
  // Function to remove an option
  const handleRemoveOption = (index: number) => {
    setNewField(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
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
      mandatory: false
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

  // Function to add a new action - removed next stage validation
  const handleAddAction = () => {
    setActions({
      ...actions,
      [activeStage]: [...(actions[activeStage] || []), newAction]
    });
    
    setNewAction({
      action: "Submit",
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

  // Function to save configuration and navigate to form with preview mode
  const handleSaveAndPreview = async () => {
    setIsSaving(true);
    
    // Transform the data into the requested structure
    const transformedData = {
      category: selectedCategory,
      service: selectedService,
      stages: stages.map(stageName => {
        return {
          stageName: stageName,
          fields: formFields[stageName]?.map(field => {
            // Create the base field object
            const fieldObj: any = {
              name: field.fieldLabel,
              type: field.fieldType.toLowerCase(),
              mandatory: field.mandatory,
            };
            
            // Add options array for dropdown and radio buttons
            if (field.fieldType === "Dropdown" || field.fieldType === "Radio Buttons") {
              fieldObj.options = field.options || [];
            }
            
            return fieldObj;
          }) || [],
          documents: documents[stageName]?.map(doc => ({
            name: doc.documentType,
            mandatory: doc.mandatory,
            allowedFormat: doc.format
          })) || [],
          actions: actions[stageName]?.map(action => ({
            option: action.action.toLowerCase(),
            stage: action.nextStage,
            // Set all actions as view-only in preview mode
            buttonLabel: action.action,
            condition: "All fields valid"
          })) || []
        };
      })
    };
    
    try {
      console.log('Configuration for preview:', transformedData);
      
      // Store in localStorage to simulate persistence
      localStorage.setItem('claimConfig', JSON.stringify(transformedData));
      localStorage.setItem('previewMode', 'true'); // Add flag for preview mode
      
      // Also call the save configuration API endpoint like in handleSaveConfiguration
      const response = await fetch('http://localhost:8081/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      }).then(
        (res) => {
          console.log(res);
          toast.success("Configuration saved and ready for preview");
          
          // Navigate to the claim form page
          setTimeout(() => {
            navigate('/claim-form');
          }, 1000);
        }
      ).catch(
        (error) => { 
          console.log(error);
          toast.error("Configuration save failed, but preview is available");
          
          // Still navigate to preview even if API call fails
          setTimeout(() => {
            navigate('/claim-form');
          }, 1000);
        }
      ).finally(
        () => {
          setIsSaving(false);
        }
      );
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
      category: selectedCategory,
      service: selectedService,
      stages: stages.map(stageName => {
        return {
          stageName: stageName,
          fields: formFields[stageName]?.map(field => {
            // Create the base field object
            const fieldObj: any = {
              name: field.fieldLabel,
              type: field.fieldType.toLowerCase(),
              mandatory: field.mandatory,
            };
            
            // Add options array for dropdown and radio buttons
            if (field.fieldType === "Dropdown" || field.fieldType === "Radio Buttons") {
              fieldObj.options = field.options || [];
            }
            
            return fieldObj;
          }) || [],
          documents: documents[stageName]?.map(doc => ({
            name: doc.documentType,
            mandatory: doc.mandatory,
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
            };
            
            actionData.stage = action.nextStage;
            
            return actionData;
          }) || []
        };
      })
    };
    
    const response = await fetch('http://localhost:8081/api/configs', {
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

  // Get available next stages (only stages after the current one)
  const getAvailableNextStages = () => {
    const currentIndex = stages.indexOf(activeStage);
    return stages.filter((_, index) => index > currentIndex);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-claims-blue py-5 px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium animate-fade-in">Configurable Claims Framework</h1>
            <div className="text-lg animate-fade-in">Claim Configuration</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Category and Service Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-fade-in-up">
          <h2 className="text-xl font-medium mb-4">Select Category and Service</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={handleCategoryChange}
                disabled={showConfigSection}
              >
                <SelectTrigger id="category" className="w-full mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="service">Service</Label>
              <Select 
                value={selectedService} 
                onValueChange={handleServiceChange}
                disabled={!selectedCategory || showConfigSection}
              >
                <SelectTrigger id="service" className="w-full mt-1">
                  <SelectValue placeholder={selectedCategory ? "Select a service" : "Select a category first"} />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableServices().map(service => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {!showConfigSection && (
            <Button 
              onClick={handleStartConfiguration} 
              className="mt-4"
              disabled={!selectedCategory || !selectedService}
            >
              Start Configuration
            </Button>
          )}
          
          {showConfigSection && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex justify-between items-center">
              <div>
                <span className="font-medium">Selected:</span> {categoryOptions.find(c => c.value === selectedCategory)?.display} - {getServiceDisplayName(selectedService)}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowConfigSection(false)}
                disabled={isSaving}
              >
                Change
              </Button>
            </div>
          )}
        </div>

        {/* Configuration Section - Only show if category and service are selected */}
        {showConfigSection && (
          <>
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
                {stages.length > 0 && <StageConnector />}
                <ClaimStage 
                  label="Add Stage" 
                  isActive={false} 
                  isAddStage={true}
                  onClick={handleAddStage} 
                />
              </div>
            </div>

            {/* Configure Stage Section - Only show if a stage is selected */}
            {activeStage && (
              <>
                <h2 className="text-2xl font-medium mb-6 animate-fade-in">Configure Stage: {activeStage}</h2>

                {/* Form Fields Section */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6 animate-fade-in-up">
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-4">Form Fields</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full claims-table">
                        <thead>
                          <tr className="bg-claims-gray-light">
                            <th className="w-1/3 rounded-tl-md">Field Label</th>
                            <th className="w-1/3">Field Type</th>
                            <th className="w-1/6 text-center">Mandatory</th>
                            <th className="w-1/6">Options</th>
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
                              <td className="p-4">
                                {(field.fieldType === "Dropdown" || field.fieldType === "Radio Buttons") ? (
                                  <div>
                                    <span className="font-medium">Options:</span> {field.options?.join(", ")}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
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
                    <h3 className="text-xl font-medium mb-4">Required Documents</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full claims-table">
                        <thead>
                          <tr>
                            <th className="w-1/3 rounded-tl-md">Document Type</th>
                            <th className="w-1/3">Format</th>
                            <th className="w-1/4 text-center">Mandatory</th>
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
                              <td colSpan={4} className="p-4 text-center text-gray-500">
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
                            <th className="w-1/3 rounded-tl-md">Action</th>
                            <th className="w-1/2">Next Stage</th>
                            <th className="w-1/6 rounded-tr-md">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {actions[activeStage]?.map((action, index) => (
                            <tr key={index} className="border-t border-gray-200 animate-fade-in">
                              <td className="p-4">{action.action}</td>
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
                              <td colSpan={3} className="p-4 text-center text-gray-500">
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
              </>
            )}

            {/* Empty state message when no stages have been added */}
            {stages.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-10 mb-6 text-center animate-fade-in-up">
                <h2 className="text-xl font-medium mb-4 text-gray-700">No Stages Configured</h2>
                <p className="text-gray-500 mb-6">Start by adding a stage to your claim journey using the "Add Stage" button above.</p>
              </div>
            )}

            {/* Save Actions */}
            <div className="flex justify-end space-x-4 my-8">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveConfiguration}
                disabled={stages.length === 0 || isSaving}
                className="bg-claims-gray text-white hover:bg-gray-600"
              >
                {isSaving ? "Saving..." : "Save Configuration"}
              </Button>
              <Button 
                onClick={handleSaveAndPreview}
                disabled={stages.length === 0 || isSaving}
                className="bg-claims-blue text-white hover:bg-blue-600"
              >
                {isSaving ? "Saving..." : "Save & Preview"}
              </Button>
            </div>
          </>
        )}
      </main>

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
                onChange={(e) => setNewField({
                  ...newField, 
                  fieldType: e.target.value,
                  // Reset options if changing away from dropdown/radio
                  options: e.target.value === "Dropdown" || e.target.value === "Radio Buttons" 
                    ? (newField.options || []) 
                    : undefined
                })}
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
              <label htmlFor="mandatory" className="text-right">Mandatory</label>
              <div className="col-span-3 flex items-center">
                <Checkbox 
                  id="mandatory" 
                  checked={newField.mandatory}
                  onCheckedChange={(checked) => 
                    setNewField({...newField, mandatory: checked === true})
                  }
                />
                <label htmlFor="mandatory" className="ml-2 text-sm">Required field</label>
              </div>
            </div>
            
            {/* Options section for dropdown and radio buttons */}
            {(newField.fieldType === "Dropdown" || newField.fieldType === "Radio Buttons") && (
              <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right pt-2">Options</label>
                <div className="col-span-3 space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      placeholder="Enter option value"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddOption}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                  
                  {/* Display added options */}
                  {newField.options && newField.options.length > 0 && (
                    <div className="border rounded-md p-2 mt-2">
                      <p className="text-sm text-gray-500 mb-2">Added options:</p>
                      <div className="space-y-1">
                        {newField.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-1 rounded">
                            <span className="text-sm">{option}</span>
                            <button
                              onClick={() => handleRemoveOption(index)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove option"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddFieldOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddField}>
              Add Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={isAddDocumentOpen} onOpenChange={setIsAddDocumentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="documentType" className="text-right">Document Type</label>
              <input
                id="documentType"
                value={newDocument.documentType}
                onChange={(e) => setNewDocument({...newDocument, documentType: e.target.value})}
                className="col-span-3 border p-2 rounded"
                placeholder="e.g., Identity Card, Invoice"
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right pt-2">Format</label>
              <div className="col-span-3 space-y-2">
                {formatOptions.map((format) => (
                  <div key={format} className="flex items-center">
                    <Checkbox 
                      id={`format-${format}`} 
                      checked={newDocument.format.includes(format)}
                      onCheckedChange={() => toggleFormat(format)}
                    />
                    <label htmlFor={`format-${format}`} className="ml-2 text-sm">{format}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="docMandatory" className="text-right">Mandatory</label>
              <div className="col-span-3 flex items-center">
                <Checkbox 
                  id="docMandatory" 
                  checked={newDocument.mandatory}
                  onCheckedChange={(checked) => 
                    setNewDocument({...newDocument, mandatory: checked === true})
                  }
                />
                <label htmlFor="docMandatory" className="ml-2 text-sm">Required document</label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddDocumentOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddDocument}>
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Action Dialog */}
      <Dialog open={isAddActionOpen} onOpenChange={setIsAddActionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Action</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="actionName" className="text-right">Action</label>
              <input
                id="actionName"
                value={newAction.action}
                onChange={(e) => setNewAction({...newAction, action: e.target.value})}
                className="col-span-3 border p-2 rounded"
                placeholder="e.g., Submit, Save, Approve"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="nextStage" className="text-right">Next Stage</label>
              <select
                id="nextStage"
                value={newAction.nextStage}
                onChange={(e) => setNewAction({...newAction, nextStage: e.target.value})}
                className="col-span-3 border p-2 rounded"
              >
                <option value="">-- No Next Stage --</option>
                {getAvailableNextStages().map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddActionOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddAction}>
              Add Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
