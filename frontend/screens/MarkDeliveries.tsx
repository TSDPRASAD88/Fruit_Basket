import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, Switch } from "react-native";
import axios from "axios";

const API_URL = "http://192.168.1.4:8080"; // replace with your machine IP

console.log(">>> API_URL in MarkDeliveries =", API_URL);

const MarkDeliveries: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [deliveryStatus, setDeliveryStatus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    console.log(">>> useEffect triggered, API_URL =", API_URL);
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      console.log(">>> Fetching:", `${API_URL}/api/customers`);
      const res = await axios.get(`${API_URL}/api/customers`);
      console.log(">>> Customers fetched:", res.data);
      setCustomers(res.data);

      const initialStatus: { [key: string]: boolean } = {};
      res.data.forEach((c: any) => (initialStatus[c._id] = true));
      setDeliveryStatus(initialStatus);
    } catch (err) {
      console.error(">>> Error fetching customers:", err);
    }
  };

  const saveDeliveries = async () => {
    try {
      const dateString = new Date().toISOString().split("T")[0];
      const payload = {
        customerIds: customers.map(c => c._id),
        status: "delivered",
        date: dateString
      };
      console.log(">>> Saving deliveries payload:", payload);
      await axios.post(`${API_URL}/api/deliveries/bulk`, payload);
      alert("Deliveries saved!");
      navigation.goBack();
    } catch (err) {
      console.error(">>> Error saving deliveries:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mark Today's Deliveries</Text>

      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Switch
              value={deliveryStatus[item._id]}
              onValueChange={(val) =>
                setDeliveryStatus((prev) => ({ ...prev, [item._id]: val }))
              }
            />
          </View>
        )}
      />

      <Button title="Save Deliveries" onPress={saveDeliveries} />
    </View>
  );
};

export default MarkDeliveries;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#ddd" },
  name: { fontSize: 16 },
});
