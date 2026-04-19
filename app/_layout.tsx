import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="lessons" />
      <Stack.Screen name="lesson-detail" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="quizzes" />
    </Stack>
  );
}
