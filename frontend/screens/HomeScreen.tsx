import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet } from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import HorizontalDatePicker from "../components/HorizontalDatePicker";

const API_URL = "http://192.168.1.4:8080"; // replace with your machine IP

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchDeliveries();
  }, [isFocused, selectedDate]);

  const fetchDeliveries = async () => {
    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      const res = await axios.get(`${API_URL}/api/deliveries?date=${dateString}`);
      setCustomers(res.data.deliveries || []); // deliveries array from backend
    } catch (err) {
      console.error("Error fetching deliveries:", err);
    }
  };

  return (
    <View style={styles.container}>
      <HorizontalDatePicker onDateChange={setSelectedDate} />
      <Text style={styles.header}>Deliveries for {selectedDate.toDateString()}</Text>

      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.customer?.name}</Text>
            <Text style={{ color: item.status === "delivered" ? "green" : "red" }}>
              {item.status}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text>No deliveries marked.</Text>}
      />

      <Button title="Mark Today's Deliveries" onPress={() => navigation.navigate("MarkDeliveries")} />
      <Button title="All Customers" onPress={() => navigation.navigate("AllCustomers")} />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  item: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderColor: "#ddd" },
  name: { fontSize: 16 },
});
