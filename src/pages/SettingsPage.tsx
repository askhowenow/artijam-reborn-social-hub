
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider";
import { useUserRole } from "@/hooks/use-user-role";
import { usePaymentSettings } from "@/hooks/use-payment-settings";
import { 
  AlertCircle, 
  CreditCard, 
  Shield,
  CheckCircle, 
  XCircle,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Separator } from "@/components/ui/separator";

const paymentGatewayFormSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  merchantId: z.string().min(1, "Merchant ID is required"),
  secretKey: z.string().min(1, "Secret Key is required"),
  isTestMode: z.boolean().default(true),
  isActive: z.boolean().default(false),
});

type PaymentGatewayFormValues = z.infer<typeof paymentGatewayFormSchema>;

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading: isLoadingRole } = useUserRole();
  const [activeTab, setActiveTab] = useState("account");
  const {
    settings,
    isLoading: isLoadingSettings,
    updateSettings,
    isUpdating,
    getSettingsForGateway
  } = usePaymentSettings();

  // Get First Atlantic settings if they exist
  const firstAtlanticSettings = getSettingsForGateway('first_atlantic');

  // Initialize form with existing settings or defaults
  const form = useForm<PaymentGatewayFormValues>({
    resolver: zodResolver(paymentGatewayFormSchema),
    defaultValues: {
      apiKey: firstAtlanticSettings?.credentials?.apiKey || "",
      merchantId: firstAtlanticSettings?.credentials?.merchantId || "",
      secretKey: firstAtlanticSettings?.credentials?.secretKey || "",
      isTestMode: firstAtlanticSettings?.is_test_mode ?? true,
      isActive: firstAtlanticSettings?.is_active ?? false,
    },
  });

  // Test connection handler
  const handleTestConnection = () => {
    const values = form.getValues();
    
    // In a real implementation, we would test the connection to First Atlantic
    // For now, we'll simulate a successful test
    setTimeout(() => {
      toast({
        title: "Connection Successful",
        description: "Successfully connected to First Atlantic payment gateway",
      });
    }, 1500);
  };
  
  // Form submission handler
  function onSubmit(values: PaymentGatewayFormValues) {
    updateSettings({
      id: firstAtlanticSettings?.id,
      gateway_name: 'first_atlantic',
      is_active: values.isActive,
      is_test_mode: values.isTestMode,
      credentials: {
        apiKey: values.apiKey,
        merchantId: values.merchantId,
        secretKey: values.secretKey,
      }
    });
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          {!isLoadingRole && isAdmin() && (
            <TabsTrigger value="payment-gateways">Payment Gateways</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="block text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive email updates about your account</p>
                  </div>
                  <Switch id="notifications" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="marketing" className="block text-base font-medium">Marketing Emails</Label>
                    <p className="text-sm text-gray-500">Receive marketing updates and promotions</p>
                  </div>
                  <Switch id="marketing" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Manage your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="public-profile" className="block text-base font-medium">Public Profile</Label>
                    <p className="text-sm text-gray-500">Allow others to see your profile</p>
                  </div>
                  <Switch id="public-profile" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-activity" className="block text-base font-medium">Show Activity</Label>
                    <p className="text-sm text-gray-500">Show your activity to other users</p>
                  </div>
                  <Switch id="show-activity" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {!isLoadingRole && isAdmin() && (
          <TabsContent value="payment-gateways">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>First Atlantic Payment Gateway</CardTitle>
                  <CardDescription>Configure First Atlantic payment gateway settings</CardDescription>
                </div>
                <CreditCard className="h-6 w-6 text-blue-500" />
              </CardHeader>
              
              <CardContent>
                {isLoadingSettings ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <>
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Important Information</AlertTitle>
                      <AlertDescription>
                        These credentials are used to process payments through First Atlantic Gateway.
                        Ensure they are kept secure and are correct to avoid payment processing issues.
                      </AlertDescription>
                    </Alert>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter First Atlantic API Key" {...field} />
                              </FormControl>
                              <FormDescription>
                                The API key provided by First Atlantic
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="merchantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Merchant ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter Merchant ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                Your unique merchant identifier
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="secretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Secret Key</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password"
                                  placeholder="Enter Secret Key" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Your secret key for securing transactions
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Separator className="my-6" />
                        
                        <div className="flex flex-col space-y-4">
                          <FormField
                            control={form.control}
                            name="isTestMode"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Test Mode
                                  </FormLabel>
                                  <FormDescription>
                                    Use test environment for development
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Enable Gateway
                                  </FormLabel>
                                  <FormDescription>
                                    Allow payments through First Atlantic
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={handleTestConnection}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Test Connection
                          </Button>
                          <Button 
                            type="submit"
                            disabled={isUpdating}
                            className="flex-1"
                          >
                            {isUpdating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default SettingsPage;
