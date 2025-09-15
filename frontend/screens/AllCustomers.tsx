// import React, { useState, useCallback } from "react";
// import { View, Text, FlatList, StyleSheet, Button } from "react-native";
// import axios from "axios";
// import { useFocusEffect } from "@react-navigation/native";

// const API_URL = process.env.EXPO_PUBLIC_API_URL; // ✅ use env instead of hardcoding

// export default function AllCustomers({ navigation }: any) {
//   const [customers, setCustomers] = useState<any[]>([]);

//   const fetchCustomers = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/api/customers`);
//       setCustomers(res.data);
//     } catch (err) {
//       console.error("Error fetching customers:", err);
//     }
//   };

//   // 🔄 Re-fetch whenever screen is focused
//   useFocusEffect(
//     useCallback(() => {
//       fetchCustomers();
//     }, [])
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>All Customers</Text>
//       <FlatList
//         data={customers}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <View style={styles.item}>
//             <Text>{item.name}</Text>
//           </View>
//         )}
//         ListEmptyComponent={<Text>No customers found.</Text>}
//       />
//       <Button
//         title="Add Customer"
//         onPress={() => navigation.navigate("AddCustomer")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   item: { paddingVertical: 8, borderBottomWidth: 1, borderColor: "#ddd" },
// });


// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   Button,
//   TouchableOpacity,
//   Alert,
//   Image,
// } from "react-native";
// import axios from "axios";
// import { useFocusEffect } from "@react-navigation/native";

// const API_URL = process.env.EXPO_PUBLIC_API_URL; // ✅ from .env

// export default function AllCustomers({ navigation }: any) {
//   const [customers, setCustomers] = useState<any[]>([]);

//   const fetchCustomers = async () => {
//     try {
//       const res = await axios.get(`${API_URL}/api/customers`);
//       setCustomers(res.data);
//     } catch (err) {
//       console.error("Error fetching customers:", err);
//     }
//   };

//   // 🔄 Refresh on screen focus
//   useFocusEffect(
//     useCallback(() => {
//       fetchCustomers();
//     }, [])
//   );

//   // 🗑️ Delete customer
//   const deleteCustomer = async (id: string) => {
//     Alert.alert("Delete Customer", "Are you sure you want to delete this customer?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Delete",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await axios.delete(`${API_URL}/api/customers/${id}`);
//             fetchCustomers(); // Refresh after delete
//           } catch (err) {
//             console.error("Error deleting customer:", err);
//           }
//         },
//       },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>All Customers</Text>
//       <FlatList
//         data={customers}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => (
//           <View style={styles.item}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.name}>{item.name}</Text>
//               <Text>{item.phone}</Text>
//               <Text>{item.address}</Text>
//             </View>

//             {/* ✏️ Edit button */}
//             <TouchableOpacity
//               onPress={() => navigation.navigate("EditCustomer", { customer: item })}
//               style={styles.iconButton}
//             >
//               <Image
//                 source={{
//                   uri: "https://img.icons8.com/ios-filled/50/0000FF/edit.png",
//                 }}
//                 style={styles.icon}
//               />
//             </TouchableOpacity>

//             {/* 🗑️ Delete button */}
//             <TouchableOpacity
//               onPress={() => deleteCustomer(item._id)}
//               style={styles.iconButton}
//             >
//               <Image
//                 source={{
//                   uri: "https://img.icons8.com/ios-filled/50/FF0000/delete-forever.png",
//                 }}
//                 style={styles.icon}
//               />
//             </TouchableOpacity>
//           </View>
//         )}
//         ListEmptyComponent={<Text>No customers found.</Text>}
//       />
//       <Button
//         title="Add Customer"
//         onPress={() => navigation.navigate("AddCustomer")}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16 },
//   header: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   item: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#ddd",
//   },
//   name: { fontSize: 16, fontWeight: "bold" },
//   iconButton: { marginHorizontal: 8 },
//   icon: { width: 24, height: 24 },
// });


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

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
}

const API_URL =
  (Constants.expoConfig && (Constants.expoConfig as any).extra?.apiUrl) ||
  "http://192.168.1.4:8080";

const api = axios.create({ baseURL: API_URL, timeout: 8000 });

export default function AllCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/customers");
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

      const previous = customers;
      setCustomers((prev) => prev.filter((c) => c._id !== id));

      await api.delete(`/api/customers/${id}`);
    } catch (err) {
      console.error("[AllCustomers] delete error:", err);
      await fetchCustomers(); // rollback
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
      {/* ➕ Add Customer Button */}
      <Button
        title="Add Customer"
        onPress={() =>
          navigation.navigate("AddCustomer", {
            onGoBack: fetchCustomers, // callback to refresh list after adding
          })
        }
      />

      <FlatList
        data={customers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.customerCard}>
            <View style={styles.info}>
              <Text style={styles.customerName}>{item.name}</Text>
              {item.phone ? <Text style={styles.subText}>{item.phone}</Text> : null}
              {item.address ? <Text style={styles.subText}>{item.address}</Text> : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  navigation.navigate("EditCustomer", {
                    customer: item,
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
                <Text style={styles.actionText}>Edit</Text>
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
        contentContainerStyle={customers.length === 0 ? { flex: 1 } : undefined}
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
