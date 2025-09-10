import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const AddCustomer: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleAdd = async () => {
    try {
      await axios.post(`${API_URL}/api/customers`, {
        name,
        phone,
        address,
      });
      alert("Customer added!");
      navigation.goBack();
    } catch (err) {
      console.error("Error adding customer:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Customer</Text>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />
      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />
      <Button title="Add Customer" onPress={handleAdd} />
    </View>
  );
};

export default AddCustomer;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 8,
    borderRadius: 4,
  },
});
