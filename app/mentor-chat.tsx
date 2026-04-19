import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "./services/api";

export default function MentorChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [user, setUser] = useState<any>(null);
  const [mentor, setMentor] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, mentorRes, messagesRes] = await Promise.all([
        api.get("/user"),
        api.get("/messages/mentor"),
        api.get("/messages"),
      ]);
      setUser(userRes.data);
      setMentor(mentorRes.data);
      setMessages(messagesRes.data);
    } catch (error) {
      console.log("Chat load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await api.post("/messages", { message: text.trim() });
      setMessages((prev) => [...prev, res.data]);
      setText("");
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      console.log("Send error:", error.response?.data);
    } finally {
      setSending(false);
    }
  };

  const isMyMessage = (msg: any) => msg.sender_id === user?.id;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1A73E8" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mentor) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mentor Chat</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🧑‍🏫</Text>
          <Text style={styles.emptyTitle}>No Mentor Assigned</Text>
          <Text style={styles.emptySub}>
            Please wait for an admin to assign a mentor to you.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.mentorAvatar}>
            <Text style={styles.mentorAvatarText}>🧑‍🏫</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{mentor.name}</Text>
            <Text style={styles.headerSub}>Your Mentor</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        {messages.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySub}>
              Say hi to your mentor and start learning!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => {
              const mine = isMyMessage(item);
              return (
                <View
                  style={[
                    styles.messageBubbleWrap,
                    mine ? styles.myWrap : styles.theirWrap,
                  ]}
                >
                  {!mine && (
                    <View style={styles.bubbleAvatar}>
                      <Text style={{ fontSize: 14 }}>🧑‍🏫</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      mine ? styles.myBubble : styles.theirBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        mine ? styles.myBubbleText : styles.theirBubbleText,
                      ]}
                    >
                      {item.message}
                    </Text>
                    <Text
                      style={[
                        styles.bubbleTime,
                        mine ? styles.myBubbleTime : styles.theirBubbleTime,
                      ]}
                    >
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#BDC1C6"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24,
  },

  header: {
    backgroundColor: "#1A73E8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 12,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backIcon: { fontSize: 28, color: "white", fontWeight: "700" },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 10 },
  mentorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  mentorAvatarText: { fontSize: 18 },
  headerTitle: { fontSize: 15, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,.8)" },

  messagesList: { padding: 16, gap: 10, paddingBottom: 8 },
  messageBubbleWrap: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  myWrap: { justifyContent: "flex-end" },
  theirWrap: { justifyContent: "flex-start" },

  bubbleAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 12,
    paddingBottom: 8,
  },
  myBubble: {
    backgroundColor: "#1A73E8",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: "white",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  myBubbleText: { color: "white", fontWeight: "500" },
  theirBubbleText: { color: "#2D2D2D", fontWeight: "500" },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  myBubbleTime: { color: "rgba(255,255,255,.6)", textAlign: "right" },
  theirBubbleTime: { color: "#BDC1C6" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    paddingTop: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E8E0FF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#202124",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E8E0FF",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1A73E8",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 16, color: "white" },

  loadingText: { fontSize: 14, fontWeight: "600", color: "#7A7A8C" },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: "#2D2D2D" },
  emptySub: { fontSize: 13, color: "#7A7A8C", textAlign: "center", fontWeight: "600" },
});