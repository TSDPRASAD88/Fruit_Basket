import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

interface Props {
  // Callback function to inform parent component of the selected date
  onDateChange: (date: Date) => void;
}

const HorizontalDatePicker: React.FC<Props> = ({ onDateChange }) => {
  const today = new Date();
  // State to hold the selected date string (YYYY-MM-DD) for marking
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  const handleDayPress = (day: DateData) => {
    // 1. Update local state to mark the day
    setSelectedDate(day.dateString);
    
    // 2. Prepare the Date object for the backend (set to midnight of the local date)
    const newDate = new Date(day.year, day.month - 1, day.day);

    // 3. Trigger parent callback
    onDateChange(newDate);
  };

  return (
    <View style={styles.container}>
      {/* Title for clarity */}
      <Text style={styles.header}>Select Delivery Date</Text>

      <Calendar
        // Use an array of dates to mark the single selected day
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#34AADC', // A nice modern blue
            selectedTextColor: 'white',
          },
        }}
        
        // Configuration for a simple, minimal look
        hideExtraDays={true}
        onDayPress={handleDayPress}
        enableSwipeMonths={true}
        
        // Styling for a modern look
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#34AADC',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          arrowColor: '#34AADC',
          monthTextColor: '#2d4150',
          textMonthFontWeight: 'bold',
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    marginVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    paddingHorizontal: 15,
  }
});

export default HorizontalDatePicker;