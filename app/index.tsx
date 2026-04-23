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
import api, { setAuthToken } from "./services/api";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/login", { email, password });
      const { token, grade_level } = response.data;
      await setAuthToken(token);

      if (!grade_level) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    } catch (error) {
      Alert.alert("Login Failed", "Invalid email or password.");
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

        {/* Tagline */}
        <Text style={styles.tagline}>
          Your journey to learning starts{" "}
          <Text style={{ color: "#FF6B35" }}>here</Text> ✨
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

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#BEB8D4"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeBtn}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotWrap}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.forgotText}>Forgot Password? 🔑</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.btnLogin}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnLoginText}>Log In 🎓</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={styles.registerWrap}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 8,
  },
  logoIcon: {
    width: 52,
    height: 52,
    backgroundColor: "#FF6B35",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  logoEmoji: { fontSize: 26 },
  logoText: { fontSize: 32, fontWeight: "800", color: "#FF6B35" },

  tagline: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7A7A8C",
    textAlign: "center",
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

  forgotWrap: { alignItems: "flex-end", marginTop: -8, marginBottom: 16 },
  forgotText: { fontSize: 13, fontWeight: "800", color: "#FF6B35" },

  btnLogin: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnLoginText: { color: "white", fontSize: 16, fontWeight: "800" },

  registerWrap: { flexDirection: "row", justifyContent: "center" },
  registerText: { fontSize: 13, color: "#7A7A8C", fontWeight: "700" },
  registerLink: { fontSize: 13, fontWeight: "800", color: "#FF6B35" },
});