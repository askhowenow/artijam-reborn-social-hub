
import React from "react";
import { Helmet } from "react-helmet-async";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CoursesPage = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Helmet>
        <title>Courses | Artijam</title>
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          The Courses feature is currently under development and will be available soon.
        </AlertDescription>
      </Alert>
      
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Learn and Teach</h2>
        <p className="text-gray-600 mb-4">
          Access educational content or create your own courses to share your expertise.
        </p>
      </div>
    </div>
  );
};

export default CoursesPage;
