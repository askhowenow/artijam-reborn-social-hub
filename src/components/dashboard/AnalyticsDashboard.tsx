
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, DollarSign, TrendingUp, BarChart } from "lucide-react";
import { useVendorProfile } from "@/hooks/use-vendor-profile";
import { formatPrice } from "@/utils/string-utils";

// Define interfaces for analytics data
interface ProductAnalytics {
  id: string;
  name: string;
  price: number;
  purchase_price: number;
  currency: string;
  sold_count: number;
  profit: number;
  views: number;
  margin_percentage: number;
}

interface AnalyticsSummary {
  totalSales: number;
  totalProfit: number;
  averageMargin: number;
  topProducts: ProductAnalytics[];
}

const AnalyticsDashboard = () => {
  const { vendorProfile, isLoading: vendorLoading } = useVendorProfile();
  
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['vendorAnalytics', vendorProfile?.id],
    queryFn: async () => {
      // This is a placeholder for future implementation
      // In a real implementation, we would fetch sales and analytics data
      // from the database, based on actual orders and views
      
      // For now, return dummy data for UI demonstration
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error("Not authenticated");
      }
      
      // Get products with their metrics
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          purchase_price,
          currency,
          metrics:product_metrics(views, cart_adds, purchases)
        `)
        .eq('vendor_id', session.session.user.id);
        
      if (error) throw error;
      
      // Transform to analytics format with calculated fields
      const analyticsData: ProductAnalytics[] = products.map((product: any) => {
        const views = product.metrics?.[0]?.views || 0;
        const soldCount = product.metrics?.[0]?.purchases || 0;
        const profit = soldCount * (product.price - product.purchase_price);
        const marginPercentage = product.purchase_price > 0 
          ? ((product.price - product.purchase_price) / product.purchase_price) * 100
          : 0;
          
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          purchase_price: product.purchase_price,
          currency: product.currency || 'USD',
          sold_count: soldCount,
          profit,
          views,
          margin_percentage: marginPercentage
        };
      });
      
      // Calculate summary data
      const totalSales = analyticsData.reduce((sum, product) => 
        sum + (product.price * product.sold_count), 0);
        
      const totalProfit = analyticsData.reduce((sum, product) => 
        sum + product.profit, 0);
        
      const totalProducts = analyticsData.length;
      const averageMargin = totalProducts > 0
        ? analyticsData.reduce((sum, product) => sum + product.margin_percentage, 0) / totalProducts
        : 0;
      
      // Sort products by profit for top products
      const topProducts = [...analyticsData].sort((a, b) => b.profit - a.profit).slice(0, 5);
      
      return {
        totalSales,
        totalProfit,
        averageMargin,
        topProducts
      } as AnalyticsSummary;
    },
    enabled: !!vendorProfile?.id,
  });

  if (vendorLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-artijam-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full">
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-2xl font-bold">
                  {formatPrice(analytics?.totalSales || 0, 'USD')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Profit</p>
                <p className="text-2xl font-bold">
                  {formatPrice(analytics?.totalProfit || 0, 'USD')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-full">
                <BarChart className="h-8 w-8 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Margin</p>
                <p className="text-2xl font-bold">
                  {analytics?.averageMargin.toFixed(2) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Top Products by Profit</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.topProducts && analytics.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Product</th>
                    <th className="text-right py-2 px-4">Price</th>
                    <th className="text-right py-2 px-4">Cost</th>
                    <th className="text-right py-2 px-4">Margin %</th>
                    <th className="text-right py-2 px-4">Units Sold</th>
                    <th className="text-right py-2 px-4">Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{product.name}</td>
                      <td className="text-right py-2 px-4">
                        {formatPrice(product.price, product.currency)}
                      </td>
                      <td className="text-right py-2 px-4">
                        {formatPrice(product.purchase_price, product.currency)}
                      </td>
                      <td className="text-right py-2 px-4">
                        {product.margin_percentage.toFixed(2)}%
                      </td>
                      <td className="text-right py-2 px-4">{product.sold_count}</td>
                      <td className="text-right py-2 px-4">
                        {formatPrice(product.profit, product.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales data available yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Data will appear here once you start making sales.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-gray-500 mt-4">
        <p>Note: This analytics dashboard shows simulated data for demonstration purposes.</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
