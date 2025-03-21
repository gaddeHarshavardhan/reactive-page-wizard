import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClaimStage from '@/components/ClaimStage';
import StageConnector from '@/components/StageConnector';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  condition?: {
    field: string;
    value: string;
  };
}

// Default template data for quick start
const defaultStages = ["Verification", "Claim Assessment", "IC Decision"];

const defaultFormFields: Record<string, FormField[]> = {
  "Verification": [
    {
      fieldLabel: "Incident Date",
      fieldType: "Date",
      mandatory: true
    },
    {
      fieldLabel: "Under Warranty",
      fieldType: "Radio Buttons",
      options: ["Yes","No"],
      mandatory: true
    }
  ],
  "Claim Assessment": [
    {
      fieldLabel: "Estimated Date",
      fieldType: "Date",
      mandatory: true
    },
    {
      fieldLabel: "Damage  Type",
      fieldType: "Dropdown",
      mandatory: true,
      options: ["Accidental", "Out of Warranty", "Physical", "Other"]
    },
    {
      fieldLabel: "Estimation Amount",
      fieldType: "Number",
      mandatory: true
    }
  ],
  "IC Decision": [
    {
      fieldLabel: "Insurance Decision",
      fieldType: "Dropdown",
      mandatory: true,
      options: ["Approved", "BER", "Rejected"]
    }
  ]
};

const defaultDocuments: Record<string, Document[]> = {
  "Verification": [
    {
      documentType: "Claim Form",
      format: ["PDF"],
      mandatory: true
    },
    {
      documentType: "Purchase Invoice",
      format: ["JPG", "PNG", "PDF"],
      mandatory: true
    },
    {
      documentType: "Government ID Proof",
      format: ["JPG", "PNG", "PDF"],
      mandatory: true
    },
    {
      documentType: "Additional Document",
      format: ["JPG", "PNG"],
      mandatory: false
    }
  ],
  "Claim Assessment": [
    {
      documentType: "Estimate Document",
      format: ["PDF", "JPG","PNG"],
      mandatory: true
    },
    {
      documentType: "Device Damages",
      format: ["JPG", "PNG"],
      mandatory: false
    }
  ],
  "IC Decision": []
};

const defaultActions: Record<string, Action[]> = {
  "Verification": [
    {
      action: "Submit",
      nextStage: "Claim Assessment"
    }
  ],
  "Claim Assessment": [
    {
      action: "Submit",
      nextStage: "IC Decision"
    }
  ],
  "IC Decision": [
    {
      action: "Approve",
      nextStage: "",
      condition: {
        field: "Insurance Decision",
        value: "Approved"
      }
    },
    {
      action: "BER",
      nextStage: "",
      condition: {
        field: "Insurance Decision",
        value: "BER"
      }
    }
  ]
};

const formatOptions = ["PDF", "JPG", "PNG", "TXT"];

// Updated category options with full display text and values
const categoryOptions = [
  { display: "Personal Electronics", value: "PE" },
  { display: "Home Appliances", value: "HA" },
  { display: "Motor", value: "Motor" },
  {display: "Furniture", value: "Furniture"}
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
    { display: "Extended Warranty", value: "EW" }
  ],
  "Furniture": [
    {display: "Accidental Damage", value: "AD"}
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

  // Updated state for add action dialog to include condition
  const [isAddActionOpen, setIsAddActionOpen] = useState(false);
  const [newAction, setNewAction] = useState<Action>({
    action: "Submit",
    nextStage: ""
  });
  
  // New state for condition selection
  const [useCondition, setUseCondition] = useState(false);
  const [availableFields, setAvailableFields] = useState<{fieldLabel: string, options?: string[]}[]>([]);
  const [selectedField, setSelectedField] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

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

  // Function to add a new stage
  const handleAddStage = () => {
    // Check if there's a stored stage name from the ClaimStage component
    const customStageName = localStorage.getItem('newStageName');
    
    // Use custom name if provided, otherwise use default naming
    const stageName = customStageName 
      ? customStageName 
      : (stages.length === 0 ? "Claim Submission" : `New Stage ${stages.length + 1}`);
    
    // Clear the stored name to avoid reusing it for subsequent stages
    if (customStageName) {
      localStorage.removeItem('newStageName');
    }
    
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

  // Load edit configuration from localStorage if it exists
  useEffect(() => {
    const editConfigJson = localStorage.getItem('editConfig');
    if (editConfigJson) {
      try {
        const editConfig = JSON.parse(editConfigJson);
        
        // Set category and service
        setSelectedCategory(editConfig.category);
        setSelectedService(editConfig.service);
        setShowConfigSection(true);
        
        // Extract and set stages, form fields, documents, and actions
        const configStages = editConfig.stages.map((stage: any) => stage.stageName);
        setStages(configStages);
        
        const configFormFields: Record<string, FormField[]> = {};
        const configDocuments: Record<string, Document[]> = {};
        const configActions: Record<string, Action[]> = {};
        
        editConfig.stages.forEach((stage: any) => {
          configFormFields[stage.stageName] = stage.fields || [];
          configDocuments[stage.stageName] = stage.documents || [];
          configActions[stage.stageName] = stage.actions || [];
        });
        
        setFormFields(configFormFields);
        setDocuments(configDocuments);
        setActions(configActions);
        
        if (configStages.length > 0) {
          setActiveStage(configStages[0]);
        }
        
        // Clear localStorage after loading
        localStorage.removeItem('editConfig');
        
        toast.success('Configuration loaded for editing');
      } catch (error) {
        console.error('Error loading edit configuration:', error);
        toast.error('Failed to load configuration for editing');
      }
    }
  }, []);

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

  // Updated add action handler to include condition
  const handleAddAction = () => {
    if (!newAction.action.trim()) {
      toast.error("Action name is required");
      return;
    }
    
    const actionToAdd: Action = { ...newAction };
    
    // Add condition if enabled
    if (useCondition && selectedField && selectedValue) {
      actionToAdd.condition = {
        field: selectedField,
        value: selectedValue
      };
    }
    
    setActions({
      ...actions,
      [activeStage]: [...(actions[activeStage] || []), actionToAdd]
    });
    
    // Reset form
    setNewAction({
      action: "Submit",
      nextStage: ""
    });
    setUseCondition(false);
    setSelectedField("");
    setSelectedValue("");
    
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

  // Handle start configuration button - Re-enabled to load default template
  const handleStartConfiguration = () => {
    if (!selectedCategory || !selectedService) {
      toast.error("Please select both category and service");
      return;
    }
    
    setShowConfigSection(true);
    
    // Load default template
    loadDefaultTemplate();
    
    toast.success("Configuration template loaded");
  };

  // Helper function to load the default template - Re-enabled functionality
  const loadDefaultTemplate = () => {
    // Load default stages
    setStages([...defaultStages]);
    
    // Set up form fields, documents, and actions from defaults
    const initialFormFields: Record<string, FormField[]> = {};
    const initialDocuments: Record<string, Document[]> = {};
    const initialActions: Record<string, Action[]> = {};
    
    defaultStages.forEach(stage => {
      initialFormFields[stage] = defaultFormFields[stage] || [];
      initialDocuments[stage] = defaultDocuments[stage] || [];
      initialActions[stage] = defaultActions[stage] || [];
    });
    
    setFormFields(initialFormFields);
    setDocuments(initialDocuments);
    setActions(initialActions);
    
    // Set first stage as active
    if (defaultStages.length > 0) {
      setActiveStage(defaultStages[0]);
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
    
    try {
      const response = await fetch('http://localhost:8081/api/configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });
      
      if (response.ok) {
        toast.success("Configuration saved successfully");
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error) {
      console.error(error);
      toast.error("Configuration failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  // Update available condition fields when active stage changes
  useEffect(() => {
    if (activeStage) {
      // Get dropdown and radio button fields that have options
      const fields = formFields[activeStage]?.filter(
        field => (field.fieldType === "Dropdown" || field.fieldType === "Radio Buttons") && field.options && field.options.length > 0
      ) || [];
      
      setAvailableFields(fields);
    }
  }, [activeStage, formFields]);

  // Reset condition values when toggling condition use
  useEffect(() => {
    if (!useCondition) {
      setSelectedField("");
      setSelectedValue("");
    } else if (availableFields.length > 0) {
      setSelectedField(availableFields[0].fieldLabel);
      setSelectedValue(availableFields[0].options?.[0] || "");
    }
  }, [useCondition, availableFields]);

  // Get available next stages (only stages after the current one)
  const getAvailableNextStages = () => {
    const currentIndex = stages.indexOf(activeStage);
    return stages.filter((_, index) => index > currentIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-5 px-8 text-white shadow-md">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-fade-in-up shadow-md">
          <h2 className="text-xl font-medium mb-4 text-blue-700">Select Category and Service</h2>
          
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
              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md"
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
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 animate-fade-in-up shadow-md">
              <div className="flex flex-wrap items-center justify-start gap-2">
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
                <h2 className="text-2xl font-medium mb-6 animate-fade-in bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Configure Stage: {activeStage}</h2>

                {/* Form Fields Section */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6 animate-fade-in-up shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-4 text-blue-700">Form Fields</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full claims-table">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
                            <th className="w-1/3 rounded-tl-md p-3">Field Label</th>
                            <th className="w-1/3 p-3">Field Type</th>
                            <th className="w-1/6 text-center p-3">Mandatory</th>
                            <th className="w-1/6 p-3">Options</th>
                            <th className="w-1/12 rounded-tr-md p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formFields[activeStage]?.map((field, index) => (
                            <tr key={index} className="border-t border-gray-200 animate-fade-in hover:bg-gray-50">
                              <td className="p-4">{field.fieldLabel}</td>
                              <td className="p-4">{field.fieldType}</td>
                              <td className="p-4 text-center">
                                {field.mandatory && (
                                  <div className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
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
                      className="mt-4 flex items-center px-4 py-2 text-sm bg-blue-50 border border-blue-200 rounded-md text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Field
                    </button>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="bg-white rounded-lg border border-gray-200 mb-6 animate-fade-in-up shadow-md">
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-4 text-purple-700">Required Documents</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full claims-table">
                        <thead>
                          <tr className="bg-gradient-to-r from-purple-50 to-indigo-50 text-gray-700">
                            <th className="w-1/3 rounded-tl-md p-3">Document Type</th>
                            <th className="w-1/3 p-3">Format</th>
                            <th className="w-1/4 text-center p-3">Mandatory</th>
                            <th className="w-1/12 rounded-tr-md p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {documents[activeStage]?.map((doc, index) => (
                            <tr key={index} className="border-t border-gray-200 animate-fade-in hover:bg-gray-50">
                              <td className="p-4">{doc.documentType}</td>
                              <td className="p-4">{doc.format.join(", ")}</td>
                              <td className="p-4 text-center">
                                {doc.mandatory && (
                                  <div className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
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
