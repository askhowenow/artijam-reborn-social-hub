
import React from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PeoplePage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Helmet>
        <title>People | Artijam</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">People</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The People feature is currently under development and will be available soon.
        </AlertDescription>
      </Alert>
      
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Connect with Artists and Creators</h2>
        <p className="text-gray-600 mb-4">
          Discover talented individuals, follow their work, and build your creative network.
        </p>
      </div>
    </div>
  );
};

export default PeoplePage;
