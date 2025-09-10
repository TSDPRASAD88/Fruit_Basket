import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import CustomerCalendar from "../components/CustomerCalendar";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const EditCustomer: React.FC<{ route: any }> = ({ route }) => {
  const customerId = route.params.customerId;
  const [customer, setCustomer] = useState<any>(null);
  const [status, setStatus] = useState<"Working" | "Holiday">("Working");
  const [calendar, setCalendar] = useState<{ [key: string]: any }>({});
  const [received, setReceived] = useState(0);
  const [missed, setMissed] = useState(0);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customers/${customerId}`);
      setCustomer(res.data);
      setStatus(res.data.status);
      fetchCalendar();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCalendar = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/customers/${customerId}`, { status });
      setCalendar(res.data.calendar);

      let r = 0, m = 0;
      Object.values(res.data.calendar).forEach((day: any) => {
        day.dotColor === "green" ? r++ : m++;
      });
      setReceived(r);
      setMissed(m);
    } catch (err) {
      console.error(err);
    }
  };

  const saveStatus = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/customers/${customerId}`, { status });
      setCustomer(res.data.customer);
      setCalendar(res.data.calendar);

      let r = 0, m = 0;
      Object.values(res.data.calendar).forEach((day: any) => {
        day.dotColor === "green" ? r++ : m++;
      });
      setReceived(r);
      setMissed(m);

      alert("Status and calendar updated!");
    } catch (err) {
      console.error(err);
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
          <Picker selectedValue={status} onValueChange={setStatus} style={{ height: 50, width: 200 }}>
            <Picker.Item label="Working" value="Working" />
            <Picker.Item label="Holiday" value="Holiday" />
          </Picker>

          <Button title="Save Status" onPress={saveStatus} />

          <CustomerCalendar customerId={customerId} year={year} month={month} />

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
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: "bold" },
});
