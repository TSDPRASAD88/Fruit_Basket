import React, { useEffect, useState } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    Button, 
    StyleSheet, 
    ScrollView, 
    Alert 
} from "react-native";
import axios from "axios";
import Constants from 'expo-constants';
import CustomerCalendar from "./CustomerCalendar"; 
// Removed imports for DateTimePicker and Platform

// Use the deployed API URL from the environment
const API_URL = "https://fruit-basket-mhc3.onrender.com";

interface CustomerEditorProps {
  customerId?: string | null;
  onSuccess: () => void; 
}

const CustomerEditor: React.FC<CustomerEditorProps> = ({ customerId, onSuccess }) => {
  const isEditing = !!customerId;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  // Removed states for mealPlan, pricePerDay, startDate, and showDatePicker
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchCustomer();
    } else {
      // Reset fields for Add mode
      setName("");
      setPhone("");
      setAddress("");
      setLoading(false);
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers/${customerId}`);
      const data = res.data;
      setName(data.name);
      setPhone(data.phone);
      setAddress(data.address || "");
      // Removed logic for fetching mealPlan, pricePerDay, startDate
    } catch (err) {
      console.error("Error fetching customer:", err);
      Alert.alert("Error", "Could not fetch customer details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Basic validation for required fields
    if (!name || !phone) {
      Alert.alert("Error", "Please fill in Name and Phone.");
      return;
    }

    // Payload now only includes core contact fields
    const payload = {
      name,
      phone,
      address,
      // IMPORTANT: mealPlan, pricePerDay, and startDate are now omitted.
      // Ensure your backend model (Customer.js) handles this!
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/api/customers/${customerId}`, payload);
        Alert.alert("Success", "Customer updated!");
      } else {
        await axios.post(`${API_URL}/api/customers`, payload);
        Alert.alert("Success", "New customer added!");
      }
      onSuccess(); 
    } catch (err: any) {
      console.error("Error saving customer:", err.response?.data || err);
      Alert.alert("Error", err.response?.data?.error || "Failed to save customer.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}><Text style={styles.header}>Loading...</Text></View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{isEditing ? "Edit Customer Profile" : "Add New Customer"}</Text>

      {/* --- Core Contact Data Fields --- */}
      <Text style={styles.label}>Name*</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Phone*</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Text style={styles.label}>Address</Text>
      <TextInput style={styles.input} value={address} onChangeText={setAddress} />

      {/* The Billing & Meal Plan section is completely removed */}

      <Button 
        title={isEditing ? "Update Customer" : "Add Customer"} 
        onPress={handleSubmit} 
        color={isEditing ? "#007AFF" : "#4CAF50"}
      />

      {/* --- Delivery History (Only in Edit Mode) --- */}
      {isEditing && (
        <>
          {/* Calendar Spacer to separate button from calendar */}
          <View style={styles.calendarSpacer} />
          <CustomerCalendar customerId={customerId} />
        </>
      )}
    </ScrollView>
  );
};

export default CustomerEditor;

const styles = StyleSheet.create({
  container: { padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  // New style for spacing
  calendarSpacer: {
    paddingTop: 30,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  }
});