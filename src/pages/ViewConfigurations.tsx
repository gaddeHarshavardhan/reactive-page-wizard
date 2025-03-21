
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Eye, Edit, FileText, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Field {
  name: string;
  type: string;
  mandatory: boolean;
  validation: string;
  options: string[] | null;
}

interface Document {
  name: string;
  mandatory: string;
  allowedFormat: string[];
}

interface Action {
  option: string;
  stage: string;
}

interface Stage {
  stageName: string;
  fields: Field[];
  documents: Document[];
  actions: Action[];
}

interface Configuration {
  id: number;
  categoryName: string;
  serviceName: string;
  categoryValue?: string;
  serviceValue?: string;
  configuration: Stage[];
  // Add the display properties
  categoryDisplay?: string;
  serviceDisplay?: string;
}

// Category and service mapping for displaying friendly names
const categoryMap: Record<string, string> = {
  'PE': 'Personal Electronics',
  'HA': 'Home Appliances',
  'Motor': 'Motor',
  'Furniture': 'Furniture'
};

const serviceMap: Record<string, string> = {
  'ADLD': 'Accidental Damage',
  'EW': 'Extended Warranty',
  'PMS': 'Preventive Maintenance',
  'AD': 'Accidental Damage'
};

const ViewConfigurations = () => {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        setLoading(true);
        // In a real implementation, replace this URL with your actual API endpoint
        const response = await fetch('http://localhost:8081/api/configs');
        
        if (!response.ok) {
          throw new Error('Failed to fetch configurations');
        }
        
        const data = await response.json();
        
        // Add display values for categories and services
        const enhancedData = data.map((config: Configuration) => ({
          ...config,
          categoryDisplay: categoryMap[config.categoryName] || config.categoryName,
          serviceDisplay: serviceMap[config.serviceName] || config.serviceName
        }));
        
        setConfigurations(enhancedData);
        
        // Set first stage as active tab if configurations exist
        if (enhancedData.length > 0 && enhancedData[0].configuration.length > 0) {
          setActiveTab(enhancedData[0].configuration[0].stageName);
        }
      } catch (err) {
        console.error('Error fetching configurations:', err);
        setError('Failed to load configurations. Please try again later.');
        toast.error('Failed to load configurations');
      } finally {
        setLoading(false);
      }
    };

    fetchConfigurations();
  }, []);

  const handleViewConfig = (config: Configuration) => {
    setSelectedConfig(config);
    if (config.configuration.length > 0) {
      setActiveTab(config.configuration[0].stageName);
    }
    setOpenDialog(true);
  };
  
  const handleEditConfig = (config: Configuration) => {
    // Store the configuration in localStorage to be loaded by the editor
    localStorage.setItem('editConfig', JSON.stringify(config));
    navigate('/config');
    toast.success('Configuration loaded for editing');
  };

  // Function to count stages, fields, and documents for a configuration
  const getCounts = (config: Configuration) => {
    const stageCount = config.configuration.length;
    
    let fieldCount = 0;
    let documentCount = 0;
    
    config.configuration.forEach(stage => {
      fieldCount += stage.fields.length;
      documentCount += stage.documents.length;
    });
    
    return { stageCount, fieldCount, documentCount };
  };

  // Get the appropriate status badge style based on stages and fields
  const getStatusBadge = (config: Configuration) => {
    const { stageCount, fieldCount } = getCounts(config);
    
    if (stageCount > 2 && fieldCount > 5) {
      return <Badge className="bg-amber-500">In Progress</Badge>;
    } else if (stageCount > 0) {
      return <Badge className="bg-amber-500">In Progress</Badge>;
    } else {
      return <Badge className="bg-gray-400">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">Configuration Manager</h1>
            <p className="text-gray-500 mt-1">View and manage your claim configurations</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>
            <p className="text-gray-500 mt-4">Loading configurations...</p>
          </div>
        ) : error ? (
          <div className="bg-white shadow rounded-lg p-8 text-center text-red-500">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : configurations.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-700">No configurations found</p>
            <p className="text-gray-500 mt-1">Get started by creating your first claim configuration</p>
            <Button className="mt-4" onClick={() => navigate('/config')}>
              Create Configuration
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {configurations.map((config) => {
              const { stageCount, fieldCount, documentCount } = getCounts(config);
              
              return (
                <Card key={config.id} className="overflow-hidden transition-all hover:shadow-md border border-gray-200">
                  <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold">{config.categoryDisplay} - {config.serviceDisplay}</CardTitle>
                        <CardDescription>ID: {config.id}</CardDescription>
                      </div>
                      {getStatusBadge(config)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                        <Layers className="h-4 w-4 text-blue-500 mb-1" />
                        <span className="font-medium">{stageCount}</span>
                        <span className="text-xs text-gray-500">Stages</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                        <FileText className="h-4 w-4 text-indigo-500 mb-1" />
                        <span className="font-medium">{fieldCount}</span>
                        <span className="text-xs text-gray-500">Fields</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                        <FileText className="h-4 w-4 text-purple-500 mb-1" />
                        <span className="font-medium">{documentCount}</span>
                        <span className="text-xs text-gray-500">Documents</span>
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 mr-2"
                        onClick={() => handleViewConfig(config)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 ml-2 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        onClick={() => handleEditConfig(config)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedConfig ? (
                  <span>
                    {selectedConfig.categoryDisplay} - {selectedConfig.serviceDisplay}
                  </span>
                ) : 'Configuration Details'}
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">ID: {selectedConfig?.id}</Badge>
              </DialogTitle>
            </DialogHeader>
            
            {selectedConfig && (
              <div className="mt-4">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p>{selectedConfig.categoryDisplay}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Service</h3>
                    <p>{selectedConfig.serviceDisplay}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Stages</h3>
                    <p>{selectedConfig.configuration.length}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700" 
                    onClick={() => {
                      handleEditConfig(selectedConfig);
                      setOpenDialog(false);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit Configuration
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="mb-4 flex flex-wrap bg-gray-100 p-1">
                    {selectedConfig.configuration.map((stage) => (
                      <TabsTrigger key={stage.stageName} value={stage.stageName} className="data-[state=active]:bg-white">
                        {stage.stageName}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {selectedConfig.configuration.map((stage) => (
                    <TabsContent key={stage.stageName} value={stage.stageName} className="space-y-6 border-none p-0">
                      {/* Fields Section */}
                      <div className="rounded-md border">
                        <div className="bg-gray-50 p-3 font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          Form Fields
                          <Badge className="ml-2 bg-blue-100 text-blue-800">{stage.fields.length}</Badge>
                        </div>
                        {stage.fields.length > 0 ? (
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Mandatory</TableHead>
                                <TableHead>Options</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stage.fields.map((field, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{field.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {field.type}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {field.mandatory ? (
                                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Yes</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-500">No</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {field.options && field.options.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {field.options.map((option, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {option}
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="p-4 text-center text-gray-500">No fields configured for this stage.</div>
                        )}
                      </div>

                      {/* Documents Section */}
                      <div className="rounded-md border">
                        <div className="bg-gray-50 p-3 font-medium flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-purple-500" />
                          Required Documents
                          <Badge className="ml-2 bg-purple-100 text-purple-800">{stage.documents.length}</Badge>
                        </div>
                        {stage.documents.length > 0 ? (
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead>Document</TableHead>
                                <TableHead>Mandatory</TableHead>
                                <TableHead>Allowed Formats</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stage.documents.map((doc, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="font-medium">{doc.name}</TableCell>
                                  <TableCell>
                                    {doc.mandatory === "true" ? (
                                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Yes</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-500">No</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {doc.allowedFormat.map((format, i) => (
                                        <Badge key={i} variant="outline" className="text-xs capitalize">
                                          {format.toLowerCase()}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="p-4 text-center text-gray-500">No documents required for this stage.</div>
                        )}
                      </div>

                      {/* Actions Section */}
                      <div className="rounded-md border">
                        <div className="bg-gray-50 p-3 font-medium flex items-center">
                          <Layers className="h-4 w-4 mr-2 text-amber-500" />
                          Stage Actions
                          <Badge className="ml-2 bg-amber-100 text-amber-800">{stage.actions.length}</Badge>
                        </div>
                        {stage.actions.length > 0 ? (
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead>Option</TableHead>
                                <TableHead>Next Stage</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {stage.actions.map((action, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="font-medium capitalize">{action.option}</TableCell>
                                  <TableCell>
                                    {action.stage ? (
                                      <Badge className="bg-blue-100 text-blue-800">{action.stage}</Badge>
                                    ) : (
                                      <Badge variant="outline" className="text-gray-500">End of Flow</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="p-4 text-center text-gray-500">No actions configured for this stage.</div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ViewConfigurations;
