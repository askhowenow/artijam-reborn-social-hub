
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const SettingsPage: React.FC = () => {
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

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
    </div>
  );
};

export default SettingsPage;
