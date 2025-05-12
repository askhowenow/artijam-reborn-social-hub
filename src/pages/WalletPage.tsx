
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBalance } from "@/hooks/use-balance";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthProvider";

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    balance, 
    isLoadingBalance, 
    balanceError, 
    topUpBalance, 
    isProcessingTopUp,
    transactionsQuery 
  } = useBalance();
  
  const { data: transactionsData, isLoading: isLoadingTransactions } = transactionsQuery({ limit: 5 });
  
  const [amount, setAmount] = useState<number>(10);

  const handleTopUp = () => {
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    topUpBalance({
      amount,
      currency: balance?.currency || 'USD',
      paymentDetails: {
        // In a real app, we would collect these details properly
        cardholderName: 'Test User',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123'
      }
    });
  };

  if (!user) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <p>Please login to view your wallet.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-gray-600 mt-1">Manage your funds and transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Loading balance...</p>
              </div>
            ) : balanceError ? (
              <p className="text-red-500">Error loading balance</p>
            ) : (
              <>
                <p className="text-3xl font-bold">
                  {balance?.currency || '$'}{balance?.balance.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Available funds</p>
                
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={1}
                      className="max-w-[120px]"
                    />
                    <Button 
                      onClick={handleTopUp}
                      disabled={isProcessingTopUp}
                    >
                      {isProcessingTopUp && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Top Up
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    This is a test system. No real payments will be made.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <p>Loading transactions...</p>
              </div>
            ) : !transactionsData?.transactions?.length ? (
              <div className="flex flex-col items-center justify-center h-24">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactionsData.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium capitalize">{transaction.type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className={`font-medium ${transaction.type === 'top_up' ? 'text-green-600' : ''}`}>
                      {transaction.type === 'top_up' ? '+' : '-'}{transaction.currency}{transaction.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
