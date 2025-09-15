import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";

const API_URL = "http://192.168.1.4:8080"; // replace with your machine LAN IP

interface CustomerCalendarProps {
  customerId: string;
  year: number;
  month: number;
}

interface MarkedDatesType {
  [date: string]: { marked?: boolean; dotColor?: "green" | "red" };
}

const CustomerCalendar: React.FC<CustomerCalendarProps> = ({
  customerId,
  year,
  month,
}) => {
  const [markedDates, setMarkedDates] = useState<MarkedDatesType>({});

  useEffect(() => {
    fetchCalendar();
  }, [customerId, year, month]);

  const fetchCalendar = async () => {
    try {
      const res = await axios.get<MarkedDatesType>(
        `${API_URL}/api/calendar/${customerId}/${year}/${month}`
      );
      setMarkedDates(res.data);
    } catch (err) {
      console.error("Error fetching calendar:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delivery Calendar</Text>
      <Calendar
        current={`${year}-${String(month).padStart(2, "0")}-01`}
        markingType={"simple" as any}
        markedDates={markedDates}
        onDayPress={() => {}}
      />
    </View>
  );
};

export default CustomerCalendar;

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});
