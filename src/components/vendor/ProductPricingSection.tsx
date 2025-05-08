
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPrice } from '@/utils/string-utils';

interface ProductPricingSectionProps {
  price: number;
  purchasePrice: number;
  currency: string;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPurchasePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCurrencyChange: (value: string) => void;
}

const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({
  price,
  purchasePrice,
  currency,
  onPriceChange,
  onPurchasePriceChange,
  onCurrencyChange
}) => {
  // Calculate profit metrics
  const profitMargin = price - purchasePrice;
  const profitPercentage = purchasePrice > 0 
    ? ((price - purchasePrice) / purchasePrice) * 100 
    : 0;

  // Available currencies
  const currencies = [
    'USD',
    'JMD',
    'EUR',
    'GBP',
    'CAD'
  ];

  return (
    <div className="border p-4 rounded-md bg-gray-50">
      <h3 className="font-medium text-lg mb-4">Pricing Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={currency}
            onValueChange={onCurrencyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map(currencyOption => (
                <SelectItem key={currencyOption} value={currencyOption}>{currencyOption}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchase_price">
            Purchase Price *
            <span className="text-xs text-gray-500 ml-1">(Only visible to you)</span>
          </Label>
          <Input
            type="number"
            id="purchase_price"
            name="purchase_price"
            value={purchasePrice}
            onChange={onPurchasePriceChange}
            step="0.01"
            min="0"
            required
            placeholder="Your cost price"
          />
        </div>
        
        <div>
          <Label htmlFor="price">
            Sales Price *
            <span className="text-xs text-gray-500 ml-1">(Public price)</span>
          </Label>
          <Input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={onPriceChange}
            step="0.01"
            min="0"
            required
            placeholder="Public selling price"
          />
        </div>
      </div>
      
      {/* Profit calculation */}
      {purchasePrice > 0 && price > 0 && (
        <div className="mt-4 p-2 rounded bg-white">
          <div className="flex justify-between text-sm">
            <span>Profit Margin:</span>
            <span className={profitMargin >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {formatPrice(profitMargin, currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Profit Percentage:</span>
            <span className={profitPercentage >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {profitPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPricingSection;
