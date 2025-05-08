
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const GroupsPage: React.FC = () => {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Groups</h1>
        <p className="text-gray-600 mt-1">Join and interact with community groups</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-gray-50 dark:bg-gray-800 border border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 p-6">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No groups available yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              Community groups will be available soon. You'll be able to join and create groups based on shared interests.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupsPage;
