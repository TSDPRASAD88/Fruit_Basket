import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import CustomerCalendar from "./CustomerCalendar";

// ✅ Set your backend IP and port here
const API_URL = "http://192.168.1.4:8080";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  address: string;
  active: boolean;
  status: "Working" | "Holiday";
}

const EditCustomer: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<"Working" | "Holiday">("Working");
  const [received, setReceived] = useState(0);
  const [missed, setMissed] = useState(0);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res = await axios.get<Customer>(
        `${API_URL}/api/customers/${customerId}`
      );
      setCustomer(res.data);
      setStatus(res.data.status);
    } catch (err) {
      console.error("Error fetching customer:", err);
    }
  };

  const saveStatus = async () => {
    try {
      const res = await axios.put(
        `${API_URL}/api/customers/${customerId}`,
        { status }
      );

      setCustomer(res.data.customer); // updated customer

      alert("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <View style={styles.container}>
      {customer && (
        <>
          <Text style={styles.header}>{customer.name}</Text>
          <Text>Phone: {customer.phone}</Text>
          <Text>Address: {customer.address}</Text>

          <Text style={{ marginTop: 10 }}>Status:</Text>
          <Picker
            selectedValue={status}
            onValueChange={(itemValue: "Working" | "Holiday") =>
              setStatus(itemValue)
            }
            style={{ height: 50, width: 200 }}
          >
            <Picker.Item label="Working" value="Working" />
            <Picker.Item label="Holiday" value="Holiday" />
          </Picker>

          <Button title="Save Status" onPress={saveStatus} />

          <CustomerCalendar
            customerId={customer._id}
            year={year}
            month={month}
            onCountsUpdate={(r, m) => {
              setReceived(r);
              setMissed(m);
            }}
          />

          <Text style={{ marginTop: 10 }}>
            Received Days: {received} | Missed Days: {missed}
          </Text>
        </>
      )}
    </View>
  );
};

export default EditCustomer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
