import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
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
};

const SUBJECT_ICONS: any = {
  Math: "➕",
  Science: "🔬",
  English: "📖",
  Filipino: "🇵🇭",
};

export default function QuizzesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resultsRes, statsRes] = await Promise.all([
        api.get("/quiz-results"),
        api.get("/quiz-stats"),
      ]);
      setResults(resultsRes.data);
      setStats(statsRes.data);
    } catch (error: any) {
      console.log("Error fetching quiz data:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderHeader = () => (
    <View>
      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "#E53935" }]}>
          <Text style={styles.statValue}>{stats?.total_quizzes ?? 0}</Text>
          <Text style={styles.statLabel}>Quizzes Taken</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#43A047" }]}>
          <Text style={styles.statValue}>{stats?.passed_quizzes ?? 0}</Text>
          <Text style={styles.statLabel}>Passed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#7B1FA2" }]}>
          <Text style={styles.statValue}>{stats?.average_score ?? 0}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>📋 Quiz History</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={{ width: 36 }} />
          <Text style={styles.headerTitle}>My Quizzes</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>My Quizzes</Text>
        <View style={{ width: 36 }} />
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No quizzes taken yet</Text>
          <Text style={styles.emptySub}>
            Complete lessons and take quizzes to see your history here!
          </Text>
          <TouchableOpacity
            style={styles.btnLessons}
            onPress={() => router.push("/lessons")}
          >
            <Text style={styles.btnLessonsText}>Browse Lessons</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const subjectColor = SUBJECT_COLORS[item.subject] || "#1A73E8";
            const subjectIcon = SUBJECT_ICONS[item.subject] || "📚";
            
            return (
              <View style={styles.resultCard}>
                <View style={[styles.resultIcon, { backgroundColor: subjectColor }]}>
                  <Text style={styles.resultIconText}>{subjectIcon}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle}>{item.lesson_title || item.quiz_title}</Text>
                  <Text style={styles.resultMeta}>
                    {item.subject} • {formatDate(item.created_at)}
                  </Text>
                </View>
                <View style={styles.resultScore}>
                  <Text
                    style={[
                      styles.scoreValue,
                      { color: item.passed ? "#43A047" : "#E53935" },
                    ]}
                  >
                    {item.percentage}%
                  </Text>
                  <Text style={styles.scoreLabel}>
                    {item.passed ? "✅ Passed" : "❌ Failed"}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 14, fontWeight: "600", color: "#7A7A8C" },

  header: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "white" },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "white" },
  statLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,.8)", marginTop: 2 },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202124",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#2D2D2D" },
  emptySub: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7A7A8C",
    textAlign: "center",
    lineHeight: 20,
  },
  btnLessons: {
    marginTop: 8,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  btnLessonsText: { color: "white", fontWeight: "800", fontSize: 14 },

  listContent: { paddingBottom: 24 },

  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E0FF",
    gap: 12,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  resultIconText: { fontSize: 20 },
  resultInfo: { flex: 1 },
  resultTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D2D2D",
    marginBottom: 3,
  },
  resultMeta: { fontSize: 11, color: "#7A7A8C" },
  resultScore: { alignItems: "flex-end" },
  scoreValue: { fontSize: 16, fontWeight: "800" },
  scoreLabel: { fontSize: 10, fontWeight: "600", color: "#7A7A8C" },
});
