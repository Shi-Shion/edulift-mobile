import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "./services/api";

const SUBJECT_COLORS: any = {
  Math: "#E53935",
  Science: "#43A047",
  English: "#7B1FA2",
  Filipino: "#F4511E",
  "Araling Panlipunan": "#039BE5",
  MAPEH: "#FB8C00",
};

const SUBJECT_ICONS: any = {
  Math: "➕",
  Science: "🔬",
  English: "📖",
  Filipino: "🇵🇭",
  "Araling Panlipunan": "🌏",
  MAPEH: "🎵",
};

export default function LessonDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${id}`);
      setLesson(response.data);
    } catch (error) {
      console.log("Error fetching lesson:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Lesson not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const subjectColor = SUBJECT_COLORS[lesson.subject] || "#1A73E8";
  const subjectIcon = SUBJECT_ICONS[lesson.subject] || "📚";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: subjectColor, paddingTop: insets.top + 12 },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Lesson
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: subjectColor }]}>
          <View style={styles.heroIconWrap}>
            <Text style={styles.heroIcon}>{subjectIcon}</Text>
          </View>
          <Text style={styles.heroTitle}>{lesson.title}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>📚 {lesson.subject}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>🎓 {lesson.grade_level}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {lesson.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Overview</Text>
            <Text style={styles.sectionText}>{lesson.description}</Text>
          </View>
        )}

        {/* Content */}
        {lesson.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 Lesson Content</Text>
            <Text style={styles.sectionText}>{lesson.content}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btnDone, { backgroundColor: subjectColor }]}
            onPress={() => router.back()}
          >
            <Text style={styles.btnDoneText}>✅ Done</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnDone, { backgroundColor: "#FF6B35" }]}
            onPress={() =>
              router.push({
                pathname: "/quiz",
                params: { lessonId: lesson.id },
              })
            }
          >
            <Text style={styles.btnDoneText}>📝 Take Quiz</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE" },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: "600", color: "#7A7A8C" },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#7A7A8C" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 28, color: "white", fontWeight: "700" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "white" },

  hero: {
    padding: 24,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: "center",
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  heroIcon: { fontSize: 38 },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  heroBadgeRow: { flexDirection: "row", gap: 8 },
  heroBadge: {
    backgroundColor: "rgba(255,255,255,.2)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
  },
  heroBadgeText: { fontSize: 12, fontWeight: "700", color: "white" },

  scroll: { paddingBottom: 40 },

  section: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4A4A4A",
    lineHeight: 22,
  },

  btnRow: { flexDirection: "row", gap: 10, margin: 16 },
  btnDone: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDoneText: { color: "white", fontSize: 16, fontWeight: "800" },
});
