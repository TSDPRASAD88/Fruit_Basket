import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Pressable,
  ActivityIndicator,
  LayoutAnimation, // 🎯 Import LayoutAnimation for smooth toggle
} from "react-native";
import axios from "axios";
import { useIsFocused } from "@react-navigation/native";
import Constants from "expo-constants";
import HorizontalDatePicker from "../components/HorizontalDatePicker";

// Assumed interfaces based on your backend structure
interface Customer {
  _id: string;
  name: string;
  phone?: string;
}

interface Delivery {
  _id: string;
  customer: Customer;
  date: string;
  status: "delivered" | "absent";
}

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "https://fruit-basket-mhc3.onrender.com";


const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // 🎯 NEW: State for calendar visibility
  const isFocused = useIsFocused();

  // 🎯 Use useCallback to stabilize the fetch function
  const fetchDeliveries = useCallback(async () => {
    try {
      setLoading(true);
      // Format the date to YYYY-MM-DD
      const dateString = selectedDate.toISOString().split("T")[0]; 
      const res = await axios.get(
        `${API_URL}/api/deliveries?date=${dateString}`
      );
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      Alert.alert("Error", "Failed to fetch deliveries. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]); // Re-create if selectedDate changes

  useEffect(() => {
    // Re-fetch only when the screen comes into focus OR the selected date changes
    if (isFocused) {
      fetchDeliveries();
    }
  }, [isFocused, fetchDeliveries]); // Dependency on stable fetchDeliveries

  const handleDeleteDelivery = async (deliveryId: string) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this delivery?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/deliveries/${deliveryId}`);
              setDeliveries((prev) =>
                prev.filter((d) => d._id !== deliveryId)
              );
              Alert.alert("Success", "Delivery deleted!");
            } catch (err) {
              console.error("Error deleting delivery:", err);
              Alert.alert("Error", "Failed to delete delivery.");
            }
          },
        },
      ]
    );
  };
  
  // 🎯 Handler for date change from calendar
  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);
    // Optional: Auto-close the calendar when a date is picked
    setShowCalendar(false); 
  };

  const handleMarkDeliveries = () => {
    navigation.navigate("MarkDeliveries", {
      date: selectedDate.toISOString(), 
    });
  };
  
  // 🎯 Toggle the calendar visibility with a smooth animation
  const toggleCalendar = () => {
    // Use LayoutAnimation for a smooth opening/closing effect
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCalendar(prev => !prev);
  }

  if (loading && deliveries.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Calendar Toggle Button */}
      <View style={styles.calendarToggleContainer}>
        <Button 
          title={showCalendar ? "Hide Calendar ▲" : "Select Date ▼"} 
          onPress={toggleCalendar}
        />
      </View>
      
      {/* 2. Conditional Calendar View */}
      {showCalendar && (
        // The calendar will take up about half the screen height in a scrollable view
        <View style={styles.calendarContainer}>
          <HorizontalDatePicker onDateChange={handleDateChange} /> 
        </View>
      )}

      {/* 3. Deliveries Header */}
      <Text style={styles.header}>
        Deliveries for {selectedDate.toDateString()}
      </Text>

      {/* 4. Deliveries List */}
      <FlatList
        data={deliveries}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.name}>{item.customer?.name}</Text>
              <Text
                style={{
                  color: item.status === "delivered" ? "green" : "red",
                }}
              >
                {item.status === "delivered" ? "Delivered ✓" : "Absent ✕"} 
              </Text>
            </View>
            <Pressable
              onPress={() => handleDeleteDelivery(item._id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            No deliveries marked for this date.
          </Text>
        }
        contentContainerStyle={
          deliveries.length === 0
            ? { flexGrow: 1, justifyContent: "center" }
            : {}
        }
      />

      {/* 5. Bottom Button Group */}
      <View style={styles.buttonGroup}>
        <Button title="Mark Deliveries" onPress={handleMarkDeliveries} />
        <Button
          title="All Customers"
          onPress={() => navigation.navigate("AllCustomers")}
        />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  // 🎯 New Styles for Calendar Toggle
  calendarToggleContainer: {
    marginBottom: 10,
  },
  calendarContainer: {
    maxHeight: 400, // Limit height to about half the screen
    overflow: 'hidden', // Ensure calendar respects boundaries
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemInfo: {
    flex: 1,
  },
  name: { fontSize: 16 },
  deleteButton: {
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});