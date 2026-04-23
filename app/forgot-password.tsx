import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "./services/api";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/forgot-password", { email });
      Alert.alert(
        "Code Sent! 📧",
        res.data.message || "A reset code has been sent to your email.",
        [
          {
            text: "Enter Code",
            onPress: () =>
              router.push({ pathname: "/reset-password", params: { email } }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🚀</Text>
          </View>
          <Text style={styles.logoText}>EduLift</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔑</Text>
        </View>

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a 6-digit code to reset your password.
        </Text>

        {/* Email */}
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>📧</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#BEB8D4"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={styles.btnSend}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnSendText}>Send Reset Code 📧</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.backWrap}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹ Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 28 },

  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoIcon: {
    width: 42,
    height: 42,
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoEmoji: { fontSize: 20 },
  logoText: { fontSize: 26, fontWeight: "800", color: "#FF6B35" },

  iconWrap: { alignItems: "center", marginBottom: 16 },
  icon: { fontSize: 56 },

  title: {
    fontSize: 24,
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
    lineHeight: 20,
    marginBottom: 28,
  },

  label: { fontSize: 13, fontWeight: "700", color: "#2D2D2D", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E0FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F9F7FF",
    marginBottom: 20,
  },
  inputIcon: { fontSize: 17, marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "600",
    color: "#2D2D2D",
  },

  btnSend: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnSendText: { color: "white", fontSize: 16, fontWeight: "800" },

  backWrap: { alignItems: "center" },
  backText: { fontSize: 13, fontWeight: "800", color: "#7A7A8C" },
});
