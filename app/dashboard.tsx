import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api, { pingOnline, setAuthToken } from "./services/api";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pingInterval = useRef<any>(null);

  useEffect(() => {
    fetchData();

    pingOnline();
    pingInterval.current = setInterval(() => {
      pingOnline();
    }, 3 * 60 * 1000);

    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
    };
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const userRes = await api.get("/user");
      setUser(userRes.data);

      try {
        const statsRes = await api.get("/quiz-stats");
        setStats(statsRes.data);
      } catch (e) {
        console.log("Stats error:", e);
      }

      try {
        const lessonsRes = await api.get("/lessons");
        setTotalLessons(lessonsRes.data.length);
        setLessons(lessonsRes.data.slice(0, 3));
      } catch (e) {
        console.log("Lessons error:", e);
      }

      try {
        const notifRes = await api.get("/notifications");
        setNotifications(notifRes.data.notifications);
        setUnreadCount(notifRes.data.unread_count);
      } catch (e) {
        console.log("Notifications error:", e);
      }
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    if (unreadCount > 0) {
      try {
        await api.patch("/notifications/read-all");
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (e) {
        console.log("Mark read error:", e);
      }
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
            if (pingInterval.current) clearInterval(pingInterval.current);
            setAuthToken("");
            router.replace("/");
          }
        },
      },
    ]);
  };

  const handleSubjectPress = (subject: string) => {
    router.push({ pathname: "/lessons", params: { subject } });
  };

  const SUBJECT_COLORS: any = {
    Math: "#E53935",
    Science: "#43A047",
    English: "#7B1FA2",
    Filipino: "#F4511E",
    MAPEH: "#FF9800",
    "Araling Panlipunan": "#0277BD",
    TLE: "#6D4C41",
    "Values Education": "#E91E63",
  };

  const SUBJECT_ICONS: any = {
    Math: "➕",
    Science: "🔬",
    English: "📖",
    Filipino: "🇵🇭",
    MAPEH: "🎨",
    "Araling Panlipunan": "🌍",
    TLE: "🔧",
    "Values Education": "❤️",
  };

  const subjects = [
    { label: "Math", icon: "➕", color: "#E53935" },
    { label: "Science", icon: "🔬", color: "#43A047" },
    { label: "English", icon: "📖", color: "#7B1FA2" },
    { label: "Filipino", icon: "🇵🇭", color: "#F4511E" },
    { label: "MAPEH", icon: "🎨", color: "#FF9800" },
    { label: "Araling Panlipunan", icon: "🌍", color: "#0277BD" },
    { label: "TLE", icon: "🔧", color: "#6D4C41" },
    { label: "Values Education", icon: "❤️", color: "#E91E63" },
  ];

  const getNotifIcon = (type: string) => {
    if (type === "message") return "💬";
    if (type === "quiz") return "📝";
    if (type === "mentor_assigned") return "🧑‍🏫";
    return "🔔";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerName}>{user?.name ?? "Learner"} 👋</Text>
          <Text style={styles.headerSub}>{getGreeting()}!</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifBtn} onPress={handleOpenNotifications}>
            <Text style={styles.notifIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.avatarText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🔔 Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {notifications.length === 0 ? (
                <View style={styles.emptyNotif}>
                  <Text style={styles.emptyNotifIcon}>🔕</Text>
                  <Text style={styles.emptyNotifText}>No notifications yet</Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <View
                    key={n.id}
                    style={[styles.notifItem, !n.is_read && styles.notifItemUnread]}
                  >
                    <Text style={styles.notifItemIcon}>{getNotifIcon(n.type)}</Text>
                    <View style={styles.notifItemContent}>
                      <Text style={styles.notifItemTitle}>{n.title}</Text>
                      <Text style={styles.notifItemBody}>{n.body}</Text>
                      <Text style={styles.notifItemTime}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    {!n.is_read && <View style={styles.notifUnreadDot} />}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1A73E8"]}
            tintColor="#1A73E8"
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statValue}>{totalLessons}</Text>
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
            <View style={[styles.lessonIcon, { backgroundColor: (SUBJECT_COLORS[l.subject] || "#1A73E8") + "20" }]}>
              <Text style={styles.lessonIconText}>{SUBJECT_ICONS[l.subject] || "📚"}</Text>
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{l.title}</Text>
              <Text style={styles.lessonMeta}>{l.subject} · {l.grade_level}</Text>
            </View>
            <Text style={styles.lessonArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Quiz Card */}
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
            <Text style={[styles.navIcon, n.label === "Logout" && { color: "#E53935" }]}>
              {n.icon}
            </Text>
            <Text style={[
              styles.navLabel,
              n.label === "Home" && styles.navLabelActive,
              n.label === "Logout" && styles.navLabelLogout,
            ]}>
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
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF4757",
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notifBadgeText: { fontSize: 9, fontWeight: "800", color: "white" },
  avatar: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,.2)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EBFF",
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#2D2D2D" },
  modalClose: { fontSize: 18, color: "#7A7A8C", fontWeight: "700" },
  emptyNotif: { alignItems: "center", padding: 40 },
  emptyNotifIcon: { fontSize: 40, marginBottom: 10 },
  emptyNotifText: { fontSize: 14, fontWeight: "700", color: "#7A7A8C" },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F9F7FF",
    gap: 12,
  },
  notifItemUnread: { backgroundColor: "#F0F7FF" },
  notifItemIcon: { fontSize: 24, width: 32, textAlign: "center" },
  notifItemContent: { flex: 1 },
  notifItemTitle: { fontSize: 13, fontWeight: "800", color: "#2D2D2D", marginBottom: 3 },
  notifItemBody: { fontSize: 12, fontWeight: "600", color: "#7A7A8C", lineHeight: 18 },
  notifItemTime: { fontSize: 10, color: "#BEB8D4", marginTop: 4 },
  notifUnreadDot: {
    width: 8,
    height: 8,
    backgroundColor: "#1A73E8",
    borderRadius: 4,
    marginTop: 6,
  },

  scroll: { flex: 1 },

  statsRow: { flexDirection: "row", gap: 10, padding: 14, marginBottom: 6 },
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

  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#202124", paddingHorizontal: 14, marginBottom: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  seeAll: { fontSize: 12, fontWeight: "600", color: "#1A73E8" },

  subjectGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, gap: 10, marginBottom: 20 },
  subjectBtn: { width: "47%", flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12 },
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
  lessonIcon: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  lessonIconText: { fontSize: 20 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 13, fontWeight: "600", color: "#202124", marginBottom: 3 },
  lessonMeta: { fontSize: 11, color: "#5F6368" },
  lessonArrow: { fontSize: 24, color: "#C4BBDC", fontWeight: "700" },

  quizCard: { margin: 14, backgroundColor: "#1A73E8", borderRadius: 14, padding: 16 },
  quizLabel: { fontSize: 10, color: "rgba(255,255,255,.8)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 },
  quizTitle: { fontSize: 14, fontWeight: "700", color: "white", marginBottom: 4 },
  quizMeta: { fontSize: 11, color: "rgba(255,255,255,.8)", marginBottom: 14 },
  btnQuiz: { backgroundColor: "white", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20, alignSelf: "flex-start" },
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
  mentorCardTitle: { fontSize: 13, fontWeight: "700", color: "#202124", marginBottom: 12 },
  mentorRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  mentorAvatar: { width: 44, height: 44, backgroundColor: "#E8F0FE", borderRadius: 22, alignItems: "center", justifyContent: "center" },
  mentorAvatarText: { fontSize: 22 },
  mentorName: { fontSize: 13, fontWeight: "700", color: "#202124" },
  mentorSub: { fontSize: 11, color: "#5F6368" },
  onlineBadge: { fontSize: 11, fontWeight: "600", color: "#34A853", marginBottom: 12 },
  btnMsg: { backgroundColor: "#1A73E8", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  btnMsgText: { fontSize: 13, fontWeight: "700", color: "white" },

  bottomNav: { flexDirection: "row", backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#DADCE0", paddingVertical: 10 },
  navBtn: { flex: 1, alignItems: "center", gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, fontWeight: "600", color: "#5F6368" },
  navLabelActive: { color: "#1A73E8" },
  navLabelLogout: { color: "#E53935" },
});
