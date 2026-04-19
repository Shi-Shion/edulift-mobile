import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api, { setAuthToken } from "./services/api";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await api.get("/user");
      setUser(userRes.data);
      
      // Fetch quiz stats
      try {
        const statsRes = await api.get("/quiz-stats");
        setStats(statsRes.data);
      } catch (e) {
        console.log("Stats error:", e);
      }
      
      // Fetch recent lessons
      try {
        const lessonsRes = await api.get("/lessons");
        setLessons(lessonsRes.data.slice(0, 3));
      } catch (e) {
        console.log("Lessons error:", e);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post("/logout");
          } catch (error) {
            // continue even if API fails
          } finally {
            setAuthToken("");
            router.replace("/");
          }
        },
      },
    ]);
  };

  const handleSubjectPress = (subject: string) => {
    router.push({
      pathname: "/lessons",
      params: { subject },
    });
  };

  const SUBJECT_COLORS: any = {
    Math: "#E53935",
    Science: "#43A047",
    English: "#7B1FA2",
    Filipino: "#F4511E",
  };

  const SUBJECT_ICONS: any = {
    Math: "➕",
    Science: "🔬",
    English: "📖",
    Filipino: "🇵🇭",
  };

  const subjects = [
    { label: "Math", icon: "➕", color: "#E53935" },
    { label: "Science", icon: "🔬", color: "#43A047" },
    { label: "English", icon: "📖", color: "#7B1FA2" },
    { label: "Filipino", icon: "🇵🇭", color: "#F4511E" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerName}>{user?.name ?? "Learner"} 👋</Text>
          <Text style={styles.headerSub}>{getGreeting()}!</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.avatarText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress Banner */}
        <View style={styles.progressBanner}>
          <Text style={styles.progressLabel}>Weekly Learning Progress</Text>
          <Text style={styles.progressTitle}>
            Keep it up! You're doing great 🎯
          </Text>
          <View style={styles.progressBarWrap}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
            <Text style={styles.progressText}>42%</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statValue}>{lessons.length}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statValue}>{stats?.passed_quizzes ?? 0}</Text>
            <Text style={styles.statLabel}>Quizzes Passed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{stats?.average_score ?? 0}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Subjects */}
        <Text style={styles.sectionTitle}>📖 Subjects</Text>
        <View style={styles.subjectGrid}>
          {subjects.map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.subjectBtn, { backgroundColor: s.color }]}
              onPress={() => handleSubjectPress(s.label)}
            >
              <Text style={styles.subjectIcon}>{s.icon}</Text>
              <Text style={styles.subjectLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Learning */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>▶️ Continue Learning</Text>
          <TouchableOpacity onPress={() => router.push("/lessons")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {lessons.map((l) => (
          <TouchableOpacity
            key={l.id}
            style={styles.lessonItem}
            onPress={() => router.push({ pathname: "/lesson-detail", params: { id: l.id } })}
          >
            <View style={[styles.lessonIcon, { backgroundColor: SUBJECT_COLORS[l.subject] + "20" }]}>
              <Text style={styles.lessonIconText}>{SUBJECT_ICONS[l.subject] || "📚"}</Text>
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{l.title}</Text>
              <Text style={styles.lessonMeta}>{l.subject} · {l.grade_level}</Text>
            </View>
            <Text style={styles.lessonArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Upcoming Quiz */}
        <TouchableOpacity style={styles.quizCard} onPress={() => router.push("/quizzes")}>
          <Text style={styles.quizLabel}>📅 Quiz History</Text>
          <Text style={styles.quizTitle}>
            {stats?.total_quizzes ?? 0} Quiz{(stats?.total_quizzes ?? 0) !== 1 ? "zes" : ""} Taken
          </Text>
          <Text style={styles.quizMeta}>
            {stats?.passed_quizzes ?? 0} passed · {(stats?.average_score ?? 0)}% average
          </Text>
          <TouchableOpacity style={styles.btnQuiz}>
            <Text style={styles.btnQuizText}>View All</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Mentor */}
        <View style={styles.mentorCard}>
          <Text style={styles.mentorCardTitle}>🧑‍🏫 My Mentor</Text>
          {user?.mentor ? (
            <>
              <View style={styles.mentorRow}>
                <View style={styles.mentorAvatar}>
                  <Text style={styles.mentorAvatarText}>🧑‍🏫</Text>
                </View>
                <View>
                  <Text style={styles.mentorName}>{user.mentor.name}</Text>
                  <Text style={styles.mentorSub}>{user.mentor.email}</Text>
                </View>
              </View>
              <Text style={[styles.onlineBadge, { color: user.mentor.is_online ? "#34A853" : "#7A7A8C" }]}>
                {user.mentor.is_online ? "🟢 Online now" : "⚫ Offline"}
              </Text>
              <TouchableOpacity
                style={styles.btnMsg}
                onPress={() => router.push("/mentor-chat")}
              >
                <Text style={styles.btnMsgText}>💬 Send Message</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ alignItems: "center", padding: 16 }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🧑‍🏫</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#7A7A8C", textAlign: "center" }}>
                No mentor assigned yet.{"\n"}Please wait for an admin to assign one.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 10 }]}>
        {[
          // REPLACE WITH:
          { icon: "🏠", label: "Home" },
          { icon: "📚", label: "Lessons" },
          { icon: "📝", label: "Quizzes" },
          { icon: "💬", label: "Chat" },
          { icon: "🚪", label: "Logout" },
        ].map((n) => (
          <TouchableOpacity
            key={n.label}
            style={styles.navBtn}
            onPress={
              n.label === "Logout"
                ? handleLogout
                : n.label === "Lessons"
                  ? () => router.push("/lessons")
                  : n.label === "Quizzes"
                    ? () => router.push("/quizzes")
                    : n.label === "Chat"
                      ? () => router.push("/mentor-chat")
                      : undefined
            }
          >
            <Text
              style={[
                styles.navIcon,
                n.label === "Logout" && { color: "#E53935" },
              ]}
            >
              {n.icon}
            </Text>
            <Text
              style={[
                styles.navLabel,
                n.label === "Home" && styles.navLabelActive,
                n.label === "Logout" && styles.navLabelLogout,
              ]}
            >
              {n.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },

  header: {
    backgroundColor: "#1A73E8",
    padding: 20,
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerName: { fontSize: 16, fontWeight: "700", color: "white" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,.8)" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,.2)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifIcon: { fontSize: 17 },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: "#FFD93D",
    borderRadius: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,.2)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18 },

  scroll: { flex: 1 },

  progressBanner: {
    margin: 14,
    backgroundColor: "#1558B0",
    borderRadius: 14,
    padding: 16,
  },
  progressLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,.8)",
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    marginBottom: 10,
  },
  progressBarWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBar: {
    flex: 1,
    height: 7,
    backgroundColor: "rgba(255,255,255,.2)",
    borderRadius: 99,
  },
  progressFill: {
    width: "42%",
    height: "100%",
    backgroundColor: "#FFD93D",
    borderRadius: 99,
  },
  progressText: { fontSize: 12, fontWeight: "700", color: "white" },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: "#202124" },
  statLabel: { fontSize: 10, color: "#5F6368", textAlign: "center" },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202124",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  seeAll: { fontSize: 12, fontWeight: "600", color: "#1A73E8" },

  subjectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 20,
  },
  subjectBtn: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  subjectIcon: { fontSize: 20 },
  subjectLabel: { fontSize: 13, fontWeight: "600", color: "white" },

  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "white",
    marginHorizontal: 14,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DADCE0",
  },
  lessonIcon: {
    width: 42,
    height: 42,
    backgroundColor: "#E8F0FE",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonIconText: { fontSize: 20 },
  lessonInfo: { flex: 1 },
  lessonTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 3,
  },
  lessonMeta: { fontSize: 11, color: "#5F6368" },
  lessonProg: { alignItems: "flex-end" },
  lessonPct: { fontSize: 12, fontWeight: "700", color: "#1A73E8" },
  lessonBar: {
    width: 50,
    height: 5,
    backgroundColor: "#E8F0FE",
    borderRadius: 99,
    marginTop: 4,
    overflow: "hidden",
  },
  lessonBarFill: {
    height: "100%",
    backgroundColor: "#1A73E8",
    borderRadius: 99,
  },
  lessonArrow: { fontSize: 24, color: "#C4BBDC", fontWeight: "700" },

  quizCard: {
    margin: 14,
    backgroundColor: "#1A73E8",
    borderRadius: 14,
    padding: 16,
  },
  quizLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,.8)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  quizTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  quizMeta: { fontSize: 11, color: "rgba(255,255,255,.8)", marginBottom: 14 },
  btnQuiz: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  btnQuizText: { fontSize: 12, fontWeight: "700", color: "#1A73E8" },

  mentorCard: {
    margin: 14,
    marginTop: 0,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DADCE0",
    marginBottom: 24,
  },
  mentorCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 12,
  },
  mentorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  mentorAvatar: {
    width: 44,
    height: 44,
    backgroundColor: "#E8F0FE",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  mentorAvatarText: { fontSize: 22 },
  mentorName: { fontSize: 13, fontWeight: "700", color: "#202124" },
  mentorSub: { fontSize: 11, color: "#5F6368" },
  onlineBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#34A853",
    marginBottom: 12,
  },
  btnMsg: {
    backgroundColor: "#1A73E8",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  btnMsgText: { fontSize: 13, fontWeight: "700", color: "white" },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#DADCE0",
    paddingVertical: 10,
  },
  navBtn: { flex: 1, alignItems: "center", gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, fontWeight: "600", color: "#5F6368" },
  navLabelActive: { color: "#1A73E8" },
  navLabelLogout: { color: "#E53935" },
});
