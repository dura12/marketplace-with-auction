import { Document, Types } from 'mongoose';

export type LatLng = {
    lat: number;
    lng: number;
};
  
export type LocationData = {
    radius: number;
    center: LatLng;
};
  
export interface ProductType {
    _id: string;
    productName: string;
    category: {
      categoryId: string;
      categoryName: string;
    };
    price: number;
    quantity: number;
    soldQuantity: number;
    avgRating: number;
    review: {
      customerId: string;
      comment: string;
      rating: number;
      createdDate: string;
    }[];
    merchantDetail: {
      merchantId: string;
      merchantName: string;
      merchantEmail: string;
    };
    isBanned: boolean;
    description: string;
    images: string[];
    variant: string[];
    size: string[];
    brand: string;
    location: {
      type: string;
      coordinates: number[];
    };
    delivery: "PERPIECE" | "PERKG" | "FREE" | "PERKM" | "FLAT";
    deliveryPrice: number;
    banReason?: {
      reason: string;
      description?: string;
    };
    bannedAt?: Date;
    isDeleted: boolean;
    trashDate: Date | null;
}

export interface ProductDetailsDialogProps {
    product: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onAction: (action: { type: string; productId: string; reason?: string; description?: string }) => void
    isLoading: boolean
}

export interface Product {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    delivery: "FREE" | "PERPIECS" | "FLAT" | string;
    deliveryPrice: number;
}
  
export interface Address {
  state: string;
  city: string;
}

export interface CustomerDetail {
  customerId: Types.ObjectId;
  customerName: string;
  phoneNumber: string;
  customerEmail: string;
  address: Address;
}

export interface MerchantDetail {
  merchantId: Types.ObjectId;
  merchantName: string;
  merchantEmail: string;
  phoneNumber: string;
  account_name: string;
  account_number: string;
  merchantRefernce?: string | null;
  bank_code: string;
}

export interface ProductItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  delivery: 'FLAT' | 'PERPIECS' | 'PERKG' | 'FREE';
  deliveryPrice: number;
}

export interface AuctionDetail {
  auctionId?: Types.ObjectId;
  delivery?: 'PAID' | 'FREE';
  deliveryPrice?: number;
}

export interface Location {
  type: string;
  coordinates: [number, number]; // longitude, latitude
}

export interface OrderDocument extends Document {
  customerDetail: CustomerDetail;
  merchantDetail: MerchantDetail;
  products: ProductItem[];
  auction?: AuctionDetail;
  totalPrice: number;
  status: 'Pending' | 'Dispatched' | 'Received';
  paymentStatus: 'Pending' | 'Paid' | 'Paid To Merchant' | 'Pending Refund' | 'Refunded';
  location: Location;
  transactionRef: string;
  reference: string;
  orderDate: Date;
  refundReason?: string;
  chapaRef? : string;
}

export type Sale = {
  _id: string;
  customerDetail?: {
    customerName?: string;
    customerEmail?: string;
  };
  totalPrice?: number | string;
};

export interface OrderFilters {
  searchTerm?: string
  status?: string
  paymentStatus?: string
  merchantName?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  state?: string
  city?: string
}

export interface Auction {
  auctionTitle: string;
  buyByParts: any;
  remainingQuantity: number;
  totalQuantity: number;
  paymentDuration: Number;
  banReason?: {
    reason: string;
    description?: string;
  };
  _id: string;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  description: string;
  condition: "new" | "used";
  startTime: string;
  endTime: string;
  itemImg: string[];
  startingPrice: number;
  reservedPrice: number;
  bidIncrement: number;
  status: "pending" | "active" | "ended" | "cancelled";
  adminApproval: "pending" | "approved" | "rejected";
  currentBid: number;
  bidCount: number;
  category: string;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  isDeleted: boolean;
  trashDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
  businessHours: string
}

  export interface OrderFilters {
    searchTerm?: string
    status?: string
    paymentStatus?: string
    merchantName?: string
    minPrice?: number
    maxPrice?: number
    page?: number
    limit?: number
    state?: string;
    city?: string;
    country?: string;
  }