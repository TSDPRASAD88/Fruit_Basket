import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native"; 
import HorizontalDatePicker from "../components/HorizontalDatePicker"; // 👈 import calendar

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchCustomers();
  }, [isFocused]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const deleteCustomer = async (id: string) => {
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/customers/${id}`);
              setCustomers(customers.filter((c) => c._id !== id));
            } catch (err) {
              console.error("Error deleting customer:", err);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar */}
      <HorizontalDatePicker />

      <Text style={styles.header}>Customers</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.buttonsContainer}>
              <Button
                title="Edit"
                onPress={() =>
                  navigation.navigate("EditCustomer", { customerId: item._id })
                }
              />
              <Button
                title="Delete"
                color="red"
                onPress={() => deleteCustomer(item._id)}
              />
            </View>
          </View>
        )}
      />
      <Button
        title="Add Customer"
        onPress={() => navigation.navigate("AddCustomer")}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  item: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderColor: "#ccc" 
  },
  name: { fontSize: 18 },
  buttonsContainer: { flexDirection: "row", gap: 10 },
});
