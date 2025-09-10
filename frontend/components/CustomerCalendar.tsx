import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";

// ✅ Set your backend IP and port here
const API_URL = "http://192.168.1.4:8080";

interface CustomerCalendarProps {
  customerId: string;
  year: number;
  month: number;
  onCountsUpdate?: (received: number, missed: number) => void; // optional callback
}

interface MarkedDatesType {
  [date: string]: {
    marked?: boolean;
    dotColor?: "green" | "red"; // green = delivered, red = missed
  };
}

const CustomerCalendar: React.FC<CustomerCalendarProps> = ({
  customerId,
  year,
  month,
  onCountsUpdate,
}) => {
  const [markedDates, setMarkedDates] = useState<MarkedDatesType>({});
  const [receivedDays, setReceivedDays] = useState(0);
  const [missedDays, setMissedDays] = useState(0);

  useEffect(() => {
    fetchCalendar();
  }, [customerId, year, month]);

  const fetchCalendar = async () => {
    try {
      const res = await axios.get<MarkedDatesType>(
        `${API_URL}/api/deliveries/calendar/${customerId}/${year}/${month}`
      );

      setMarkedDates(res.data);

      // Count received and missed days
      let received = 0;
      let missed = 0;
      Object.values(res.data).forEach(day => {
        if (day.dotColor === "green") received++;
        else missed++;
      });

      setReceivedDays(received);
      setMissedDays(missed);

      // Call parent callback if provided
      onCountsUpdate?.(received, missed);
    } catch (err) {
      console.error("Error fetching calendar:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Customer Calendar</Text>
      <Calendar
        current={`${year}-${String(month).padStart(2, "0")}-01`}
        markingType={"simple" as any} // ✅ TypeScript fix
        markedDates={markedDates}
        onDayPress={() => {}} // read-only calendar
      />
      <Text style={styles.countText}>
        Received Days: {receivedDays} | Missed Days: {missedDays}
      </Text>
    </View>
  );
};

export default CustomerCalendar;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  countText: {
    marginTop: 10,
  },
});
