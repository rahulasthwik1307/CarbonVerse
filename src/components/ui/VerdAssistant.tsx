"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VerdOrb from "@/components/ui/VerdOrb";
import { useSessionStore } from "@/lib/session-store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function VerdAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm Verd. Ask me about your carbon footprint, missions, or anything eco-related! 🌱" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract session context
  const { totalCarbonDelta, activeMissions, worldState, memoryBook } = useSessionStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Build context string
    const activeMissionTitles = activeMissions.map(m => m.title).join(", ");
    const badgesCount = memoryBook.timelineEvents.filter(e => e.type === "achievement_earned").length;
    
    const contextStr = `
Total Carbon Impact: ${totalCarbonDelta < 0 ? Math.abs(totalCarbonDelta) + " kg Saved" : totalCarbonDelta + " kg CO2 Emitted"}.
Current Active Missions: ${activeMissionTitles || "None"}.
Planet Mood: ${worldState.planetMood}.
Badges Earned: ${badgesCount}.
    `.trim();

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          context: contextStr
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops, my network to the forest is a bit weak right now! 🌳" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button / Companion */}
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          flexDirection: "row", // speech bubble on left, orb on right
          gap: 12,
          pointerEvents: "auto",
        }}
      >
        {/* Speech Bubble / Pill */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsOpen(true);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Ask Verd Assistant"
              style={{
                background: "rgba(255, 248, 231, 0.95)",
                backdropFilter: "blur(12px)",
                border: "2px solid #B8D4A8",
                borderRadius: "20px 20px 4px 20px", // speech bubble shape
                padding: "8px 16px",
                color: "#2D5016",
                fontWeight: 700,
                fontSize: 13,
                boxShadow: "0 8px 24px rgba(45, 80, 22, 0.12)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                userSelect: "none",
              }}
            >
              <span>Ask Verd</span>
              <span style={{ fontSize: 14 }}>💬</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Companion Orb */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={isOpen ? "Close Verd Assistant" : "Open Verd Assistant"}
          style={{
            cursor: "pointer",
            filter: "drop-shadow(0 10px 25px rgba(45, 80, 22, 0.18))",
          }}
        >
          <VerdOrb size={72} mood={isOpen ? "thinking" : "eco"} />
        </motion.div>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{
              position: "fixed",
              bottom: 100,
              right: 24,
              width: 340,
              height: 480,
              zIndex: 9998,
              background: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(184, 212, 168, 0.6)",
              borderRadius: 24,
              boxShadow: "0 12px 48px rgba(45, 80, 22, 0.15)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}
          >
            {/* Header */}
            <div style={{
              padding: "16px 20px",
              background: "rgba(244, 250, 240, 0.9)",
              borderBottom: "1px solid rgba(184, 212, 168, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              <VerdOrb size={32} mood="eco" />
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#2D5016" }}>Verd Assistant</div>
                <div style={{ fontSize: 12, color: "#6B8F5E" }}>Always here to help</div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 20, color: "#6B8F5E", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 16,
                  background: msg.role === "user" ? "#4A7C2F" : "rgba(255, 255, 255, 0.9)",
                  color: msg.role === "user" ? "white" : "#2D5016",
                  border: msg.role === "user" ? "none" : "1px solid rgba(184, 212, 168, 0.4)",
                  boxShadow: msg.role === "user" ? "0 4px 12px rgba(74, 124, 47, 0.2)" : "0 2px 8px rgba(0,0,0,0.04)",
                  fontSize: 14,
                  lineHeight: 1.4
                }}>
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: 16,
                  background: "rgba(255, 255, 255, 0.9)",
                  border: "1px solid rgba(184, 212, 168, 0.4)",
                  display: "flex",
                  gap: 4
                }}>
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
                      style={{ width: 6, height: 6, borderRadius: "50%", background: "#6B8F5E" }}
                    />
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{
              padding: "12px 16px",
              background: "rgba(255, 255, 255, 0.6)",
              borderTop: "1px solid rgba(184, 212, 168, 0.4)",
              display: "flex",
              gap: 8
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Ask Verd anything..."
                aria-label="Ask Verd anything"
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 20,
                  border: "1px solid rgba(184, 212, 168, 0.6)",
                  background: "rgba(255, 255, 255, 0.9)",
                  fontSize: 14,
                  outline: "none",
                  color: "#2D5016"
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: input.trim() && !isTyping ? "#F4A832" : "#E5E7EB",
                  color: "white",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: input.trim() && !isTyping ? "pointer" : "default",
                  transition: "0.2s"
                }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
