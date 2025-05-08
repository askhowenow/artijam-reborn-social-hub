
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WalletPage: React.FC = () => {
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
            <p className="text-3xl font-bold">$0.00</p>
            <p className="text-sm text-gray-500 mt-1">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-24">
            <p className="text-gray-500">No transactions yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WalletPage;
