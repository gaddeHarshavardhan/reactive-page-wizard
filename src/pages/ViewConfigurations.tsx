
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  configuration: Stage[];
}

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
        setConfigurations(data);
        
        // Set first stage as active tab if configurations exist
        if (data.length > 0 && data[0].configuration.length > 0) {
          setActiveTab(data[0].configuration[0].stageName);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">View Configurations</h1>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading configurations...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : configurations.length === 0 ? (
          <div className="text-center py-10">No configurations found.</div>
        ) : (
          <div className="grid gap-4">
            {configurations.map((config) => (
              <Card key={config.id} className="w-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>
                    {config.categoryName} - {config.serviceName}
                  </CardTitle>
                  <Button onClick={() => handleViewConfig(config)} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View Configuration
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Configuration ID: {config.id} • {config.configuration.length} stages
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedConfig ? `${selectedConfig.categoryName} - ${selectedConfig.serviceName} Configuration` : 'Configuration Details'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedConfig && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${selectedConfig.configuration.length}, 1fr)` }}>
                  {selectedConfig.configuration.map((stage) => (
                    <TabsTrigger key={stage.stageName} value={stage.stageName}>
                      {stage.stageName}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {selectedConfig.configuration.map((stage) => (
                  <TabsContent key={stage.stageName} value={stage.stageName} className="space-y-6">
                    {/* Fields Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Fields</h3>
                      {stage.fields.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Mandatory</TableHead>
                              <TableHead>Options</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stage.fields.map((field, index) => (
                              <TableRow key={index}>
                                <TableCell>{field.name}</TableCell>
                                <TableCell>{field.type}</TableCell>
                                <TableCell>{field.mandatory ? 'Yes' : 'No'}</TableCell>
                                <TableCell>
                                  {field.options ? field.options.join(', ') : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-gray-500">No fields configured for this stage.</p>
                      )}
                    </div>

                    {/* Documents Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Documents</h3>
                      {stage.documents.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Mandatory</TableHead>
                              <TableHead>Allowed Formats</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stage.documents.map((doc, index) => (
                              <TableRow key={index}>
                                <TableCell>{doc.name}</TableCell>
                                <TableCell>{doc.mandatory === "true" ? 'Yes' : 'No'}</TableCell>
                                <TableCell>{doc.allowedFormat.join(', ')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-gray-500">No documents required for this stage.</p>
                      )}
                    </div>

                    {/* Actions Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">Actions</h3>
                      {stage.actions.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Option</TableHead>
                              <TableHead>Next Stage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stage.actions.map((action, index) => (
                              <TableRow key={index}>
                                <TableCell>{action.option}</TableCell>
                                <TableCell>{action.stage}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-gray-500">No actions configured for this stage.</p>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ViewConfigurations;
