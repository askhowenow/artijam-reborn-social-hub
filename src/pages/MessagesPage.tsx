
import React from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MessagesPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Helmet>
        <title>Messages | Artijam</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The Messaging feature is currently under development and will be available soon.
        </AlertDescription>
      </Alert>
      
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Connect Through Private Messages</h2>
        <p className="text-gray-600 mb-4">
          Communicate directly with other artists, vendors, and customers.
        </p>
      </div>
    </div>
  );
};

export default MessagesPage;
