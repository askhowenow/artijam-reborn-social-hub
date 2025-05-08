
export type BannerItem = {
  id: string;
  type: 'product' | 'service' | 'event';
  title: string;
  image: string;
  price?: number;
  category: string;
  path: string;
}
