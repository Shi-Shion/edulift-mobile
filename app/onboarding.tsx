import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "./services/api";

const LEVELS = [
  {
    label: "Elementary",
    icon: "🏫",
    color: "#FF6B35",
    sub: "Grades 1–6",
  },
  {
    label: "Secondary",
    icon: "🎓",
    color: "#845EC2",
    sub: "Grades 7–10",
  },
  {
    label: "Senior High School",
    icon: "🏛️",
    color: "#00C9A7",
    sub: "Grades 11–12",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentLevel = LEVELS.find((l) => l.label === selectedLevel);

  const handleSave = async () => {
    if (!selectedLevel) {
      Alert.alert("Please select your education level.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/onboarding", { grade_level: selectedLevel });
      router.replace("/dashboard");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🚀</Text>
          </View>
          <Text style={styles.logoText}>EduLift</Text>
        </View>

        <Text style={styles.title}>Welcome! 👋</Text>
        <Text style={styles.subtitle}>
          Let's set up your profile.{"\n"}Select your education level to get started.
        </Text>

        {/* Select Education Level */}
        <Text style={styles.stepLabel}>Select Your Education Level</Text>
        <View style={styles.levelRow}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.label}
              style={[
                styles.levelCard,
                selectedLevel === level.label && {
                  borderColor: level.color,
                  backgroundColor: level.color + "15",
                },
              ]}
              onPress={() => setSelectedLevel(level.label)}
            >
              <Text style={styles.levelIcon}>{level.icon}</Text>
              <Text
                style={[
                  styles.levelLabel,
                  selectedLevel === level.label && { color: level.color },
                ]}
              >
                {level.label}
              </Text>
              <Text style={styles.levelSub}>{level.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm Button */}
        {selectedLevel && (
          <TouchableOpacity
            style={[styles.btnConfirm, { backgroundColor: currentLevel?.color || "#FF6B35" }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.btnConfirmText}>
                Let's Start Learning! 🚀
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE" },
  scroll: { padding: 24, paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    gap: 10,
  },
  logoIcon: {
    width: 44,
    height: 44,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: { fontSize: 22 },
  logoText: { fontSize: 28, fontWeight: "800", color: "#FF6B35" },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2D2D2D",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7A7A8C",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },

  stepLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  levelRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  levelCard: {
    width: "47%",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E8E0FF",
    backgroundColor: "#F9F7FF",
  },
  levelIcon: { fontSize: 32, marginBottom: 8 },
  levelLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 4,
    textAlign: "center",
  },
  levelSub: { fontSize: 11, fontWeight: "600", color: "#7A7A8C" },

  btnConfirm: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  btnConfirmText: { color: "white", fontSize: 16, fontWeight: "800" },
});