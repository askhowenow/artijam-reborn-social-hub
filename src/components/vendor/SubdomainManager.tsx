
import React, { useState, useEffect } from "react";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { useVendorSubdomain } from "@/hooks/use-vendor-subdomain";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check, X, Loader2, Globe, Link } from "lucide-react";
import URLDisplay from "./URLDisplay";

interface SubdomainManagerProps {
  onUpdate?: () => void;
}

const SubdomainManager: React.FC<SubdomainManagerProps> = ({ onUpdate }) => {
  const { vendorProfile } = useVendorProfile();
  const { isChecking, isAvailable, checkSubdomainAvailability, updateSubdomain } = useVendorSubdomain(vendorProfile?.id);
  
  const [subdomain, setSubdomain] = useState("");
  const [usesSubdomain, setUsesSubdomain] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [subdomainUrl, setSubdomainUrl] = useState<string | null>(null);
  
  // Initialize state from vendor profile
  useEffect(() => {
    if (vendorProfile) {
      setSubdomain(vendorProfile.subdomain || "");
      setUsesSubdomain(vendorProfile.uses_subdomain || false);
      if (vendorProfile.subdomain) {
        setSubdomainUrl(`https://${vendorProfile.subdomain}.artijam.com`);
      }
    }
  }, [vendorProfile]);

  // Handle subdomain change
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(value);
    
    if (value.length >= 3) {
      checkSubdomainAvailability(value);
      setSubdomainUrl(`https://${value}.artijam.com`);
    } else {
      setSubdomainUrl(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subdomain && usesSubdomain) {
      toast.error("You need to set a subdomain to enable subdomain access");
      return;
    }

    if (subdomain && !isAvailable && subdomain !== vendorProfile?.subdomain) {
      toast.error("This subdomain is not available");
      return;
    }

    setIsSaving(true);
    
    try {
      await updateSubdomain.mutateAsync({
        subdomain,
        usesSubdomain
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating subdomain settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg">
          <Globe className="mr-2 h-5 w-5" /> Subdomain Settings
        </CardTitle>
        <CardDescription>
          Set up a custom subdomain for your store
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subdomain">
              Subdomain 
              {isChecking && (
                <span className="ml-2 text-sm text-gray-500">Checking...</span>
              )}
              {isAvailable === true && !isChecking && subdomain && (
                <span className="ml-2 text-sm text-green-500 flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Available
                </span>
              )}
              {isAvailable === false && !isChecking && subdomain && (
                <span className="ml-2 text-sm text-red-500 flex items-center">
                  <X className="h-4 w-4 mr-1" /> Not available
                </span>
              )}
            </Label>
            
            <div className="flex items-center">
              <span className="bg-gray-100 px-3 py-2 border border-r-0 rounded-l-md">
                https://
              </span>
              <Input
                id="subdomain"
                value={subdomain}
                onChange={handleSubdomainChange}
                placeholder="your-store"
                className="rounded-l-none rounded-r-none border-r-0"
              />
              <span className="bg-gray-100 px-3 py-2 border border-l-0 rounded-r-md">
                .artijam.com
              </span>
            </div>
            
            {subdomainUrl && (
              <p className="text-sm text-gray-500">
                Your store will be available at this URL when subdomain access is enabled
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="uses-subdomain"
              checked={usesSubdomain}
              onCheckedChange={setUsesSubdomain}
              disabled={!subdomain || isAvailable === false}
            />
            <Label htmlFor="uses-subdomain">Enable subdomain access</Label>
          </div>
          
          {vendorProfile?.store_slug && (
            <div className="pt-2">
              <Label htmlFor="path-url">Standard URL (Always available)</Label>
              <URLDisplay url={`https://artijam.com/@${vendorProfile.store_slug}`} />
            </div>
          )}
          
          {usesSubdomain && subdomain && (
            <div className="pt-2">
              <Label htmlFor="subdomain-url">Subdomain URL</Label>
              <URLDisplay url={subdomainUrl || ""} />
            </div>
          )}
          
          <div className="pt-4">
            <Button 
              type="submit"
              disabled={isSaving || (usesSubdomain && (!subdomain || isAvailable === false))}
              className="bg-artijam-purple hover:bg-artijam-purple/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Save URL Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubdomainManager;
