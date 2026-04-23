import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email, role } = useLocalSearchParams();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputs = useRef<any[]>([]);

  const handleCodeChange = (val: string, index: number) => {
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const token = code.join("");
    if (token.length < 6) {
      Alert.alert("Error", "Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/verify-email", { email, code: token });

      if (role === "mentor") {
        Alert.alert(
          "Email Verified! ✅",
          "Your email has been verified. Please wait for admin approval before logging in.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      } else {
        // Store token and go to onboarding/dashboard
        const { token: authToken, user } = res.data;
        // Save token - adjust this to match how your app stores auth state
        Alert.alert("Email Verified! ✅", "Your account is ready!", [
          { text: "Continue", onPress: () => router.replace("/onboarding") },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Invalid or expired code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/resend-verification", { email });
      Alert.alert("Code Sent! 📧", "A new verification code has been sent to your email.");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Could not resend code. Please try again."
      );
    } finally {
      setResending(false);
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

        <View style={styles.iconWrap}>
          <Text style={styles.icon}>📧</Text>
        </View>

        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={{ color: "#FF6B35", fontWeight: "800" }}>{email}</Text>
        </Text>

        {/* 6-digit code input */}
        <View style={styles.codeRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
              value={digit}
              onChangeText={(val) => handleCodeChange(val.slice(-1), i)}
              onKeyPress={(e) => handleCodeKeyPress(e, i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={styles.btnVerify}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnVerifyText}>Verify Email ✅</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          style={styles.resendWrap}
          onPress={handleResend}
          disabled={resending}
        >
          {resending ? (
            <ActivityIndicator color="#FF6B35" size="small" />
          ) : (
            <Text style={styles.resendText}>Didn't receive a code? <Text style={styles.resendLink}>Resend</Text></Text>
          )}
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity style={styles.backWrap} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
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
    marginBottom: 24,
  },

  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 28,
  },
  codeInput: {
    width: 46,
    height: 54,
    borderWidth: 2,
    borderColor: "#E8E0FF",
    borderRadius: 12,
    fontSize: 22,
    fontWeight: "800",
    color: "#2D2D2D",
    backgroundColor: "#F9F7FF",
  },
  codeInputFilled: {
    borderColor: "#FF6B35",
    backgroundColor: "#FFF0EB",
  },

  btnVerify: {
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
  btnVerifyText: { color: "white", fontSize: 16, fontWeight: "800" },

  resendWrap: { alignItems: "center", marginBottom: 16 },
  resendText: { fontSize: 13, fontWeight: "600", color: "#7A7A8C" },
  resendLink: { color: "#FF6B35", fontWeight: "800" },

  backWrap: { alignItems: "center" },
  backText: { fontSize: 13, fontWeight: "800", color: "#7A7A8C" },
});
