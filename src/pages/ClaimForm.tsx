
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronDown, 
  Upload, 
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

// Interface for the config data structure
interface FormField {
  name: string;
  type: string;
  mandatory: boolean;
  validation: string;
}

interface Document {
  name: string;
  mandatory: boolean;
  maxSize: number;
  allowedFormat: string[];
}

interface Action {
  option: string;
  stage?: string;
  buttonLabel?: string;
  condition?: string;
}

interface Stage {
  stageName: string;
  fields: FormField[];
  documents: Document[];
  actions: Action[];
}

interface ClaimConfig {
  stages: Stage[];
}

const ClaimForm = () => {
  const navigate = useNavigate();
  const [claimConfig, setClaimConfig] = useState<ClaimConfig | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch configuration data
  useEffect(() => {
    // In a real app, we would fetch this from an API
    // For now, we'll simulate loading the data
    const loadConfigFromStorage = () => {
      try {
        // This is where we would normally fetch from an API endpoint
        // For demonstration, we'll create a sample config matching the image
        const sampleConfig: ClaimConfig = {
          stages: [
            {
              stageName: "Device Details",
              fields: [
                {
                  name: "Device Model",
                  type: "dropdown",
                  mandatory: true,
                  validation: "From pre-defined list"
                },
                {
                  name: "Issue Type",
                  type: "radio buttons",
                  mandatory: true,
                  validation: "One selection required"
                },
                {
                  name: "Purchase Date",
                  type: "date",
                  mandatory: true,
                  validation: "Valid date"
                },
                {
                  name: "Description",
                  type: "textarea",
                  mandatory: false,
                  validation: ""
                }
              ],
              documents: [
                {
                  name: "Proof of Purchase",
                  mandatory: true,
                  maxSize: 10,
                  allowedFormat: ["PDF"]
                }
              ],
              actions: [
                {
                  option: "submit",
                  stage: "Document Upload",
                  buttonLabel: "Continue",
                  condition: "All fields valid"
                },
                {
                  option: "save",
                  buttonLabel: "Save for Later",
                  condition: "Any state"
                }
              ]
            },
            {
              stageName: "Document Upload",
              fields: [],
              documents: [
                {
                  name: "Device Photos",
                  mandatory: true,
                  maxSize: 5,
                  allowedFormat: ["JPG", "PNG"]
                }
              ],
              actions: [
                {
                  option: "submit",
                  stage: "Claim Assessment",
                  buttonLabel: "Continue",
                  condition: "All fields valid"
                },
                {
                  option: "previous",
                  stage: "Device Details",
                  buttonLabel: "Back",
                  condition: "Any state"
                },
                {
                  option: "save",
                  buttonLabel: "Save for Later",
                  condition: "Any state"
                }
              ]
            },
            {
              stageName: "Claim Assessment",
              fields: [],
              documents: [],
              actions: [
                {
                  option: "submit",
                  buttonLabel: "Complete Claim",
                  condition: "All fields valid"
                },
                {
                  option: "previous",
                  stage: "Document Upload",
                  buttonLabel: "Back",
                  condition: "Any state"
                }
              ]
            }
          ]
        };
        
        setClaimConfig(sampleConfig);
        
        // Initialize formData for required fields
        const initialFormData: Record<string, any> = {};
        sampleConfig.stages.forEach(stage => {
          stage.fields.forEach(field => {
            initialFormData[field.name] = '';
          });
        });
        
        setFormData(initialFormData);
        
        // Initialize uploadedDocs
        const initialDocs: Record<string, File | null> = {};
        sampleConfig.stages.forEach(stage => {
          stage.documents.forEach(doc => {
            initialDocs[doc.name] = null;
          });
        });
        
        setUploadedDocs(initialDocs);
        
      } catch (error) {
        console.error("Error loading configuration:", error);
        toast.error("Failed to load claim configuration");
      } finally {
        setLoading(false);
      }
    };

    loadConfigFromStorage();
  }, []);

  // Handle input changes
  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error if field is now valid
    if (formErrors[name] && value) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle file uploads
  const handleFileUpload = (name: string, file: File | null) => {
    setUploadedDocs(prev => ({ ...prev, [name]: file }));
    
    // Clear error if document is now uploaded
    if (formErrors[name] && file) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate current stage
  const validateCurrentStage = () => {
    if (!claimConfig) return false;
    
    const currentStage = claimConfig.stages[currentStageIndex];
    const newErrors: Record<string, string> = {};
    
    // Validate fields
    currentStage.fields.forEach(field => {
      if (field.mandatory && !formData[field.name]) {
        newErrors[field.name] = `${field.name} is required`;
      }
    });
    
    // Validate documents
    currentStage.documents.forEach(doc => {
      if (doc.mandatory && !uploadedDocs[doc.name]) {
        newErrors[doc.name] = `${doc.name} is required`;
      }
    });
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle action buttons (continue, back, save)
  const handleAction = (action: Action) => {
    // For submit action, validate first
    if (action.option === 'submit' && action.stage) {
      if (!validateCurrentStage()) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Find the index of the next stage
      if (claimConfig) {
        const nextStageIndex = claimConfig.stages.findIndex(s => s.stageName === action.stage);
        if (nextStageIndex !== -1) {
          setCurrentStageIndex(nextStageIndex);
          window.scrollTo(0, 0);
          return;
        }
      }
    }
    
    // For previous action
    if (action.option === 'previous' && action.stage) {
      if (claimConfig) {
        const prevStageIndex = claimConfig.stages.findIndex(s => s.stageName === action.stage);
        if (prevStageIndex !== -1) {
          setCurrentStageIndex(prevStageIndex);
          window.scrollTo(0, 0);
          return;
        }
      }
    }
    
    // For save action
    if (action.option === 'save') {
      toast.success("Your claim has been saved");
      // In a real app, we would save the form data to the server here
      return;
    }
    
    // For completing the claim
    if (action.option === 'submit' && !action.stage) {
      if (!validateCurrentStage()) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      toast.success("Your claim has been submitted successfully");
      // In a real app, we would submit the entire claim to the server here
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!claimConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Configuration Error</h2>
          <p className="text-gray-600">Unable to load claim configuration.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const currentStage = claimConfig.stages[currentStageIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-claims-blue py-5 px-8 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Mobile Protection Claim</h1>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          {claimConfig.stages.map((stage, index) => (
            <React.Fragment key={stage.stageName}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                  index < currentStageIndex ? 'bg-blue-500' : 
                  index === currentStageIndex ? 'bg-blue-500' : 
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className="mt-2 text-sm text-center">{stage.stageName}</span>
              </div>
              {index < claimConfig.stages.length - 1 && (
                <div className={`h-1 flex-1 ${
                  index < currentStageIndex ? 'bg-blue-500' : 'bg-gray-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold mb-6">
            {currentStage.stageName === "Device Details" ? "Device Information" : currentStage.stageName}
          </h2>

          {/* Form Fields */}
          <div className="space-y-8">
            {currentStage.fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <div className="flex items-center">
                  <label className="text-gray-700 font-medium">{field.name}</label>
                  {field.mandatory && (
                    <span className="ml-1 text-red-500">
                      <AlertCircle size={16} />
                    </span>
                  )}
                </div>

                {field.type === 'dropdown' && (
                  <div className="relative w-full">
                    <div className="border rounded-md p-3 flex justify-between items-center cursor-pointer">
                      {formData[field.name] || `Select ${field.name}`}
                      <ChevronDown />
                    </div>
                    {formErrors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors[field.name]}</p>
                    )}
                  </div>
                )}

                {field.type === 'radio buttons' && (
                  <div>
                    <RadioGroup 
                      value={formData[field.name]} 
                      onValueChange={(value) => handleInputChange(field.name, value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Screen Damage" id="screen" />
                        <Label htmlFor="screen">Screen Damage</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Battery Issue" id="battery" />
                        <Label htmlFor="battery">Battery Issue</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Water Damage" id="water" />
                        <Label htmlFor="water">Water Damage</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Not Powering On" id="power" />
                        <Label htmlFor="power">Not Powering On</Label>
                      </div>
                    </RadioGroup>
                    {formErrors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors[field.name]}</p>
                    )}
                  </div>
                )}

                {field.type === 'date' && (
                  <div className="flex">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !formData[field.name] && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData[field.name] ? (
                            format(formData[field.name], "MM/dd/yyyy")
                          ) : (
                            <span>MM/DD/YYYY</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData[field.name]}
                          onSelect={(date) => handleInputChange(field.name, date)}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {formErrors[field.name] && (
                      <p className="text-red-500 text-sm mt-1 ml-4">{formErrors[field.name]}</p>
                    )}
                  </div>
                )}

                {field.type === 'textarea' && (
                  <div>
                    <Textarea 
                      placeholder="Describe the issue in detail..."
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="resize-none"
                      rows={4}
                    />
                    {formErrors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors[field.name]}</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Documents Section */}
            {currentStage.documents.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Required Documents</h3>
                <div className="space-y-4">
                  {currentStage.documents.map((doc) => (
                    <div key={doc.name} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h4 className="font-medium">{doc.name}</h4>
                            {doc.mandatory && (
                              <span className="ml-1 text-red-500">
                                <AlertCircle size={16} />
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Format: {doc.allowedFormat.join(", ")} (Max: {doc.maxSize}MB)
                          </p>
                        </div>
                        <div className="flex items-center">
                          <label htmlFor={`upload-${doc.name}`} className="cursor-pointer">
                            <div className="bg-gray-100 hover:bg-gray-200 transition-colors px-4 py-2 rounded-md">
                              Choose File
                            </div>
                            <input
                              id={`upload-${doc.name}`}
                              type="file"
                              className="hidden"
                              accept={doc.allowedFormat.map(format => `.${format.toLowerCase()}`).join(",")}
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                handleFileUpload(doc.name, file);
                              }}
                            />
                          </label>
                          <span className="ml-4 text-gray-500">
                            {uploadedDocs[doc.name]?.name || "No file chosen"}
                          </span>
                        </div>
                      </div>
                      {formErrors[doc.name] && (
                        <p className="text-red-500 text-sm mt-2">{formErrors[doc.name]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            {currentStage.actions.map((action, index) => (
              <Button
                key={`${action.option}-${index}`}
                variant={action.option === 'save' ? 'outline' : 'default'}
                className={action.option === 'submit' ? 'bg-claims-blue hover:bg-claims-blue-dark' : ''}
                onClick={() => handleAction(action)}
              >
                {action.buttonLabel}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimForm;
