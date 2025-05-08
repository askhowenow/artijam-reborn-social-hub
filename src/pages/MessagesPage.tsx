
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const MessagesPage: React.FC = () => {
  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-gray-600 mt-1">Your conversations with other users</p>
      </div>

      <div className="grid gap-6">
        <Card className="bg-gray-50 dark:bg-gray-800 border border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 p-6">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
              When you start conversations with other users, they will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
