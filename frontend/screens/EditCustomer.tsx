// import React from "react";
// import { View, StyleSheet } from "react-native";
// import CustomerEditor from "../components/CustomerEditor";

// const EditCustomer = ({ route }: any) => {
//   const { customerId } = route.params;
//   return (
//     <View style={styles.container}>
//       <CustomerEditor customerId={customerId} />
//     </View>
//   );
// };

// export default EditCustomer;

// const styles = StyleSheet.create({ container: { flex: 1 } });

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL; // ✅ from .env

const EditCustomer = ({ route, navigation }: any) => {
  const { customer } = route.params;

  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [address, setAddress] = useState(customer.address);

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_URL}/api/customers/${customer._id}`, {
        name,
        phone,
        address,
      });
      Alert.alert("Success", "Customer updated successfully!");
      navigation.goBack(); // 🔙 return to AllCustomers
    } catch (err) {
      console.error("Error updating customer:", err);
      Alert.alert("Error", "Failed to update customer.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Customer</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />

      <Button title="Update" onPress={handleUpdate} />
    </View>
  );
};

export default EditCustomer;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
});
