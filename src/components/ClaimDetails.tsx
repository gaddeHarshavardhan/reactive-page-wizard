
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
import { CircleCheck, Circle, Clock, Check, ArrowRight, Calendar, Upload } from 'lucide-react';
import FormFieldRow from './FormFieldRow';
import DocumentRow from './DocumentRow';
import { toast } from 'sonner';

interface ClaimDetailsProps {
  claimId?: string;
  initialClaimData?: {
    claimType: string;
    customerId: string;
    productId: string;
    stageData: {
      [key: string]: any;
    }
  }
}

interface ClaimConfig {
  stages: {
    id: string;
    name: string;
    formFields?: {
      id: string;
      label: string;
      type: string;
      mandatory: boolean;
      validation?: string;
      options?: string[];
    }[];
    documents?: {
      id: string;
      type: string;
      format: string;
      mandatory: boolean;
      maxSize: number;
    }[];
  }[];
}

interface ClaimData {
  claimType: string;
  srId: string;
  customerName: string;
  deviceMake: string;
  dateCreated: string;
  status: string;
  contact: string;
  currentStage: string;
  stageData: {
    [key: string]: any;
  }
}

const ClaimDetails: React.FC<ClaimDetailsProps> = ({ claimId = "sr_95961497", initialClaimData }) => {
  const [claimConfig, setClaimConfig] = useState<ClaimConfig | null>(null);
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [formValues, setFormValues] = useState<{[key: string]: any}>({});
  const [selectedIssueType, setSelectedIssueType] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch claim configuration
        const configResponse = await fetch('http://localhost:8081/api/configs');
        if (!configResponse.ok) {
          throw new Error('Failed to fetch claim configuration');
        }
        const configData = await configResponse.json();
        setClaimConfig(configData);
        
        // Fetch claim data
        const claimResponse = await fetch(`http://localhost:8081/api/claims/${claimId}`);
        if (!claimResponse.ok) {
          throw new Error('Failed to fetch claim data');
        }
        const claimDataResponse = await claimResponse.json();
        setClaimData(claimDataResponse);
        
        // Initialize form values from claim data
        if (claimDataResponse.stageData) {
          setFormValues(claimDataResponse.stageData);
          
          // Set the active tab to the current stage
          setActiveTab(claimDataResponse.currentStage || "");
          
          // Set selected issue type if available
          if (claimDataResponse.stageData.claim_submission?.issue_type) {
            setSelectedIssueType(claimDataResponse.stageData.claim_submission.issue_type);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load claim data');
        
        // Mock data for demonstration
        const mockConfig: ClaimConfig = {
          stages: [
            {
              id: "device_details",
              name: "Device Details",
              formFields: [
                { id: "device_model", label: "Device Model", type: "select", mandatory: true, validation: "Required" },
                { id: "issue_type", label: "Issue Type", type: "radio", mandatory: true, validation: "Required", 
                  options: ["Screen Damage", "Battery Issue", "Water Damage", "Not Powering On"] },
                { id: "purchase_date", label: "Purchase Date", type: "date", mandatory: true, validation: "Required" },
                { id: "description", label: "Description", type: "textarea", mandatory: false }
              ],
              documents: [
                { 
                  id: "proof_of_purchase", 
                  type: "Proof of Purchase", 
                  format: "PDF", 
                  mandatory: true, 
                  maxSize: 10 
                }
              ]
            },
            {
              id: "document_upload",
              name: "Document Upload",
              documents: [
                { 
                  id: "proof_of_purchase", 
                  type: "Proof of Purchase", 
                  format: "PDF", 
                  mandatory: true, 
                  maxSize: 10 
                },
                { 
                  id: "device_photos", 
                  type: "Device Photos", 
                  format: "JPG, PNG", 
                  mandatory: true, 
                  maxSize: 5 
                }
              ]
            },
            {
              id: "claim_assessment",
              name: "Claim Assessment"
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
          currentStage: "device_details",
          stageData: {
            device_details: {
              device_model: "iPhone 14",
              issue_type: "Screen Damage",
              purchase_date: "2023-12-10",
              description: "Phone screen cracked after accidental drop"
            }
          }
        };
        
        setClaimConfig(mockConfig);
        setClaimData(mockClaimData);
        setActiveTab(mockClaimData.currentStage);
        setFormValues(mockClaimData.stageData);
        if (mockClaimData.stageData.device_details?.issue_type) {
          setSelectedIssueType(mockClaimData.stageData.device_details.issue_type);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [claimId]);

  const findStageIndex = (stageId: string): number => {
    if (!claimConfig) return -1;
    return claimConfig.stages.findIndex(stage => stage.id === stageId);
  };

  const getCurrentStageIndex = (): number => {
    if (!claimData || !claimData.currentStage) return 0;
    return findStageIndex(claimData.currentStage);
  };

  const handleFormChange = (stageId: string, fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [stageId]: {
        ...(prev[stageId] || {}),
        [fieldId]: value
      }
    }));
  };

  const handleIssueTypeChange = (value: string) => {
    setSelectedIssueType(value);
    handleFormChange(activeTab, 'issue_type', value);
  };

  const handleSaveForLater = () => {
    toast.success('Claim progress saved');
  };

  const handleContinue = () => {
    toast.success('Moving to next stage');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading claim details...</div>;
  }

  if (!claimData || !claimConfig) {
    return <div className="flex justify-center items-center h-96">No claim data available</div>;
  }

  const currentStageIndex = getCurrentStageIndex();

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
            <span className="ml-2 font-medium">{claimData.customerName}</span>
          </div>
          <div className="mb-4">
            <span className="text-gray-500">Device Make:</span>
            <span className="ml-2 font-medium">{claimData.deviceMake}</span>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <span className="text-gray-500">Date Created:</span>
            <span className="ml-2 font-medium">{claimData.dateCreated}</span>
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
            <span className="ml-2 font-medium">{claimData.contact}</span>
          </div>
        </div>
      </div>
      
      {/* Claim Progress Timeline */}
      <div className="flex justify-center items-center py-8">
        {claimConfig.stages.map((stage, index) => (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index < currentStageIndex 
                  ? 'bg-green-500 text-white' 
                  : index === currentStageIndex 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm mt-2 text-center max-w-[120px]">{stage.name}</span>
            </div>
            
            {index < claimConfig.stages.length - 1 && (
              <div className={`h-[2px] w-24 mx-2 ${
                index < currentStageIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Stage Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {activeTab && claimConfig.stages.find(stage => stage.id === activeTab) && (
          <div>
            <h3 className="text-xl font-medium mb-6">
              {claimConfig.stages.find(stage => stage.id === activeTab)?.name}
            </h3>
            
            {/* Form Fields Section */}
            {claimConfig.stages.find(stage => stage.id === activeTab)?.formFields && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4">Device Information</h4>
                
                <div className="space-y-6">
                  {claimConfig.stages.find(stage => stage.id === activeTab)?.formFields?.map(field => (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor={field.id} className="block text-gray-700 font-medium">
                          {field.label}
                        </Label>
                        {field.mandatory && (
                          <span className="ml-1 text-red-500 text-lg">*</span>
                        )}
                      </div>
                      
                      {field.type === 'select' && (
                        <div className="relative">
                          <select
                            id={field.id}
                            className="w-full p-3 border border-gray-300 rounded-md bg-white appearance-none pr-10"
                            value={formValues[activeTab]?.[field.id] || ''}
                            onChange={(e) => handleFormChange(activeTab, field.id, e.target.value)}
                          >
                            <option value="">Select Device Model</option>
                            <option value="iPhone 14">iPhone 14</option>
                            <option value="iPhone 13">iPhone 13</option>
                            <option value="iPhone 12">iPhone 12</option>
                            <option value="Samsung Galaxy S22">Samsung Galaxy S22</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {field.type === 'radio' && field.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {field.options.map(option => (
                            <div key={option} className="flex items-center">
                              <div 
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 cursor-pointer ${
                                  selectedIssueType === option ? 'border-blue-500' : 'border-gray-300'
                                }`}
                                onClick={() => handleIssueTypeChange(option)}
                              >
                                {selectedIssueType === option && (
                                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {field.type === 'date' && (
                        <div className="relative">
                          <Input
                            id={field.id}
                            type="text"
                            placeholder="MM/DD/YYYY"
                            value={formValues[activeTab]?.[field.id] || ''}
                            onChange={(e) => handleFormChange(activeTab, field.id, e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Calendar className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      )}
                      
                      {field.type === 'textarea' && (
                        <Textarea
                          id={field.id}
                          placeholder="Describe the issue in detail..."
                          value={formValues[activeTab]?.[field.id] || ''}
                          onChange={(e) => handleFormChange(activeTab, field.id, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md min-h-[120px]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Documents Section */}
            {claimConfig.stages.find(stage => stage.id === activeTab)?.documents && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4">Required Documents</h4>
                
                {claimConfig.stages.find(stage => stage.id === activeTab)?.documents?.map(doc => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center mb-1">
                          <h5 className="font-medium">{doc.type}</h5>
                          {doc.mandatory && (
                            <span className="ml-1 text-red-500 text-lg">*</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Format: {doc.format} (Max: {doc.maxSize}MB)</p>
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
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button 
                variant="outline" 
                onClick={handleSaveForLater}
                className="border-gray-300 text-gray-700"
              >
                Save for Later
              </Button>
              <Button 
                onClick={handleContinue}
                className="bg-claims-blue hover:bg-claims-blue-dark"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimDetails;
