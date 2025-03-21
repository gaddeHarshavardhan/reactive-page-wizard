
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import ClaimDetails from '@/components/ClaimDetails';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ClaimResult {
  id: string;
  referenceNumber: string;
  status: string;
  dateSubmitted: string;
  claimType: string;
  customerId?: string;
  productId?: string;
}

interface ClaimDetailsData {
  claimType: string;
  customerId?: string;
  productId?: string;
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

const ViewClaims = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ClaimResult[] | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);
  const [claimDetails, setClaimDetails] = useState<ClaimDetailsData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a reference number to search');
      return;
    }

    setIsSearching(true);
    
    try {
      // Call the API to get claim details
      const response = await fetch(`http://localhost:8081/api/claims/${searchQuery}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch claim with reference number ${searchQuery}`);
      }
      
      const claimData = await response.json();
      
      // Create search result from API response
      const mockResults: ClaimResult[] = [{
        id: "1",
        referenceNumber: searchQuery,
        status: claimData.status || "In Progress",
        dateSubmitted: claimData.createdDate.split('T')[0] || new Date().toISOString().split('T')[0],
        claimType: claimData.claimType
      }];

      setSearchResults(mockResults);
      setClaimDetails(claimData); // Store the claim details
      
      if (mockResults.length === 0) {
        toast.info('No claims found with that reference number');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for claims. Please try again.');
      
      // Fallback for testing
      if (searchQuery === "12345") {
        // Mock data for testing only
        const mockData: ClaimDetailsData = {
          claimType: "Mobile Protection",
          customerId: "CUST123456",
          productId: "PROD789012",
          srId: "SR123456",
          customerName: "John Smith",
          deviceMake: "Apple",
          dateCreated: "2023-09-15",
          status: "In Progress",
          contact: "+1 (555) 123-4567",
          currentStage: "Document Upload",
          stageData: {
            "Document Upload": {
              dateOfIncident: "2023-09-10"
            }
          }
        };
        
        const mockResults: ClaimResult[] = [{
          id: "1",
          referenceNumber: searchQuery,
          status: "In Progress",
          dateSubmitted: "2023-09-15",
          claimType: mockData.claimType,
          customerId: mockData.customerId,
          productId: mockData.productId
        }];
        
        setSearchResults(mockResults);
        setClaimDetails(mockData);
      } else {
        setSearchResults([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewDetails = async (referenceNumber: string) => {
    // Since we already have the claim details from the search, we can just display them
    if (claimDetails) {
      setSelectedClaim(referenceNumber);
      setIsDetailsOpen(true);
    } else {
      try {
        setIsSearching(true);
        
        // Call the API with the reference number
        const response = await fetch(`http://localhost:8081/api/claims/${referenceNumber}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch claim details');
        }
        
        const data = await response.json();
        setClaimDetails(data);
        setSelectedClaim(referenceNumber);
        setIsDetailsOpen(true);
      } catch (error) {
        console.error('Error fetching claim details:', error);
        toast.error('Failed to load claim details. Please try again.');
        
        // For demo purposes, set mock data if API fails
        if (referenceNumber === '12345') {
          const mockData: ClaimDetailsData = {
            claimType: "Mobile Protection",
            customerId: "CUST123456",
            productId: "PROD789012",
            srId: "SR123456",
            customerName: "John Smith",
            deviceMake: "Apple",
            dateCreated: "2023-09-15",
            status: "In Progress",
            contact: "+1 (555) 123-4567",
            currentStage: "Document Upload",
            stageData: {
              "Document Upload": {
                dateOfIncident: "2023-09-10"
              }
            }
          };
          setClaimDetails(mockData);
          setSelectedClaim(referenceNumber);
          setIsDetailsOpen(true);
        }
      } finally {
        setIsSearching(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-400 py-5 px-8 text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-medium animate-fade-in">Claims Search</h1>
            <div className="text-lg animate-fade-in">Find and view submitted claims</div>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-grow px-4 py-8">
        <main className="max-w-7xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8 animate-fade-in-up hover:shadow-md transition-shadow">
            <h2 className="text-xl font-medium mb-6 text-blue-700">Search Claims</h2>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  SR No
                </label>
                <Input
                  id="referenceNumber"
                  type="text"
                  placeholder="Enter claim number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 w-full md:w-auto transition-all"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                  {!isSearching && <Search className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>Enter SR number to find a specific claim.</p>
            </div>
          </div>

          {searchResults !== null && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 animate-fade-in-up mb-8 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-medium mb-6 text-blue-700">Search Results</h2>
              
              {searchResults.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left rounded-lg">
                        <th className="p-4 font-medium text-gray-700">SR No</th>
                        <th className="p-4 font-medium text-gray-700">Status</th>
                        <th className="p-4 font-medium text-gray-700">Date Submitted</th>
                        <th className="p-4 font-medium text-gray-700">Claim Type</th>
                        <th className="p-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map(claim => (
                        <tr key={claim.id} className="border-t border-gray-200 hover:bg-blue-50 transition-colors">
                          <td className="p-4 font-medium">{claim.referenceNumber}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shadow-sm">
                              {claim.status}
                            </span>
                          </td>
                          <td className="p-4">{claim.dateSubmitted}</td>
                          <td className="p-4">{claim.claimType}</td>
                          <td className="p-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(claim.referenceNumber)}
                              disabled={isSearching}
                              className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No claims found matching your search criteria.</p>
                  <p className="mt-2">Try searching with a different reference number.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </ScrollArea>

      {/* Claim Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-blue-700">Claim Details - {selectedClaim}</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {claimDetails && (
                <ClaimDetails claimData={claimDetails} />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewClaims;
