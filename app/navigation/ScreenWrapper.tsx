import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomLeftDrawer from "../components/CustomLeftDrawer";
import SettingsScreen from "../components/CustomRightDrawer";

export default function ScreenWrapper({ Component }) {
  const [showLeftDrawer, setShowLeftDrawer] = useState(false);
  const [showRightDrawer, setShowRightDrawer] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowLeftDrawer(true)}>
          <Ionicons name="menu" size={28} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowRightDrawer(true)}>
          <Ionicons name="settings-outline" size={24} />
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>
        <Component />
      </View>

      {/* Left Drawer Modal */}
      <Modal visible={showLeftDrawer} animationType="fade" transparent>
        <CustomLeftDrawer onClose={() => setShowLeftDrawer(false)} />
      </Modal>

      {/* Right Drawer Modal */}
      <Modal visible={showRightDrawer} animationType="fade" transparent>
        <SettingsScreen onClose={() => setShowRightDrawer(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
});
