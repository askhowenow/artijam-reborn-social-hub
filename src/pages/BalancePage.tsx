
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, CreditCard, ArrowDown, ArrowUp, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Type definitions
interface Balance {
  id: string;
  balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  reference_id: string | null;
  gateway: string | null;
  gateway_reference: string | null;
  metadata: any | null;
  description: string | null;
  created_at: string;
}

interface TransactionsPagination {
  total: number;
  limit: number;
  offset: number;
}

const BalancePage: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionType, setTransactionType] = useState<string>("all");

  // Fetch user balance
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ["user-balance"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-balance");
      if (error) throw error;
      return data.balance as Balance;
    },
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: isTransactionsLoading, refetch: refetchTransactions } = useQuery({
    queryKey: ["user-transactions", transactionType],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-transactions", {
        body: { limit: 10, offset: 0, type: transactionType !== "all" ? transactionType : undefined },
      });
      if (error) throw error;
      return {
        transactions: data.transactions as Transaction[],
        pagination: data.pagination as TransactionsPagination,
      };
    },
  });

  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      const amountInCents = Math.round(parseFloat(amount) * 100);
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: {
          amount: amountInCents,
          currency: "USD",
          description: "Add funds to balance",
          gateway: "first_atlantic",
        },
      });

      if (error) throw error;

      if (data.redirectUrl) {
        // Redirect to FAC payment page
        window.location.href = data.redirectUrl;
      } else if (data.status === "success") {
        toast.success("Funds added successfully");
        refetchBalance();
        refetchTransactions();
        setAmount("");
      } else {
        throw new Error("Payment initiation failed");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("Failed to add funds. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    refetchBalance();
    refetchTransactions();
    toast.success("Balance and transactions refreshed");
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Helmet>
        <title>Balance | Artijam</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Balance</h1>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Current Balance</CardTitle>
            <CardDescription>Your available funds</CardDescription>
          </CardHeader>
          <CardContent>
            {isBalanceLoading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-artijam-purple border-t-transparent"></div>
              </div>
            ) : (
              <div className="text-4xl font-bold text-center py-4">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: balanceData?.currency || "USD",
                }).format(balanceData?.balance || 0)}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-xs text-gray-500">
              Last updated: {balanceData ? format(new Date(balanceData.updated_at), "PPpp") : "N/A"}
            </p>
          </CardFooter>
        </Card>

        {/* Add Funds Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Add Funds</CardTitle>
            <CardDescription>Top up your balance with First Atlantic Commerce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="flex mt-1.5">
                  <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-500">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum: $1.00</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAddFunds} 
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="w-full bg-artijam-purple hover:bg-artijam-purple/90"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Funds
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Transactions History */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity on your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setTransactionType(value)}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="deposit" className="flex-1">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal" className="flex-1">Withdrawals</TabsTrigger>
              <TabsTrigger value="purchase" className="flex-1">Purchases</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderTransactionsList(isTransactionsLoading, transactionsData?.transactions || [])}
            </TabsContent>
            <TabsContent value="deposit">
              {renderTransactionsList(isTransactionsLoading, transactionsData?.transactions || [])}
            </TabsContent>
            <TabsContent value="withdrawal">
              {renderTransactionsList(isTransactionsLoading, transactionsData?.transactions || [])}
            </TabsContent>
            <TabsContent value="purchase">
              {renderTransactionsList(isTransactionsLoading, transactionsData?.transactions || [])}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to render transactions list
const renderTransactionsList = (isLoading: boolean, transactions: Transaction[]) => {
  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-artijam-purple border-t-transparent"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md bg-gray-50">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-4 ${getTransactionIconClass(transaction.type)}`}>
              {transaction.type === "deposit" ? (
                <ArrowDown className="h-4 w-4" />
              ) : transaction.type === "withdrawal" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium">{getTransactionTitle(transaction.type)}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(transaction.created_at), "MMM d, yyyy • HH:mm")}
              </p>
              {transaction.description && (
                <p className="text-xs text-gray-400 mt-1">{transaction.description}</p>
              )}
            </div>
          </div>
          <div className={`font-semibold ${getTransactionAmountClass(transaction.type)}`}>
            {getTransactionAmountPrefix(transaction.type)}
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: transaction.currency,
            }).format(Math.abs(transaction.amount))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper functions for transaction formatting
const getTransactionIconClass = (type: string): string => {
  switch (type) {
    case "deposit":
      return "bg-green-100 text-green-600";
    case "withdrawal":
      return "bg-red-100 text-red-600";
    case "purchase":
      return "bg-blue-100 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getTransactionTitle = (type: string): string => {
  switch (type) {
    case "deposit":
      return "Deposit";
    case "withdrawal":
      return "Withdrawal";
    case "purchase":
      return "Purchase";
    default:
      return "Transaction";
  }
};

const getTransactionAmountClass = (type: string): string => {
  switch (type) {
    case "deposit":
      return "text-green-600";
    case "withdrawal":
    case "purchase":
      return "text-red-600";
    default:
      return "";
  }
};

const getTransactionAmountPrefix = (type: string): string => {
  switch (type) {
    case "deposit":
      return "+";
    case "withdrawal":
    case "purchase":
      return "-";
    default:
      return "";
  }
};

export default BalancePage;
