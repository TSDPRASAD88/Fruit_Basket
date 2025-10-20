// types/navigation.ts

// Define the shape of a Customer object for better type hinting
interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  mealPlan?: string;
  pricePerDay?: number;
  startDate?: string;
}

export type RootStackParamList = {
  Home: undefined;
  AllCustomers: undefined;
  
  // 🎯 Updated to use customerId (nullable for ADD mode) and callback
  EditCustomer: { 
    customerId: string | null | undefined; 
    onGoBack?: () => void; 
  }; 
  
  // 🎯 Updated to require the date string
  MarkDeliveries: { 
    date: string; 
  }; 
  
  // NOTE: AddCustomer has been removed as its functionality is merged into EditCustomer.
};