import React from "react";
import { View, StyleSheet } from "react-native";
import CustomerEditor from "../components/CustomerEditor"; // 🎯 The consolidated editor component

const EditCustomer = ({ route, navigation }: any) => {
  const { customerId, onGoBack } = route.params || {};

  // Success handler: executes the callback passed from AllCustomers, then navigates back
  const handleSuccess = () => {
    if (onGoBack) {
      onGoBack(); // Refresh AllCustomers list
    }
    navigation.goBack(); // Navigate back to the previous screen (AllCustomers)
  };

  return (
    <View style={styles.container}>
      {/* Pass the customerId (will be null for ADD mode) and the success handler.
        The CustomerEditor component contains all the fetching, form state, 
        submission (POST/PUT), and the CustomerCalendar component.
      */}
      <CustomerEditor 
        customerId={customerId} 
        onSuccess={handleSuccess} 
      />
    </View>
  );
};

export default EditCustomer;

const styles = StyleSheet.create({ 
    container: { flex: 1 } 
});