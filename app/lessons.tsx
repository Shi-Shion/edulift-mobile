import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "./services/api";

const SUBJECTS = [
  { label: "All", icon: "📋", color: "#7A7A8C" },
  { label: "Math", icon: "➕", color: "#E53935" },
  { label: "Science", icon: "🔬", color: "#43A047" },
  { label: "English", icon: "📖", color: "#7B1FA2" },
  { label: "Filipino", icon: "🇵🇭", color: "#F4511E" },
];

export default function LessonsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [lessons, setLessons] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<any>(params.subject || "All");

  useEffect(() => {
    fetchUserAndLessons();
  }, []);

  useEffect(() => {
    if (user) fetchLessons();
  }, [activeSubject]);

  const fetchUserAndLessons = async () => {
    try {
      const res = await api.get("/user");
      setUser(res.data);
      console.log("User grade:", res.data.grade_level);
      fetchLessons();
    } catch (error) {
      console.log("Error fetching user:", error);
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeSubject !== "All") params.subject = activeSubject;
      const res = await api.get("/lessons", { params });
      console.log("Lessons count:", res.data.length);
      setLessons(res.data);
    } catch (error: any) {
      console.log("Error fetching lessons:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subject: string) =>
    SUBJECTS.find((s) => s.label === subject)?.color || "#7A7A8C";

  const getSubjectIcon = (subject: string) =>
    SUBJECTS.find((s) => s.label === subject)?.icon || "📚";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Lessons</Text>
          {user?.grade_level && (
            <Text style={styles.headerSub}>{user.grade_level}</Text>
          )}
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Subject Filter */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[
                styles.filterBtn,
                activeSubject === s.label && {
                  backgroundColor: s.color,
                  borderColor: s.color,
                },
              ]}
              onPress={() => setActiveSubject(s.label)}
            >
              <Text style={styles.filterIcon}>{s.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  activeSubject === s.label && { color: "white" },
                ]}
              >
                {s.label === "Araling Panlipunan" ? "Araling" : s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lessons */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      ) : lessons.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>No lessons found</Text>
          <Text style={styles.emptySub}>
            No {activeSubject === "All" ? "" : activeSubject + " "}lessons
            available for {user?.grade_level ?? "your grade"}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.lessonCard}
              onPress={() =>
                router.push({
                  pathname: "/lesson-detail",
                  params: { id: item.id },
                })
              }
            >
              <View
                style={[
                  styles.lessonIconWrap,
                  { backgroundColor: getSubjectColor(item.subject) },
                ]}
              >
                <Text style={styles.lessonIcon}>
                  {getSubjectIcon(item.subject)}
                </Text>
              </View>
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{item.title}</Text>
                <Text style={styles.lessonMeta}>
                  {item.subject} · {item.grade_level}
                </Text>
                {item.description && (
                  <Text style={styles.lessonDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
              <Text style={styles.lessonArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE" },

  header: {
    backgroundColor: "#1A73E8",
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
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "white" },
  headerSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,.8)",
    marginTop: 2,
  },

  filterWrap: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E0FF",
  },
  filterList: { padding: 12, gap: 8, flexDirection: "row" },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: "#E8E0FF",
    backgroundColor: "#F9F7FF",
  },
  filterIcon: { fontSize: 14 },
  filterLabel: { fontSize: 12, fontWeight: "700", color: "#7A7A8C" },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: "600", color: "#7A7A8C" },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#2D2D2D" },
  emptySub: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7A7A8C",
    textAlign: "center",
  },

  listContent: { padding: 16, gap: 12 },
  lessonCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E8E0FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  lessonIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lessonIcon: { fontSize: 24 },
  lessonInfo: { flex: 1 },
  lessonTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 3,
  },
  lessonMeta: {
    fontSize: 11,
    fontWeight: "600",
    color: "#7A7A8C",
    marginBottom: 4,
  },
  lessonDesc: { fontSize: 12, color: "#7A7A8C", lineHeight: 16 },
  lessonArrow: { fontSize: 28, color: "#C4BBDC", fontWeight: "700" },
});
