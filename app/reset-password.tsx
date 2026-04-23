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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleReset = async () => {
    const token = code.join("");
    if (token.length < 6) {
      Alert.alert("Error", "Please enter the full 6-digit code.");
      return;
    }
    if (!password || !passwordConfirm) {
      Alert.alert("Error", "Please fill in both password fields.");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation: passwordConfirm,
      });
      Alert.alert(
        "Password Reset! 🎉",
        res.data.message || "Your password has been reset successfully.",
        [{ text: "Log In", onPress: () => router.replace("/") }]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Invalid or expired code. Please try again."
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

        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        <Text style={styles.title}>Reset Password</Text>
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

        {/* New Password */}
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 8 characters"
            placeholderTextColor="#BEB8D4"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeBtn}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor="#BEB8D4"
            secureTextEntry={!showPasswordConfirm}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
          />
          <TouchableOpacity onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}>
            <Text style={styles.eyeBtn}>{showPasswordConfirm ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.btnReset}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnResetText}>Reset Password 🔐</Text>
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
    marginBottom: 24,
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

  label: { fontSize: 13, fontWeight: "700", color: "#2D2D2D", marginBottom: 6 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E8E0FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F9F7FF",
    marginBottom: 16,
  },
  inputIcon: { fontSize: 17, marginRight: 8 },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14,
    fontWeight: "600",
    color: "#2D2D2D",
  },
  eyeBtn: { fontSize: 16, padding: 4 },

  btnReset: {
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
  btnResetText: { color: "white", fontSize: 16, fontWeight: "800" },

  backWrap: { alignItems: "center" },
  backText: { fontSize: 13, fontWeight: "800", color: "#7A7A8C" },
});
