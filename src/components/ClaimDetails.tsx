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
import { CircleCheck, Circle, Clock, Check, ArrowRight, Calendar, Upload, Save } from 'lucide-react';
import FormFieldRow from './FormFieldRow';
import DocumentRow from './DocumentRow';
import { toast } from 'sonner';

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch claim configuration
        const configResponse = await fetch('http://localhost:8081/api/configs/PE');
        if (!configResponse.ok) {
          throw new Error('Failed to fetch claim configuration');
        }
        const configData = await configResponse.json();
        console.log("Config data:", configData);
        setClaimConfig(configData);
        
        // Fetch claim data or use provided data
        if (initialClaimData) {
          console.log("Using provided claim data:", initialClaimData);
          setClaimData(initialClaimData);
          
          // Initialize form values from claim data
          if (initialClaimData.stageData) {
            setFormValues(initialClaimData.stageData);
            
            // Set the active tab to the current stage
            setActiveTab(initialClaimData.currentStage || "");
            
            // Set selected issue type if available
            const stageDataKey = initialClaimData.currentStage;
            if (stageDataKey && initialClaimData.stageData[stageDataKey]?.issue_type) {
              setSelectedIssueType(initialClaimData.stageData[stageDataKey].issue_type);
            }
          }
        } else {
          // Fetch claim data from API
          const claimResponse = await fetch(`http://localhost:8081/api/claims/${claimId}`);
          if (!claimResponse.ok) {
            throw new Error('Failed to fetch claim data');
          }
          const claimDataResponse = await claimResponse.json();
          console.log("Fetched claim data:", claimDataResponse);
          setClaimData(claimDataResponse);
          
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
  };

  const handleIssueTypeChange = (value: string) => {
    setSelectedIssueType(value);
    handleFormChange(activeTab, 'issue_type', value);
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
      setClaimData(updatedData);
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
      <div className="bg-claims-blue text-white p-6 rounded-t-lg">
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
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
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
      
      {/* Claim Progress Timeline */}
      <div className="flex justify-center items-center py-8">
        {configurationArray.length > 0 ? (
          configurationArray.map((stage, index) => (
            <React.Fragment key={stage.stageName}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStageIndex 
                    ? 'bg-green-500 text-white' 
                    : index === currentStageIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStageIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-sm mt-2 text-center max-w-[120px]">{stage.stageName}</span>
              </div>
              
              {index < configurationArray.length - 1 && (
                <div className={`h-[2px] w-24 mx-2 ${
                  index < currentStageIndex ? 'bg-blue-500' : 'bg-gray-300'
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
            <h3 className="text-xl font-medium mb-6">
              {activeTab}
            </h3>
            
            <ScrollArea className="h-[500px] pr-4">
              {/* Form Fields Section */}
              {configurationArray.find(stage => stage.stageName === activeTab)?.fields && (
                <div className="mb-8">
                  <h4 className="text-lg font-medium mb-4">Form Fields</h4>
                  
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
                        
                        {field.type === 'text' && (
                          <Input
                            id={field.name}
                            type="text"
                            value={formValues[activeTab]?.[field.name] || ''}
                            onChange={(e) => handleFormChange(activeTab, field.name, e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md"
                          />
                        )}
                        
                        {field.type === 'date' && (
                          <div className="relative">
                            <Input
                              id={field.name}
                              type="date"
                              value={formValues[activeTab]?.[field.name] || ''}
                              onChange={(e) => handleFormChange(activeTab, field.name, e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-md"
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
                            className="w-full p-3 border border-gray-300 rounded-md"
                          />
                        )}
                        
                        {field.type === 'textarea' && (
                          <Textarea
                            id={field.name}
                            placeholder="Enter description..."
                            value={formValues[activeTab]?.[field.name] || ''}
                            onChange={(e) => handleFormChange(activeTab, field.name, e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md min-h-[120px]"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Documents Section */}
              {configurationArray.find(stage => stage.stageName === activeTab)?.documents && (
                <div className="mb-8">
                  <h4 className="text-lg font-medium mb-4">Required Documents</h4>
                  
                  {configurationArray.find(stage => stage.stageName === activeTab)?.documents?.map(doc => (
                    <div key={doc.name} className="border border-gray-200 rounded-lg p-4 mb-4">
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
                          <Button variant="outline" className="bg-gray-100 mr-2">
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
              
              {/* Action Buttons - Always show them */}
              <div className="flex justify-end space-x-4 mt-8 sticky bottom-0 bg-white pt-4 pb-2">
                <Button 
                  variant="outline" 
                  onClick={handleSaveForLater}
                  disabled={isSaving}
                  className="border-gray-300 text-gray-700"
                >
                  {isSaving ? 'Saving...' : 'Save for Later'}
                  {!isSaving && <Save className="ml-2 h-4 w-4" />}
                </Button>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-claims-blue hover:bg-claims-blue-dark"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimDetails;
