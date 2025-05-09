
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, 
  PlusCircle, 
  CreditCard, 
  Clock, 
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar
} from "lucide-react";
import { useAuth } from '@/context/AuthProvider';
import { useBalance, type Transaction } from '@/hooks/use-balance';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

const topUpFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  cardNumber: z.string().min(16, "Card number must be at least 16 digits"),
  cardholderName: z.string().min(3, "Cardholder name is required"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Expiry date must be in MM/YY format"),
  cvv: z.string().min(3, "CVV must be at least 3 digits"),
});

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Helper function to format transaction type
const formatTransactionType = (type: string) => {
  switch (type) {
    case 'top_up':
      return 'Top-up';
    case 'payment':
      return 'Payment';
    case 'refund':
      return 'Refund';
    case 'withdrawal':
      return 'Withdrawal';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

// Transaction status badge component
const TransactionStatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
      </Badge>;
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>;
    case 'failed':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" /> Failed
      </Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Transaction type icon component
const TransactionTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'top_up':
      return <ArrowDownCircle className="w-4 h-4 text-green-500" />;
    case 'payment':
      return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
    case 'refund':
      return <RefreshCw className="w-4 h-4 text-blue-500" />;
    case 'withdrawal':
      return <ArrowUpCircle className="w-4 h-4 text-orange-500" />;
    default:
      return null;
  }
};

// Transaction item component
const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
          <TransactionTypeIcon type={transaction.type} />
        </div>
        <div>
          <p className="font-medium">{formatTransactionType(transaction.type)}</p>
          <p className="text-sm text-gray-500">
            {format(new Date(transaction.created_at), 'MMM d, yyyy • HH:mm')}
          </p>
          {transaction.reference_id && (
            <p className="text-xs text-gray-400">Ref: {transaction.reference_id}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "font-semibold",
          transaction.type === 'top_up' || transaction.type === 'refund' 
            ? "text-green-600"
            : "text-red-600"
        )}>
          {transaction.type === 'top_up' || transaction.type === 'refund' ? '+' : '-'}
          {formatCurrency(transaction.amount, transaction.currency)}
        </p>
        <div className="mt-1">
          <TransactionStatusBadge status={transaction.status} />
        </div>
      </div>
    </div>
  );
};

// Top-up dialog component
const TopUpDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { topUpBalance, isProcessingTopUp } = useBalance();

  const form = useForm<z.infer<typeof topUpFormSchema>>({
    resolver: zodResolver(topUpFormSchema),
    defaultValues: {
      amount: 0,
      currency: "USD",
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  function onSubmit(values: z.infer<typeof topUpFormSchema>) {
    const { amount, currency, ...paymentDetails } = values;
    
    topUpBalance({
      amount,
      currency,
      paymentDetails
    }, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Top Up Balance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Your Balance</DialogTitle>
          <DialogDescription>
            Enter your payment details to top up your account balance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="pl-8" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="1234 5678 9012 3456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input placeholder="123" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-4" 
              disabled={isProcessingTopUp}
            >
              {isProcessingTopUp && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Top Up Balance
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const BalancePage: React.FC = () => {
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState<string | undefined>(undefined);
  const { 
    balance, 
    isLoadingBalance, 
    transactionsQuery 
  } = useBalance();
  
  const { 
    data: transactionsData,
    isLoading: isLoadingTransactions
  } = transactionsQuery({ type: transactionType });
  
  const transactions = transactionsData?.transactions || [];
  
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Balance</h1>
        <p className="text-gray-600 mt-1">Manage your funds and transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Available Balance</CardTitle>
              <CardDescription>Available funds in your account</CardDescription>
            </div>
            <div className="p-2 rounded-full bg-blue-50 text-blue-700">
              <Wallet className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Skeleton className="h-12 w-36" />
            ) : (
              <p className="text-4xl font-bold">
                {formatCurrency(balance?.balance || 0, balance?.currency)}
              </p>
            )}
            <div className="mt-4">
              <TopUpDialog />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center p-3 border rounded-md mb-3">
              <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="font-medium">First Atlantic Gateway</p>
                <p className="text-xs text-gray-500">The preferred payment provider</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Default</Badge>
            </div>
            
            <Button variant="outline" className="w-full mt-2">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Payment Methods
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View and filter your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="filter-transactions" className="mb-2 block">Filter by Type</Label>
              <Select
                value={transactionType || ''}
                onValueChange={(value) => setTransactionType(value === '' ? undefined : value)}
              >
                <SelectTrigger id="filter-transactions" className="w-full sm:w-auto">
                  <SelectValue placeholder="All Transactions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Transactions</SelectItem>
                  <SelectItem value="top_up">Top-ups</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            {isLoadingTransactions ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-40 mt-2" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-xl font-medium">No transactions yet</h3>
                <p className="mt-1 text-gray-500">
                  Your transaction history will appear here once you start using your balance.
                </p>
              </div>
            )}
            
            {transactions.length > 0 && transactionsData?.pagination.total && transactionsData.pagination.total > 10 && (
              <div className="flex justify-center mt-6">
                <Button variant="outline">Load More</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalancePage;
