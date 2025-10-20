import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Button,
  Platform,
} from "react-native";
import axios from "axios";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

// Updated interface to reflect the new backend model fields
interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  mealPlan?: string;
  pricePerDay?: number;
  startDate?: string;
}

// Use the proper Expo Constants method for consistency
const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || "https://fruit-basket-mhc3.onrender.com";

const api = axios.create({ baseURL: API_URL, timeout: 8000 });

export default function AllCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/customers");
      // Ensure we get the full data set, including new fields
      setCustomers(res.data || []); 
    } catch (err) {
      console.error("[AllCustomers] fetch error:", err);
      Alert.alert("Error", "Failed to load customers. Check backend/network.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [])
  );

  const confirmNative = (): Promise<boolean> =>
    new Promise((resolve) => {
      Alert.alert(
        "Confirm delete",
        "Are you sure you want to delete this customer?",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          { text: "Delete", style: "destructive", onPress: () => resolve(true) },
        ],
        { cancelable: true }
      );
    });

  const handleDelete = async (id: string) => {
    try {
      let confirmed = true;
      if (Platform.OS === "web") {
        confirmed = window.confirm("Are you sure you want to delete this customer?");
      } else {
        confirmed = await confirmNative();
      }
      if (!confirmed) return;

      // Optimistic update
      setCustomers((prev) => prev.filter((c) => c._id !== id));

      await api.delete(`/api/customers/${id}`);
    } catch (err) {
      console.error("[AllCustomers] delete error:", err);
      // Rollback on failure
      await fetchCustomers(); 
      Alert.alert("Error", "Failed to delete customer. Try again.");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Updated to navigate to EditCustomer without a customerId to trigger ADD mode */}
      <Button
        title="Add New Customer"
        onPress={() =>
          navigation.navigate("EditCustomer", {
            customerId: null, // Signals the editor to be in ADD mode
            onGoBack: fetchCustomers, // Callback to refresh list after adding
          })
        }
      />

      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          // 🎯 Ensure NO extra whitespace or characters are outside of this <View>
          <View style={styles.customerCard}>
            <View style={styles.info}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.subText}>{item.mealPlan || 'N/A'}</Text>
              {item.phone ? <Text style={styles.subText}>{item.phone}</Text> : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                // Pass the customer ID for EDIT mode
                onPress={() =>
                  navigation.navigate("EditCustomer", {
                    customerId: item._id, // Signals the editor to fetch data
                    onGoBack: fetchCustomers, // refresh after edit
                  })
                }
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.editButton,
                  pressed ? styles.pressed : null,
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
              >
                <Text style={styles.actionText}>Edit/View</Text>
              </Pressable>

              <Pressable
                onPress={() => handleDelete(item._id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed ? styles.pressed : null,
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
              >
                <Text style={styles.actionText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>No customers found.</Text>
        }
        contentContainerStyle={customers.length === 0 ? { flexGrow: 1 } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  customerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  info: { flex: 1, paddingRight: 12 },
  customerName: { fontSize: 16, fontWeight: "600" },
  subText: { color: "#555", marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center" },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 64,
    alignItems: "center",
  },
  editButton: { backgroundColor: "#1976d2" },
  deleteButton: { backgroundColor: "#d32f2f" },
  actionText: { color: "#fff", fontWeight: "700" },
  pressed: { opacity: 0.7 },
});