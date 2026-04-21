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

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lessonId } = useLocalSearchParams();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      console.log("=== QUIZ DEBUG ===");
      console.log("lessonId received:", lessonId);
      console.log("Fetching URL:", `/lessons/${lessonId}/quiz`);

      const res = await api.get(`/lessons/${lessonId}/quiz`);

      console.log("Quiz response status:", res.status);
      console.log("Quiz response data:", JSON.stringify(res.data));

      setQuiz(res.data);
    } catch (error: any) {
      console.log("Quiz fetch error status:", error.response?.status);
      console.log("Quiz fetch error data:", JSON.stringify(error.response?.data));
      console.log("Quiz fetch error message:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev: any) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (current < quiz.questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${quiz.id}/submit`, { answers });
      setResult(res.data);
    } catch (error: any) {
      console.log("Submit error:", error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>
            No quiz available for this lesson yet.
          </Text>
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => router.back()}
          >
            <Text style={styles.btnBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Results screen
  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 12,
              backgroundColor: result.passed ? "#00C9A7" : "#FF4757",
            },
          ]}
        >
          <View style={{ width: 36 }} />
          <Text style={styles.headerTitle}>Quiz Results</Text>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView contentContainerStyle={styles.resultScroll}>
          {/* Score Card */}
          <View
            style={[
              styles.scoreCard,
              { borderColor: result.passed ? "#00C9A7" : "#FF4757" },
            ]}
          >
            <Text style={styles.scoreEmoji}>{result.passed ? "🎉" : "😔"}</Text>
            <Text style={styles.scoreTitle}>
              {result.passed ? "You Passed!" : "Keep Trying!"}
            </Text>
            <Text
              style={[
                styles.scoreValue,
                { color: result.passed ? "#00C9A7" : "#FF4757" },
              ]}
            >
              {result.percentage}%
            </Text>
            <Text style={styles.scoreSub}>
              {result.score} out of {result.total} correct
            </Text>
            <View
              style={[
                styles.passBadge,
                { backgroundColor: result.passed ? "#E6FAF6" : "#FFE8E8" },
              ]}
            >
              <Text
                style={[
                  styles.passBadgeText,
                  { color: result.passed ? "#00A388" : "#FF4757" },
                ]}
              >
                {result.passed ? "✅ Passed" : "❌ Failed"} — Passing score:{" "}
                {quiz.passing_score}%
              </Text>
            </View>
          </View>

          {/* Review Answers */}
          <Text style={styles.reviewTitle}>📋 Answer Review</Text>
          {result.results.map((r: any, i: number) => (
            <View
              key={r.question_id}
              style={[
                styles.reviewCard,
                { borderLeftColor: r.is_correct ? "#00C9A7" : "#FF4757" },
              ]}
            >
              <Text style={styles.reviewQ}>
                Q{i + 1}. {r.question}
              </Text>
              <Text
                style={[
                  styles.reviewA,
                  { color: r.is_correct ? "#00A388" : "#FF4757" },
                ]}
              >
                {r.is_correct ? "✅" : "❌"} Your answer:{" "}
                {r.user_answer ?? "No answer"}
              </Text>
              {!r.is_correct && (
                <Text style={styles.reviewCorrect}>
                  Correct answer: {r.correct_answer}
                </Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.btnDone}
            onPress={() => router.back()}
          >
            <Text style={styles.btnDoneText}>Back to Lesson</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz screen
  const question = quiz.questions[current];
  const totalQ = quiz.questions.length;
  const progress = ((current + 1) / totalQ) * 100;
  const isTF = question.type === "true_false";
  const options = isTF
    ? [
        { key: "A", label: question.option_a },
        { key: "B", label: question.option_b },
      ]
    : [
        { key: "A", label: question.option_a },
        { key: "B", label: question.option_b },
        { key: "C", label: question.option_c },
        { key: "D", label: question.option_d },
      ];

  const selectedAnswer = answers[question.id];
  const allAnswered = quiz.questions.every((q: any) => answers[q.id]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quiz.title}</Text>
        <Text style={styles.headerCount}>
          {current + 1}/{totalQ}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressWrap}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionBadge}>
            {isTF ? "True or False" : "Multiple Choice"}
          </Text>
          <Text style={styles.questionText}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsWrap}>
          {options.map((opt) =>
            opt.label ? (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionBtn,
                  selectedAnswer === opt.key && styles.optionBtnSelected,
                ]}
                onPress={() => handleAnswer(question.id, opt.key)}
              >
                <View
                  style={[
                    styles.optionKey,
                    selectedAnswer === opt.key && styles.optionKeySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionKeyText,
                      selectedAnswer === opt.key && { color: "white" },
                    ]}
                  >
                    {opt.key}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedAnswer === opt.key && styles.optionLabelSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ) : null,
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.btnNav, current === 0 && styles.btnNavDisabled]}
            onPress={handlePrev}
            disabled={current === 0}
          >
            <Text style={styles.btnNavText}>‹ Prev</Text>
          </TouchableOpacity>

          {current < totalQ - 1 ? (
            <TouchableOpacity style={styles.btnNav} onPress={handleNext}>
              <Text style={styles.btnNavText}>Next ›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.btnSubmit,
                !allAnswered && styles.btnSubmitDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              <Text style={styles.btnSubmitText}>
                {submitting ? "Submitting..." : "Submit Quiz ✅"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Answer dots */}
        <View style={styles.dotsRow}>
          {quiz.questions.map((_: any, i: number) => (
            <TouchableOpacity key={i} onPress={() => setCurrent(i)}>
              <View
                style={[
                  styles.dot,
                  i === current && styles.dotActive,
                  answers[quiz.questions[i].id] && styles.dotAnswered,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },

  header: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 12,
  },
  backIcon: { fontSize: 28, color: "white", fontWeight: "700" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  headerCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,.8)",
  },

  progressWrap: { height: 6, backgroundColor: "#E8E0FF" },
  progressFill: { height: 6, backgroundColor: "#FF6B35" },

  scroll: { padding: 16, paddingBottom: 40 },

  questionCard: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  questionBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FF6B35",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D2D2D",
    lineHeight: 24,
  },

  optionsWrap: { gap: 10, marginBottom: 20 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "#E8E0FF",
  },
  optionBtnSelected: { borderColor: "#FF6B35", backgroundColor: "#FFF0EB" },
  optionKey: {
    width: 34,
    height: 34,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: "#E8E0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  optionKeySelected: { backgroundColor: "#FF6B35", borderColor: "#FF6B35" },
  optionKeyText: { fontSize: 14, fontWeight: "800", color: "#7A7A8C" },
  optionLabel: { fontSize: 14, fontWeight: "600", color: "#2D2D2D", flex: 1 },
  optionLabelSelected: { color: "#FF6B35", fontWeight: "800" },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  btnNav: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E8E0FF",
    backgroundColor: "white",
  },
  btnNavDisabled: { opacity: 0.4 },
  btnNavText: { fontSize: 14, fontWeight: "800", color: "#7A7A8C" },
  btnSubmit: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: "#FF6B35",
  },
  btnSubmitDisabled: { opacity: 0.5 },
  btnSubmitText: { fontSize: 14, fontWeight: "800", color: "white" },

  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 99, backgroundColor: "#E8E0FF" },
  dotActive: { backgroundColor: "#FF6B35", width: 24 },
  dotAnswered: { backgroundColor: "#00C9A7" },

  loadingText: { fontSize: 14, fontWeight: "600", color: "#7A7A8C" },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A7A8C",
    textAlign: "center",
  },

  btnBack: {
    marginTop: 12,
    backgroundColor: "#FF6B35",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  btnBackText: { color: "white", fontWeight: "800", fontSize: 14 },

  resultScroll: { padding: 16, paddingBottom: 40 },
  scoreCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
  },
  scoreEmoji: { fontSize: 52, marginBottom: 8 },
  scoreTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 8,
  },
  scoreValue: { fontSize: 48, fontWeight: "800", marginBottom: 4 },
  scoreSub: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7A7A8C",
    marginBottom: 12,
  },
  passBadge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99 },
  passBadgeText: { fontSize: 13, fontWeight: "800" },

  reviewTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2D2D2D",
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  reviewQ: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2D2D2D",
    marginBottom: 6,
  },
  reviewA: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  reviewCorrect: { fontSize: 12, fontWeight: "600", color: "#7A7A8C" },

  btnDone: {
    backgroundColor: "#FF6B35",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  btnDoneText: { color: "white", fontSize: 16, fontWeight: "800" },
});