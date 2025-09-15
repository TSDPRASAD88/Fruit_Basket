import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import CustomerCalendar from "./CustomerCalendar";

const API_URL = "http://192.168.1.4:8080"; // replace with your machine LAN IP

interface CustomerEditorProps {
  customerId: string;
}

const CustomerEditor: React.FC<CustomerEditorProps> = ({ customerId }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers/${customerId}`);
      setName(res.data.name);
      setPhone(res.data.phone);
      setAddress(res.data.address || "");
    } catch (err) {
      console.error("Error fetching customer:", err);
    }
  };

  const updateCustomer = async () => {
    try {
      await axios.put(`${API_URL}/api/customers/${customerId}`, {
        name,
        phone,
        address,
      });
      alert("Customer updated!");
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Customer</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Phone</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      <Button title="Update Customer" onPress={updateCustomer} />

      <CustomerCalendar customerId={customerId} year={currentYear} month={currentMonth} />
    </ScrollView>
  );
};

export default CustomerEditor;

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
});
