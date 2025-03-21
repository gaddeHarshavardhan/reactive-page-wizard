
import React from 'react';
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
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { CircleCheck, Circle, Clock, Check, ArrowRight } from 'lucide-react';

interface ClaimDetailsProps {
  claimData: {
    claimType: string;
    customerId: string;
    productId: string;
    stageData: {
      [key: string]: any;
    }
  }
}

const formatStageKey = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ClaimDetails: React.FC<ClaimDetailsProps> = ({ claimData }) => {
  const stages = Object.keys(claimData.stageData);
  
  // Determine the current stage based on the available data
  // For this example, we'll assume the last stage with data is the current one
  const currentStageIndex = stages.length - 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Claim Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{claimData.claimType}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Customer ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{claimData.customerId}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Product ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{claimData.productId}</p>
          </CardContent>
        </Card>
      </div>

      {/* Claim Progress Timeline */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Claim Progress</h3>
        <div className="flex items-center">
          {stages.map((stage, index) => (
            <React.Fragment key={stage}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStageIndex 
                    ? 'bg-green-100 text-green-600' 
                    : index === currentStageIndex 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStageIndex ? (
                    <Check className="w-5 h-5" />
                  ) : index === currentStageIndex ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center">{formatStageKey(stage)}</span>
              </div>
              
              {index < stages.length - 1 && (
                <div className={`h-[2px] flex-1 mx-2 ${
                  index < currentStageIndex ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stage Details */}
      <Tabs defaultValue={stages[0]} className="w-full">
        <TabsList className="mb-4">
          {stages.map(stage => (
            <TabsTrigger key={stage} value={stage}>
              {formatStageKey(stage)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {stages.map(stage => (
          <TabsContent key={stage} value={stage} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{formatStageKey(stage)}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Field</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(claimData.stageData[stage]).map(([field, value]) => (
                      <TableRow key={field}>
                        <TableCell className="font-medium">
                          {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </TableCell>
                        <TableCell>{value as string}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ClaimDetails;
