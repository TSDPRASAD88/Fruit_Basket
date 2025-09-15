export type RootStackParamList = {
  Home: undefined;
  AddCustomer: undefined;
  AllCustomers: undefined;
  EditCustomer: { customer: any }; // 👈 define what params EditCustomer expects
  MarkDeliveries: undefined;
};
