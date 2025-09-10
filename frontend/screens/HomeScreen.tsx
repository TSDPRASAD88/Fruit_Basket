import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Customers</Text>
      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.name}</Text>
            <Button
              title="Edit"
              onPress={() => navigation.navigate("EditCustomer", { customerId: item._id })}
            />
          </View>
        )}
      />
      <Button title="Add Customer" onPress={() => navigation.navigate("AddCustomer")} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  item: { padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
});
