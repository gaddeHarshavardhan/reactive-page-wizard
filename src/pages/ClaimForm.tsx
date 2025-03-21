
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Interfaces
interface Field {
  name: string;
  type: string;
  mandatory: boolean;
  validation: string;
}

interface DocumentSpec {
  name: string;
  mandatory: boolean;
  maxSize: number;
  allowedFormat: string[];
}

interface Action {
  option: string;
  stage?: string;
  buttonLabel: string;
  condition: string;
}

interface Stage {
  stageName: string;
  fields: Field[];
  documents: DocumentSpec[];
  actions: Action[];
}

interface ClaimConfig {
  stages: Stage[];
}

interface FormValues {
  [key: string]: any;
}

interface UploadedDocument {
  name: string;
  documentName: string;
  size: number;
  format: string;
}

// Main Component
const ClaimForm = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ClaimConfig | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load configuration from localStorage
  useEffect(() => {
    const storedConfig = localStorage.getItem('claimConfig');
    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig);
        setConfig(parsedConfig);
        console.log('Loaded claim config:', parsedConfig);
      } catch (error) {
        console.error('Error parsing claim config:', error);
        toast.error('Failed to load claim configuration');
      }
    } else {
      toast.error('No claim configuration found. Please create one first.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [navigate]);

  const currentStage = config?.stages[currentStageIndex];

  // Handle form value changes
  const handleInputChange = (name: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle document upload
  const handleDocumentUpload = (documentName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const documentSpec = currentStage?.documents.find(doc => doc.name === documentName);
    if (!documentSpec) return;

    // Check file size (convert MB to bytes)
    const maxSizeBytes = documentSpec.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File too large. Maximum size is ${documentSpec.maxSize}MB`);
      return;
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toUpperCase() || '';
    if (!documentSpec.allowedFormat.includes(fileExtension)) {
      toast.error(`Invalid file format. Allowed formats: ${documentSpec.allowedFormat.join(', ')}`);
      return;
    }

    // Add document to uploaded list
    const newDocument: UploadedDocument = {
      name: file.name,
      documentName,
      size: file.size,
      format: fileExtension
    };

    // Replace if already exists
    setUploadedDocuments(prev => {
      const filtered = prev.filter(doc => doc.documentName !== documentName);
      return [...filtered, newDocument];
    });

    toast.success(`Uploaded: ${file.name}`);
  };

  // Handle form actions
  const handleAction = (action: Action) => {
    setIsSubmitting(true);

    // Validate required fields if action requires it
    if (action.condition === 'All fields valid') {
      const requiredFields = currentStage?.fields.filter(field => field.mandatory) || [];
      for (const field of requiredFields) {
        if (formValues[field.name] === undefined || formValues[field.name] === '') {
          toast.error(`Please fill in ${field.name}`);
          setIsSubmitting(false);
          return;
        }
      }

      const requiredDocs = currentStage?.documents.filter(doc => doc.mandatory) || [];
      for (const doc of requiredDocs) {
        if (!uploadedDocuments.some(uploaded => uploaded.documentName === doc.name)) {
          toast.error(`Please upload ${doc.name}`);
          setIsSubmitting(false);
          return;
        }
      }
    }

    // Process action
    setTimeout(() => {
      setIsSubmitting(false);

      if (action.option === 'submit' && action.stage) {
        // Find next stage index
        const nextStageIndex = config?.stages.findIndex(stage => stage.stageName === action.stage);
        if (nextStageIndex !== undefined && nextStageIndex !== -1) {
          setCurrentStageIndex(nextStageIndex);
          toast.success(`Moving to ${action.stage}`);
        }
      } else if (action.option === 'save') {
        toast.success('Claim progress saved');
      } else if (action.option === 'cancel') {
        toast.info('Claim cancelled');
        navigate('/');
      }
    }, 1000);
  };

  // Render loading state if config is not loaded
  if (!config || !currentStage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <h2 className="text-xl font-medium text-gray-500">Loading claim form...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-claims-blue py-5 px-8 text-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium animate-fade-in">Mobile Protection Claim</h1>
            <div className="text-lg animate-fade-in">Claim #MP-2023112233</div>
          </div>
        </div>
      </header>

      {/* Progress Indicators */}
      <div className="max-w-3xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-start mb-8">
          {config.stages.map((stage, index) => (
            <React.Fragment key={stage.stageName}>
              <div 
                className={cn(
                  "rounded-full w-10 h-10 flex items-center justify-center font-semibold",
                  index < currentStageIndex 
                    ? "bg-claims-green text-white" 
                    : index === currentStageIndex 
                      ? "bg-claims-blue text-white" 
                      : "bg-gray-200 text-gray-600"
                )}
              >
                {index < currentStageIndex ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < config.stages.length - 1 && (
                <div 
                  className={cn(
                    "h-1 w-16", 
                    index < currentStageIndex ? "bg-claims-green" : "bg-gray-200"
                  )}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <h2 className="text-2xl font-medium">{currentStage.stageName}</h2>
            <span className="ml-3 text-sm bg-claims-blue text-white px-2 py-1 rounded">
              Step {currentStageIndex + 1} of {config.stages.length}
            </span>
          </div>
          <p className="text-gray-600 mt-2">
            {currentStage.stageName === 'Claim Submission' && 'Please provide details about your device and the issue.'}
            {currentStage.stageName === 'Document Upload' && 'Please upload the required documents to support your claim.'}
            {currentStage.stageName === 'Claim Assessment' && 'Your claim is being assessed. Please provide any additional information if requested.'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">
            {currentStage.fields.length > 0 ? 'Required Information' : 'Information'}
          </h3>

          <div className="space-y-6">
            {currentStage.fields.map((field) => (
              <div key={field.name} className="grid grid-cols-3 gap-4 items-start">
                <Label htmlFor={field.name} className="text-sm font-medium mt-2">
                  {field.name}
                  {field.mandatory && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="col-span-2">
                  {field.type === 'text' && (
                    <Input 
                      id={field.name}
                      value={formValues[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      className="w-full"
                    />
                  )}
                  {field.type === 'number' && (
                    <Input 
                      id={field.name}
                      type="number"
                      value={formValues[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.name.toLowerCase()}`}
                      className="w-full"
                    />
                  )}
                  {field.type === 'dropdown' && (
                    <Select 
                      value={formValues[field.name] || ''}
                      onValueChange={(value) => handleInputChange(field.name, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${field.name.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.name === 'Device Model' ? (
                          <>
                            <SelectItem value="iphone-13">iPhone 13</SelectItem>
                            <SelectItem value="iphone-14">iPhone 14</SelectItem>
                            <SelectItem value="iphone-15">iPhone 15</SelectItem>
                            <SelectItem value="galaxy-s22">Galaxy S22</SelectItem>
                            <SelectItem value="galaxy-s23">Galaxy S23</SelectItem>
                            <SelectItem value="pixel-7">Pixel 7</SelectItem>
                          </>
                        ) : (
                          <SelectItem value="option">Option</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === 'radio buttons' && (
                    <RadioGroup 
                      value={formValues[field.name] || ''}
                      onValueChange={(value) => handleInputChange(field.name, value)}
                      className="flex flex-col space-y-2"
                    >
                      {field.name === 'Issue Type' ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="screen-damage" id="screen-damage" />
                            <Label htmlFor="screen-damage">Screen Damage</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="battery-issue" id="battery-issue" />
                            <Label htmlFor="battery-issue">Battery Issue</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="not-powering-on" id="not-powering-on" />
                            <Label htmlFor="not-powering-on">Not Powering On</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="water-damage" id="water-damage" />
                            <Label htmlFor="water-damage">Water Damage</Label>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="option" id="option" />
                          <Label htmlFor="option">Option</Label>
                        </div>
                      )}
                    </RadioGroup>
                  )}
                  {field.type === 'checkbox' && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={field.name}
                        checked={formValues[field.name] || false}
                        onCheckedChange={(checked) => 
                          handleInputChange(field.name, checked === true)
                        }
                      />
                      <Label htmlFor={field.name}>Yes</Label>
                    </div>
                  )}
                  {field.type === 'date' && (
                    <div className="grid gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formValues[field.name] && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formValues[field.name] ? format(formValues[field.name], "PPP") : `Select ${field.name.toLowerCase()}`}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formValues[field.name]}
                            onSelect={(date) => handleInputChange(field.name, date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                  {field.validation && (
                    <p className="text-gray-500 text-xs mt-1">{field.validation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        {currentStage.documents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-200">Required Documents</h3>
            
            <div className="space-y-6">
              {currentStage.documents.map((doc) => {
                const uploadedDoc = uploadedDocuments.find(
                  uploaded => uploaded.documentName === doc.name
                );
                
                return (
                  <div key={doc.name} className="grid grid-cols-3 gap-4 items-start">
                    <div>
                      <Label className="text-sm font-medium">
                        {doc.name}
                        {doc.mandatory && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <p className="text-gray-500 text-xs mt-1">
                        Max size: {doc.maxSize}MB<br />
                        Formats: {doc.allowedFormat.join(', ')}
                      </p>
                    </div>
                    <div className="col-span-2">
                      {uploadedDoc ? (
                        <div className="flex items-center p-3 border border-gray-200 rounded bg-gray-50">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{uploadedDoc.name}</p>
                            <p className="text-xs text-gray-500">
                              {(uploadedDoc.size / 1024 / 1024).toFixed(2)}MB • {uploadedDoc.format}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                              setUploadedDocuments(prev => 
                                prev.filter(u => u.documentName !== doc.name)
                              );
                              toast.info(`Removed ${doc.name}`);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Label 
                            htmlFor={`upload-${doc.name}`}
                            className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm cursor-pointer hover:bg-gray-50"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload {doc.name}
                          </Label>
                          <Input
                            id={`upload-${doc.name}`}
                            type="file"
                            className="hidden"
                            onChange={(e) => handleDocumentUpload(doc.name, e)}
                            accept={doc.allowedFormat.map(format => `.${format.toLowerCase()}`).join(',')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          {currentStage.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.option === 'submit' ? 'default' : action.option === 'cancel' ? 'outline' : 'secondary'}
              className={action.option === 'submit' ? 'bg-claims-blue hover:bg-claims-blue-dark' : ''}
              onClick={() => handleAction(action)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {action.buttonLabel}
                  {action.option === 'submit' && <ChevronRight className="ml-2 w-4 h-4" />}
                </>
              )}
            </Button>
          ))}
          
          {/* If no actions are defined, show back button */}
          {currentStage.actions.length === 0 && (
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Back to Configuration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimForm;
