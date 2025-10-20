# Healthy Diet Tracker App

A cross-platform mobile application built with **React Native** and **Expo**, powered by an **Express/MongoDB** backend. This tool is designed to help nutrition businesses efficiently manage meal delivery, track daily customer delivery status, and automate monthly bill generation.

---

## Key Features

The application is structured around a few core flows to streamline your business operations:

### 1. Daily Delivery Management
- **Main Dashboard**: Displays a clear, concise list of **Today's Deliveries**.
- **Date Picker**: An upper **Calendar component** allows users to easily view and fetch delivery data for any specific past or future date.
- **Mark Deliveries**: A dedicated button/view allows staff to **mark today's deliveries** with a simple **tick (delivered)** or **cross (absent)** status.

### 2. Customer Management
- **Add/Edit/Delete** comprehensive customer profiles.
- **View All Customers**: A dedicated section to display and manage all customer data.
- **Detailed Customer History**: A dedicated screen for each customer featuring:
    - A **full calendar view** showing all past delivery dates marked with $\checkmark$ (delivered) or $\times$ (absent).
    - **Delivery Statistics** presented at the bottom, including the **number of days delivered** and the **number of days absent**.

### 3. Financial & Reporting
- **Monthly Bill Generation**: Automatically generate accurate monthly bills based on the delivery data tracked.
- **Customer Sorting/Filtering**: Ability to sort and view customers by date (e.g., date of joining, upcoming delivery date).

### 4. Technical Features
- **Authentication**: Secure login and access via Email/Password (Firebase or custom JWT).
- **Responsive UI**: Intuitive and highly responsive user interface for a seamless cross-platform experience.

---

## Tech Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React Native, Expo, React Navigation |
| **State Management** | Redux or Context API |
| **Backend** | Express.js, Node.js, Mongoose |
| **Database** | MongoDB |
| **Authentication** | Firebase or Custom JWT |