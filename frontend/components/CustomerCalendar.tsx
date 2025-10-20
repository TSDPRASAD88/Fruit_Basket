import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import Constants from 'expo-constants'; // 👈 Use Constants for API URL

// Use the deployed API URL from the environment (defaulting to a local fallback)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

interface CustomerCalendarProps {
  customerId: string;
}

// Interface for the data fetched from the /:id/history endpoint
interface DeliveryData {
  date: string; // The date string (e.g., '2025-10-20T00:00:00.000Z')
  status: "delivered" | "absent";
}

interface DeliveryStats {
  totalDays: number;
  deliveredCount: number;
  absentCount: number;
}

interface MarkedDatesType {
  [date: string]: { marked: boolean; dotColor: "green" | "red" };
}

const CustomerCalendar: React.FC<CustomerCalendarProps> = ({ customerId }) => {
  const [markedDates, setMarkedDates] = useState<MarkedDatesType>({});
  const [stats, setStats] = useState<DeliveryStats>({ totalDays: 0, deliveredCount: 0, absentCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerId) {
      fetchCustomerHistory();
    }
  }, [customerId]);

  const fetchCustomerHistory = async () => {
    setLoading(true);
    try {
      // 🎯 Hitting the new consolidated route: /api/customers/:id/history
      const res = await axios.get<{ deliveries: DeliveryData[]; stats: DeliveryStats }>(
    // 🎯 The URL is correctly constructed here:
    `${API_URL}/api/customers/${customerId}/history`
);

      const { deliveries, stats: fetchedStats } = res.data;
      
      const newMarkedDates: MarkedDatesType = {};
      
      deliveries.forEach(delivery => {
        // Extract YYYY-MM-DD from the ISO date string
        const dateKey = new Date(delivery.date).toISOString().split('T')[0]; 

        newMarkedDates[dateKey] = {
          marked: true,
          dotColor: delivery.status === "delivered" ? "green" : "red",
        };
      });

      setMarkedDates(newMarkedDates);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Error fetching customer history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text style={styles.loading}>Loading Delivery History...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Delivery Calendar</Text>
      <Calendar
        markingType={'dot'} // Using 'dot' for simpler visualization
        markedDates={markedDates}
        // Disabled interaction on the calendar as it's a history viewer
        onDayPress={() => {}}
        enableSwipeMonths={true}
        disableArrowLeft={false}
        disableArrowRight={false}
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>
          Total Delivery Days: <Text style={styles.statValue}>{stats.totalDays}</Text>
        </Text>
        <Text style={styles.statText}>
          No. of Days Delivered (✓): <Text style={[styles.statValue, { color: 'green' }]}>{stats.deliveredCount}</Text>
        </Text>
        <Text style={styles.statText}>
          No. of Days Absent (✕): <Text style={[styles.statValue, { color: 'red' }]}>{stats.absentCount}</Text>
        </Text>
      </View>
    </View>
  );
};

export default CustomerCalendar;

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  loading: { textAlign: 'center', marginVertical: 20, color: '#666' },
  statsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statText: {
    fontSize: 15,
    marginBottom: 5,
  },
  statValue: {
    fontWeight: 'bold',
  }
});