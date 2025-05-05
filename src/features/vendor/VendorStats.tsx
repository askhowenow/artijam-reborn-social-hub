
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const VendorStats = () => {
  // This is a placeholder component that will be implemented later
  // when we add analytics functionality
  
  return (
    <Card className="bg-white rounded-md shadow">
      <CardHeader>
        <CardTitle>Analytics Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="p-10 text-center">
        <p className="text-gray-500">
          Detailed analytics will be available here once your store has some activity.
        </p>
      </CardContent>
    </Card>
  );
};

export default VendorStats;
