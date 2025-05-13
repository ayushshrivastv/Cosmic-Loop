"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Create simple table components
const Table = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="relative w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`} {...props} />
  </div>
);

const TableHeader = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...props} />;
const TableBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />;
const TableRow = ({ className = '', ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={`border-b border-gray-800 hover:bg-[#1a1a1a] ${className}`} {...props} />
);
const TableHead = ({ className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={`h-10 px-2 text-left align-middle font-medium text-gray-400 ${className}`} {...props} />
);
const TableCell = ({ className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={`p-2 align-middle ${className}`} {...props} />
);

// Create simple Select components
const Select = ({ value, onValueChange, children }: { value: string, onValueChange: (value: string) => void, children: React.ReactNode }) => (
  <div className="relative">
    {children}
  </div>
);

const SelectTrigger = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <button className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-700 bg-[#121212] px-3 py-2 text-sm ${className}`}>
    {children}
    v
  </button>
);

const SelectValue = ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>;

const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-700 bg-[#121212] shadow-md animate-in fade-in-80 mt-1 w-full">
    <div className="p-1">{children}</div>
  </div>
);

const SelectGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => (
  <div 
    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-[#1a1a1a]" 
    data-value={value}
  >
    {children}
  </div>
);

// Create simple Badge component
const Badge = ({ className = '', children }: { className?: string, children: React.ReactNode }) => (
  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </div>
);
import { Search, Filter } from 'lucide-react';

// Types for recipient data
interface Recipient {
  id: string;
  walletAddress: string;
  name: string | null;
  email: string | null;
  eventName: string;
  claimDate: string;
  status: 'claimed' | 'pending' | 'failed';
}

export function RecipientList() {
  // Always call hooks unconditionally first
  const wallet = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');

  // Mark when component is client-side rendered
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Extract wallet properties safely after determining client-side
  const publicKey = isClient ? wallet.publicKey : null;
  const connected = isClient ? wallet.connected : false;

  // Fetch recipient data when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchRecipients();
    }
  }, [connected, publicKey]);

  // Function to fetch recipient list
  const fetchRecipients = async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch actual data from the blockchain
      // For now, we'll return an empty array to indicate no recipients yet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set an empty recipients array
      // In a real implementation, this would be populated with actual recipient data
      setRecipients([]);
    } catch (error) {
      console.error("Error fetching recipients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format wallet address for display (truncate middle)
  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filter recipients based on search term and event filter
  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch = 
      searchTerm === '' || 
      recipient.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipient.name && recipient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (recipient.email && recipient.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesEvent = 
      eventFilter === 'all' || 
      recipient.eventName === eventFilter;
    
    return matchesSearch && matchesEvent;
  });

  // Get unique event names for the filter
  const eventNames = [...new Set(recipients.map(r => r.eventName))];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Token Recipients</h2>
        <Button 
          onClick={fetchRecipients} 
          disabled={isLoading || !connected}
          className="bg-white text-black hover:bg-gray-200 transition-colors"
          size="sm"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {!connected ? (
        <div className="bg-[#121212] rounded-lg p-8 flex items-center justify-center min-h-[200px] border border-dashed border-gray-800">
          <p className="text-gray-400 text-center">Connect your wallet to view token recipients</p>
        </div>
      ) : isLoading ? (
        <div className="bg-[#121212] rounded-lg p-8 flex items-center justify-center min-h-[200px] border border-dashed border-gray-800">
          <div className="flex items-center">
            
            <p className="text-gray-400">Loading recipients...</p>
          </div>
        </div>
      ) : recipients.length > 0 ? (
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by wallet, name or email"
                className="pl-9 bg-[#121212] border-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-56 flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger className="bg-[#121212] border-gray-800">
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Events</SelectItem>
                    {eventNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#121212] hover:bg-[#1a1a1a]">
                    <TableHead className="w-[180px]">Wallet</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Claimed</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecipients.map((recipient) => (
                    <TableRow key={recipient.id} className="bg-[#121212] hover:bg-[#1a1a1a]">
                      <TableCell className="font-mono text-xs">
                        {formatWalletAddress(recipient.walletAddress)}
                      </TableCell>
                      <TableCell>
                        {recipient.name ? (
                          <div>
                            <div className="font-medium">{recipient.name}</div>
                            {recipient.email && (
                              <div className="text-sm text-gray-400">{recipient.email}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </TableCell>
                      <TableCell>{recipient.eventName}</TableCell>
                      <TableCell>{formatDate(recipient.claimDate)}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={
                            recipient.status === 'claimed'
                              ? 'bg-green-900/20 text-green-400 hover:bg-green-900/20'
                              : recipient.status === 'pending'
                              ? 'bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/20'
                              : 'bg-red-900/20 text-red-400 hover:bg-red-900/20'
                          }
                        >
                          {recipient.status === 'claimed'
                            ? 'Claimed'
                            : recipient.status === 'pending'
                            ? 'Pending'
                            : 'Failed'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-400">
            Showing {filteredRecipients.length} of {recipients.length} recipients
          </div>
        </div>
      ) : (
        <div className="bg-[#121212] rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] border border-dashed border-gray-800">
          <p className="text-gray-400 text-center mb-4">No recipients found</p>
          <Button 
            onClick={fetchRecipients}
            className="bg-white text-black hover:bg-gray-200 transition-colors"
            size="sm"
          >
            Refresh Recipients
          </Button>
        </div>
      )}
    </div>
  );
}
