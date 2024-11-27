export interface ShopItem {
    id: string;
    name: string;
    category: 'mens' | 'womens' | 'kids';
    new: boolean;
    price: number;
    description?: string;
    image: string;
}