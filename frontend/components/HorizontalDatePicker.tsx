import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const screenWidth = Dimensions.get("window").width;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  onDateChange?: (date: Date) => void;
}

const HorizontalDatePicker: React.FC<Props> = ({ onDateChange }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const flatListRef = useRef<FlatList<number>>(null);

  const daysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const getWeekday = (day: number) =>
    WEEKDAYS[new Date(year, month, day).getDay()];

  const days = Array.from({ length: daysInMonth(month, year) }, (_, i) => i + 1);

  const handleSelectDate = (day: number) => {
    setSelectedDate(day);
    if (onDateChange) onDateChange(new Date(year, month, day));
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: selectedDate - 1,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [selectedDate, month, year]);

  // Prev month button
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else setMonth(m => m - 1);
    setSelectedDate(1);
  };

  // Next month button
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else setMonth(m => m + 1);
    setSelectedDate(1);
  };

  return (
    <View style={styles.container}>
      {/* Month & Year + Prev/Next Buttons */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <Text style={styles.navText}>◀</Text>
        </TouchableOpacity>

        <Picker
          selectedValue={month}
          style={styles.picker}
          onValueChange={(val) => {
            setMonth(val);
            setSelectedDate(1);
          }}
        >
          {MONTHS.map((m, idx) => (
            <Picker.Item key={idx} label={m} value={idx} />
          ))}
        </Picker>

        <Picker
          selectedValue={year}
          style={styles.picker}
          onValueChange={(val) => {
            setYear(val);
            setSelectedDate(1);
          }}
        >
          {Array.from({ length: 50 }, (_, i) => 2000 + i).map((y) => (
            <Picker.Item key={y} label={y.toString()} value={y} />
          ))}
        </Picker>

        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <Text style={styles.navText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Dates */}
      <FlatList
        ref={flatListRef}
        data={days}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          const isToday =
            item === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <View style={{ alignItems: "center", marginHorizontal: 5 }}>
              <Text style={styles.weekdayText}>{getWeekday(item)}</Text>
              <TouchableOpacity
                style={[
                  styles.dayBox,
                  selectedDate === item && styles.selectedDay,
                  isToday && styles.today,
                ]}
                onPress={() => handleSelectDate(item)}
              >
                <Text style={styles.dayText}>{item}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        getItemLayout={(data, index) => ({
          length: 60,
          offset: 60 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10, width: screenWidth },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  navButton: {
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 5,
  },
  navText: { color: "white", fontSize: 18, fontWeight: "bold" },
  picker: { flex: 1 },
  dayBox: {
    width: 50,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#222",
  },
  dayText: { color: "white", fontSize: 18 },
  selectedDay: { backgroundColor: "gray" },
  today: { borderWidth: 2, borderColor: "green" },
  weekdayText: { color: "#999", fontSize: 12, marginBottom: 5 },
});

export default HorizontalDatePicker;
