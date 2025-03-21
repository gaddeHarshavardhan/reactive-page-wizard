import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CircleCheck, Circle, Clock, Check, ArrowRight, Calendar, Upload, Save, AlertCircle } from 'lucide-react';
import FormFieldRow from './FormFieldRow';
import DocumentRow from './DocumentRow';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface ClaimDetailsProps {
  claimId?: string;
  claimData?: {
    claimType: string;
    customerId?: string;
    productId?: string;
    srId: string;
    customerName?: string;
    deviceMake?: string;
    dateCreated?: string;
    createdDate?: string;
    status: string;
    contact?: string;
    currentStage: string;
    category?: string; // Added the category field
    stageData: {
      [key: string]: any;
    }
  }
}

// Updated interface to match actual API response format
interface ClaimConfig {
  id: number;
  categoryName: string;
  configuration: {
    stageName: string;
    fields?: {
      name: string;
      type: string;
      mandatory: boolean;
      validation: string;
    }[];
    documents?: {
      name: string;
      mandatory: string;
      allowedFormat: string[];
    }[];
    actions?: {
      option: string;
      stage: string;
    }[];
  }[];
}

interface ClaimData {
  claimType: string;
  srId: string;
  customerName?: string;
  deviceMake?: string;
  dateCreated?: string;
  createdDate?: string;
  status: string;
  contact?: string;
  currentStage: string;
  customerId?: string;
  productId?: string;
  category?: string; // Added the category field
  stageData: {
    [key: string]: any;
  }
}

const ClaimDetails: React.FC<ClaimDetailsProps> = ({ claimId = "sr_95961497", claimData: initialClaimData }) => {
  const [claimConfig, setClaimConfig] = useState<ClaimConfig | null>(null);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [formValues, setFormValues] = useState<{[key: string]: any}>({});
  const [selectedIssueType, setSelectedIssueType] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First, fetch claim data if not provided
        let claimDataResponse;
        if (initialClaimData) {
          console.log("Using provided claim data:", initialClaimData);
          claimDataResponse = initialClaimData;
          setClaimData(initialClaimData);
        } else {
          // Fetch claim data from API
          const claimResponse = await fetch(`http://localhost:8081/api/claims/${claimId}`);
          if (!claimResponse.ok) {
            throw new Error('Failed to fetch claim data');
          }
          claimDataResponse = await claimResponse.json();
          console.log("Fetched claim data:", claimDataResponse);
          setClaimData(claimDataResponse);
        }
        
        // Extract category from claim data, default to "PE" if not available
        const category = claimDataResponse.category || "PE";
        console.log("Using category for config fetch:", category);
        
        // Fetch claim configuration using the category from claim data
        const configResponse = await fetch(`http://localhost:8081/api/configs/${category}`);
        if (!configResponse.ok) {
          throw new Error('Failed to fetch claim configuration');
        }
        const configData = await configResponse.json();
        console.log("Config data:", configData);
        setClaimConfig(configData);
        
        // Initialize form values from claim data
        if (claimDataResponse.stageData) {
          setFormValues(claimDataResponse.stageData);
          
          // Set the active tab to the current stage
          setActiveTab(claimDataResponse.currentStage || "");
          
          // Set selected issue type if available
          const stageDataKey = claimDataResponse.currentStage;
          if (stageDataKey && claimDataResponse.stageData[stageDataKey]?.issue_type) {
            setSelectedIssueType(claimDataResponse.stageData[stageDataKey].issue_type);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load claim data');
        
        // Mock data for demonstration
        const mockConfig: ClaimConfig = {
          id: 1,
          categoryName: "PE",
          configuration: [
            {
              stageName: "Document Upload",
              fields: [
                {
                  name: "dateOfIncident",
                  type: "date",
                  mandatory: true,
                  validation: "Cannot be Future Date"
                }
              ],
              documents: [
                {
                  name: "Device Photos",
                  mandatory: "false",
                  allowedFormat: ["JPG", "PNG"]
                }
              ],
              actions: [
                {
                  option: "submit",
                  stage: "Claim Assessment"
                }
              ]
            },
            {
              stageName: "Claim Assessment",
              fields: [
                {
                  name: "claim amount",
                  type: "number",
                  mandatory: true,
                  validation: "Cannot be Negative"
                }
              ],
              documents: [
                {
                  name: "Estimate Document",
                  mandatory: "true",
                  allowedFormat: ["PDF", "JPG", "PNG"]
                }
              ],
              actions: [
                {
                  option: "submit",
                  stage: "Complete Claim"
                }
              ]
            }
          ]
        };
        
        const mockClaimData: ClaimData = {
          claimType: "Mobile Protection",
          srId: "SR202503211234abcd",
          customerName: "John Smith",
          deviceMake: "Apple",
          dateCreated: "Mar 21, 2025",
          status: "New",
          contact: "+1 (555) 123-4567",
          currentStage: "Document Upload",
          category: "PE", // Add default category
          stageData: {
            "Document Upload": {
              dateOfIncident: "2025-03-15"
            }
          }
        };
        
        setClaimConfig(mockConfig);
        setClaimData(mockClaimData);
        setActiveTab(mockClaimData.currentStage);
        setFormValues(mockClaimData.stageData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [claimId, initialClaimData]);

  // Update activeTab when claimData changes, especially after submission
  useEffect(() => {
    if (claimData && claimData.currentStage) {
      console.log("Setting active tab to current stage:", claimData.currentStage);
      setActiveTab(claimData.currentStage);
    }
  }, [claimData]);

  // Get a stage's completion status based on timeline progression
  const isStageCompleted = (stageName: string): boolean => {
    if (!claimData) return false;
    
    // If claim is completed, all stages should be marked as completed
    if (isClaimCompleted()) return true;
    
    // Otherwise, only mark previous stages as completed
    const currentStageIndex = getCurrentStageIndex();
    const stageIndex = getStageIndex(stageName);
    return stageIndex < currentStageIndex;
  };

  // Check if the claim is in completed status
  const isClaimCompleted = (): boolean => {
    return claimData?.status === "Completed";
  };

  // Handle stage selection - allow viewing completed stages
  const handleStageSelect = (stageName: string) => {
    if (isStageCompleted(stageName) || stageName === claimData?.currentStage) {
      setActiveTab(stageName);
    }
  };

  const getStageIndex = (stageName: string): number => {
    if (!claimConfig || !claimConfig.configuration) return -1;
    return claimConfig.configuration.findIndex(stage => stage.stageName === stageName);
  };

  const getCurrentStageIndex = (): number => {
    if (!claimData || !claimData.currentStage) return 0;
    return getStageIndex(claimData.currentStage);
  };

  const handleFormChange = (stageName: string, fieldName: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [stageName]: {
        ...(prev[stageName] || {}),
        [fieldName]: value
      }
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleIssueTypeChange = (value: string) => {
    setSelectedIssueType(value);
    handleFormChange(activeTab, 'issue_type', value);
  };

  // Validate mandatory fields
  const validateFields = (): boolean => {
    if (!claimConfig || !activeTab) return true;
    
    const currentStageConfig = claimConfig.configuration.find(stage => stage.stageName === activeTab);
    if (!currentStageConfig || !currentStageConfig.fields) return true;
    
    const errors: {[key: string]: string} = {};
    let isValid = true;
    
    // Check each mandatory field
    currentStageConfig.fields.forEach(field => {
      if (field.mandatory) {
        const fieldValue = formValues[activeTab]?.[field.name];
        if (fieldValue === undefined || fieldValue === '' || fieldValue === null) {
          errors[field.name] = `${field.name} is required`;
          isValid = false;
        }
      }
    });
    
    // Check mandatory documents if any
    currentStageConfig.documents?.forEach(doc => {
      if (doc.mandatory === "true") {
        // Here you would check if the document has been uploaded
        // This is a placeholder for document validation
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSaveForLater = async () => {
    if (!claimData) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:8081/api/claims/${claimData.srId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...claimData,
          stageData: formValues
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save claim data');
      }
      
      toast.success('Claim progress saved successfully');
    } catch (error) {
      console.error('Error saving claim:', error);
      toast.error('Failed to save claim progress');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!claimData) return;
    
    // Validate fields before submission
    if (!validateFields()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8081/api/claims/${claimData.srId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...claimData,
          stageData: formValues
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit claim');
      }
      
      const updatedData = await response.json();
      console.log("Updated claim data after submission:", updatedData);
      
      // Update the local state with the new data from the API
      setClaimData(updatedData);
      
      // Explicitly set the active tab to the new current stage
      if (updatedData.currentStage) {
        setActiveTab(updatedData.currentStage);
      }
      
      toast.success('Claim submitted successfully');
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading claim details...</div>;
  }

  if (!claimData || !claimConfig) {
    return <div className="flex justify-center items-center h-96">No claim data available</div>;
  }

  const currentStageIndex = getCurrentStageIndex();

  // Add a safety check for configuration
  const configurationArray = claimConfig.configuration || [];
  
  console.log("Current Stage Index:", currentStageIndex);
  console.log("Configuration Array:", configurationArray);

  // Format displayed data
  const displayName = claimData.customerName || "Not Available";
  const displayDeviceMake = claimData.deviceMake || "Not Available";
  const displayDate = claimData.dateCreated || claimData.createdDate || "Not Available";
  const displayContact = claimData.contact || "Not Available";

  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
      {/* Claim Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6 rounded-t-lg shadow-md">
        <h2 className="text-2xl font-semibold">{claimData.claimType}</h2>
      </div>
      
      {/* Claim Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <div className="mb-4">
            <span className="text-gray-500">Service Request ID:</span>
            <span className="ml-2 font-medium">{claimData.srId}</span>
          </div>
          <div className="mb-4">
            <span className="text-gray-500">Customer Name:</span>
            <span className="ml-2 font-medium">{displayName}</span>
          </div>
          <div className="mb-4">
            <span className="text-gray-500">Device Make:</span>
            <span className="ml-2 font-medium">{displayDeviceMake}</span>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <span className="text-gray-500">Date Created:</span>
            <span className="ml-2 font-medium">{displayDate}</span>
          </div>
          <div className="mb-4">
            <span className="text-gray-500">Status:</span>
            <span className="ml-2">
              <span className={`${
                isClaimCompleted() ? "bg-green-500" : "bg-blue-500"
              } text-white px-4 py-1 rounded-full text-sm font-medium shadow-sm`}>
                {claimData.status}
              </span>
            </span>
          </div>
          <div className="mb-4">
            <span className="text-gray-500">Contact:</span>
            <span className="ml-2 font-medium">{displayContact}</span>
          </div>
        </div>
      </div>
      
      {/* Claim Progress Timeline - Updated to handle completed status */}
      <div className="flex justify-center items-center py-8">
        {configurationArray.length > 0 ? (
          configurationArray.map((stage, index) => (
            <React.Fragment key={stage.stageName}>
              <div 
                className={`flex flex-col items-center ${
                  isStageCompleted(stage.stageName) || stage.stageName === claimData.currentStage 
                    ? "cursor-pointer transition-transform hover:scale-105" 
                    : "cursor-not-allowed opacity-70"
                }`}
                onClick={() => handleStageSelect(stage.stageName)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                  isClaimCompleted() || index < currentStageIndex
                    ? 'bg-green-500 text-white' 
                    : index === currentStageIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {isClaimCompleted() || index < currentStageIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-sm mt-2 text-center max-w-[120px] ${
                  activeTab === stage.stageName ? "font-bold text-blue-600" : ""
                }`}>
                  {stage.stageName}
                </span>
              </div>
              
              {index < configurationArray.length - 1 && (
                <div className={`h-[2px] w-24 mx-2 transition-colors ${
                  isClaimCompleted() || index < currentStageIndex 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="text-gray-500">No stages defined</div>
        )}
      </div>
      
      {/* Stage Content - Updated with ScrollArea for proper scrolling */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {activeTab && configurationArray.find(stage => stage.stageName === activeTab) && (
          <div>
            <h3 className="text-xl font-medium mb-6 text-blue-700 flex items-center">
              {activeTab}
              {isStageCompleted(activeTab) && (
                <span className="ml-3 text-green-500 text-sm inline-flex items-center">
                  <Check className="h-4 w-4 mr-1" />
                  Completed
                </span>
              )}
            </h3>
            
            <ScrollArea className="h-[500px] pr-4">
              {/* Form Fields Section */}
              {configurationArray.find(stage => stage.stageName === activeTab)?.fields && (
                <div className="mb-8">
                  <div className="space-y-6">
                    {configurationArray.find(stage => stage.stageName === activeTab)?.fields?.map(field => (
                      <div key={field.name} className="space-y-2">
                        <div className="flex items-center">
                          <Label htmlFor={field.name} className="block text-gray-700 font-medium">
                            {field.name}
                          </Label>
                          {field.mandatory && (
                            <span className="ml-1 text-red-500 text-lg">*</span>
                          )}
                        </div>
                        
                        <div className="relative">
                          {field.type === 'text' && (
                            <Input
                              id={field.name}
                              type="text"
                              value={formValues[activeTab]?.[field.name] || ''}
                              onChange={(e) => handleFormChange(activeTab, field.name, e.target.value)}
                              className={`w-full p-3 border ${validationErrors[field.name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md`}
                              readOnly={isStageCompleted(activeTab) || isClaimCompleted()}
                            />
                          )}
                          
                          {field.type === 'date' && (
                            <div className="relative">
                              <Input
                                id={field.name}
                                type="date"
                                value={formValues[activeTab]?.[field.name] || ''}
                                onChange={(e) => handleFormChange(activeTab, field.name, e.target.value)}
                                className={`w-full p-3 border ${validationErrors[field.name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md`}
                                readOnly={isStageCompleted(activeTab) || isClaimCompleted()}
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Calendar className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          )}
                          
                          {field.type === 'number' && (
                            <Input
                              id={field.name}
                              type="number"
                              value={formValues[activeTab]?.[field.name] || ''}
                              onChange={(e) => handleFormChange(activeTab, field.name, e.target.value)}
                              className={`w-full p-3 border ${validationErrors[field.name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md`}
                              readOnly={isStageCompleted(activeTab) || isClaimCompleted()}
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <Textarea
                              id={field.name}
                              placeholder="Enter description..."
                              value={formValues[activeTab]?.[field.name] || ''}
                              onChange={(e) => handleFormChange(activeTab, field.name, e.target.value)}
                              className={`w-full p-3 border ${validationErrors[field.name] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'} rounded-md min-h-[120px]`}
                              readOnly={isStageCompleted(activeTab) || isClaimCompleted()}
                            />
                          )}
                          
                          {validationErrors[field.name] && (
                            <div className="text-red-500 text-sm mt-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {validationErrors[field.name]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Documents Section */}
              {configurationArray.find(stage => stage.stageName === activeTab)?.documents && (
                <div className="mb-8">
                  <h4 className="text-lg font-medium mb-4 text-blue-700">Required Documents</h4>
                  
                  {configurationArray.find(stage => stage.stageName === activeTab)?.documents?.map(doc => (
                    <div key={doc.name} className="border border-gray-200 rounded-lg p-4 mb-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center mb-1">
                            <h5 className="font-medium">{doc.name}</h5>
                            {doc.mandatory === "true" && (
                              <span className="ml-1 text-red-500 text-lg">*</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">Format: {doc.allowedFormat.join(", ")}</p>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            className="bg-gray-100 mr-2 hover:bg-blue-50"
                            disabled={isStageCompleted(activeTab) || isClaimCompleted()}
                          >
                            Choose File
                            <Upload className="ml-2 h-4 w-4" />
                          </Button>
                          <span className="text-gray-500 text-sm">No file chosen</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Action Buttons - Only show for current stage and if claim is not completed */}
              {activeTab === claimData.currentStage && !isClaimCompleted() && (
                <div className="flex justify-end space-x-4 mt-8 sticky bottom-0 bg-white pt-4 pb-2">
                  <Button 
                    variant="outline" 
                    onClick={handleSaveForLater}
                    disabled={isSaving || isClaimCompleted()}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {isSaving ? 'Saving...' : 'Save for Later'}
                    {!isSaving && <Save className="ml-2 h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || isClaimCompleted()}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 transition-all"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimDetails;
