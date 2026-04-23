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

const EDUCATION_LEVELS = ["College Undergraduate", "College Graduate"];

export default function RegisterScreen() {
  const router = useRouter();

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [role, setRole] = useState<"learner" | "mentor">("learner");

  // Mentor-only fields
  const [age, setAge] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [course, setCourse] = useState("");
  const [showEduDropdown, setShowEduDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirm) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password.length < 8 || password.length > 12) {
      Alert.alert("Error", "Password must be 8–12 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (role === "mentor") {
      if (!age || !educationLevel || !course) {
        Alert.alert("Error", "Please fill in all mentor fields.");
        return;
      }
      if (isNaN(Number(age)) || Number(age) < 18) {
        Alert.alert("Error", "Please enter a valid age (18 or older).");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        name,
        email,
        password,
        password_confirmation: passwordConfirm,
        role,
      };

      if (role === "mentor") {
        payload.age = age;
        payload.education_level = educationLevel;
        payload.course = course;
      }

      await api.post("/register", payload);

      if (role === "mentor") {
        Alert.alert(
          "Application Submitted! 📋",
          "Your mentor application is pending admin approval. You'll be able to log in once approved.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      } else {
        Alert.alert(
          "Registration Successful! 🎉",
          "Your account has been created. You can now log in.",
          [{ text: "Log In", onPress: () => router.replace("/") }]
        );
      }
    } catch (error: any) {
      console.log("Registration error:", error.response?.data);
      Alert.alert(
        "Registration Failed",
        error.response?.data?.message ||
          JSON.stringify(error.response?.data?.errors) ||
          "Please try again."
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

        {/* Tagline */}
        <Text style={styles.tagline}>
          Join EduLift and start learning{" "}
          <Text style={{ color: "#FF6B35" }}>today</Text> ✨
        </Text>

        {/* Role Toggle */}
        <Text style={styles.label}>I am signing up as a...</Text>
        <View style={styles.roleToggleWrap}>
          <TouchableOpacity
            style={[styles.roleBtn, role === "learner" && styles.roleBtnActive]}
            onPress={() => setRole("learner")}
          >
            <Text style={[styles.roleBtnText, role === "learner" && styles.roleBtnTextActive]}>
              🎓 Learner
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === "mentor" && styles.roleBtnActive]}
            onPress={() => setRole("mentor")}
          >
            <Text style={[styles.roleBtnText, role === "mentor" && styles.roleBtnTextActive]}>
              👨‍🏫 Mentor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mentor notice */}
        {role === "mentor" && (
          <View style={styles.mentorNotice}>
            <Text style={styles.mentorNoticeText}>
              ⏳ Mentor accounts require admin approval before you can log in.
            </Text>
          </View>
        )}

        {/* Name */}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor="#BEB8D4"
            value={name}
            onChangeText={(text) => setName(text.replace(/[0-9]/g, ''))}
          />
        </View>

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
            placeholder="Create a password"
            placeholderTextColor="#BEB8D4"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            maxLength={12}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Min 8, Max 12 characters</Text>

        {/* Confirm Password */}
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrap}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor="#BEB8D4"
            secureTextEntry={!showPasswordConfirm}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            maxLength={12}
          />
          <TouchableOpacity onPress={() => setShowPasswordConfirm(!showPasswordConfirm)} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{showPasswordConfirm ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Mentor-only fields ── */}
        {role === "mentor" && (
          <>
            {/* Age */}
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>🎂</Text>
              <TextInput
                style={styles.input}
                placeholder="Your age"
                placeholderTextColor="#BEB8D4"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
              />
            </View>

            {/* Education Level */}
            <Text style={styles.label}>Education Level</Text>
            <TouchableOpacity
              style={styles.inputWrap}
              onPress={() => setShowEduDropdown(!showEduDropdown)}
              activeOpacity={0.8}
            >
              <Text style={styles.inputIcon}>🎓</Text>
              <Text style={[styles.input, !educationLevel && { color: "#BEB8D4" }]}>
                {educationLevel || "Select education level"}
              </Text>
              <Text style={styles.eyeIcon}>{showEduDropdown ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {showEduDropdown && (
              <View style={styles.dropdown}>
                {EDUCATION_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.dropdownItem,
                      educationLevel === level && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setEducationLevel(level);
                      setShowEduDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        educationLevel === level && styles.dropdownItemTextActive,
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Course */}
            <Text style={styles.label}>Course / Field of Study</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>📚</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Bachelor of Science in IT"
                placeholderTextColor="#BEB8D4"
                value={course}
                onChangeText={setCourse}
              />
            </View>
          </>
        )}

        {/* Register Button */}
        <TouchableOpacity
          style={styles.btnRegister}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnRegisterText}>
              {role === "mentor" ? "Submit Application 📋" : "Create Account 🎉"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginWrap}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.loginLink}>Log In</Text>
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
    marginBottom: 20,
  },

  roleToggleWrap: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8E0FF",
    overflow: "hidden",
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#F9F7FF",
  },
  roleBtnActive: {
    backgroundColor: "#FF6B35",
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7A7A8C",
  },
  roleBtnTextActive: {
    color: "#fff",
  },

  mentorNotice: {
    backgroundColor: "#FFF3CD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
  },
  mentorNoticeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7A5500",
  },

  label: { fontSize: 13, fontWeight: "700", color: "#2D2D2D", marginBottom: 6 },
  hint: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9B9BAD",
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 4,
  },
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
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 17 },

  dropdown: {
    borderWidth: 2,
    borderColor: "#E8E0FF",
    borderRadius: 12,
    backgroundColor: "#F9F7FF",
    marginTop: -12,
    marginBottom: 16,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: "#FF6B351A",
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D2D2D",
  },
  dropdownItemTextActive: {
    color: "#FF6B35",
  },

  btnRegister: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnRegisterText: { color: "white", fontSize: 16, fontWeight: "800" },

  loginWrap: { flexDirection: "row", justifyContent: "center" },
  loginText: { fontSize: 13, color: "#7A7A8C", fontWeight: "700" },
  loginLink: { fontSize: 13, fontWeight: "800", color: "#FF6B35" },
});