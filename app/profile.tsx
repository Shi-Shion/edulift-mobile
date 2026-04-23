import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "./services/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await api.get("/user");
      setUser(response.data);
    } catch (error) {
      console.log("Error fetching user:", error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchUser(true);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B35"]}
            tintColor="#FF6B35"
          />
        }
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.avatarName}>{user?.name}</Text>
          <Text style={styles.avatarEmail}>{user?.email}</Text>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeBadgeText}>
              🎓 {user?.grade_level || "No grade set"}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📧</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Grade Level Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Education</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📚</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Grade Level</Text>
              <Text style={styles.infoValue}>
                {user?.grade_level || "Not set"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.changeGradeBtn}
            onPress={() => router.push("/onboarding")}
          >
            <Text style={styles.changeGradeBtnText}>✏️ Change Grade Level</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE" },

  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    backgroundColor: "#FF6B35",
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

  scroll: { padding: 20, paddingBottom: 40 },

  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarEmoji: { fontSize: 44 },
  avatarName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 4,
  },
  avatarEmail: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7A7A8C",
    marginBottom: 10,
  },
  gradeBadge: {
    backgroundColor: "#F3EEFF",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: "#E8E0FF",
  },
  gradeBadgeText: { fontSize: 13, fontWeight: "800", color: "#845EC2" },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F0EBFF",
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#7A7A8C",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  infoIcon: { fontSize: 20, width: 28, textAlign: "center" },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7A7A8C",
    marginBottom: 2,
  },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#2D2D2D" },

  divider: { height: 1, backgroundColor: "#F0EBFF", marginVertical: 10 },

  changeGradeBtn: {
    backgroundColor: "#F3EEFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E0FF",
    marginTop: 4,
  },
  changeGradeBtnText: { fontSize: 13, fontWeight: "800", color: "#845EC2" },
});
