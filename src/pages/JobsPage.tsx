
import React from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const JobsPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Helmet>
        <title>Jobs | Artijam</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The Jobs feature is currently under development and will be available soon.
        </AlertDescription>
      </Alert>
      
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Find Creative Opportunities</h2>
        <p className="text-gray-600 mb-4">
          Discover job opportunities in art, design, crafts, and more to showcase your talents.
        </p>
      </div>
    </div>
  );
};

export default JobsPage;
