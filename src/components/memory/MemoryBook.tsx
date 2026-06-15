"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/lib/session-store";
import VerdOrb from "@/components/ui/VerdOrb";

type Tab = "stories" | "receipts" | "totals";

export default function MemoryBook() {
  const router = useRouter();
  const { memoryBook, activeMissions, achievements } = useSessionStore();
  const [activeTab, setActiveTab] = useState<Tab>("stories");
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const calculateCategories = () => {
    let transport = 0, food = 0, shopping = 0, electricity = 0;
    memoryBook.stories.forEach(s => {
      s.decisions.forEach(d => {
        if (d.moment === "commute") transport += d.carbonKg;
        if (["breakfast", "lunch", "dinner"].includes(d.moment)) food += d.carbonKg;
        if (d.moment === "shopping") shopping += d.carbonKg;
        if (d.moment === "wind-down") electricity += d.carbonKg;
      });
    });
    
    // Convert to positive for charting purposes
    transport = Math.abs(transport);
    food = Math.abs(food);
    shopping = Math.abs(shopping);
    electricity = Math.abs(electricity);

    const total = transport + food + shopping + electricity;
    return {
      transport: { value: transport, pct: total ? (transport/total)*100 : 0 },
      food: { value: food, pct: total ? (food/total)*100 : 0 },
      shopping: { value: shopping, pct: total ? (shopping/total)*100 : 0 },
      electricity: { value: electricity, pct: total ? (electricity/total)*100 : 0 }
    };
  };

  const cats = calculateCategories();

  const trendData = memoryBook.stories.slice(-7).map((story) => ({
    label: new Date(story.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    carbon: story.totalCarbonKg,
    mood: story.planetMood,
  }));

  const maxAbsCarbon = Math.max(1, ...trendData.map((d) => Math.abs(d.carbon)));

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 8 }}>
        <VerdOrb size={48} mood="eco" />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2D5016", marginTop: 12 }}>Carbon Memory Book 📖</h1>
        <p style={{ color: "#4A7C2F", fontSize: 15 }}>Your complete sustainability journey</p>
      </motion.div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 8, padding: 4, background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)", borderRadius: 20 }}>
        {(["stories", "receipts", "totals"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 16,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: activeTab === tab ? "#4A7C2F" : "transparent",
              color: activeTab === tab ? "white" : "#6B8F5E",
              position: "relative",
              transition: "all 0.2s"
            }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                style={{ position: "absolute", inset: 0, borderRadius: 16, background: "#4A7C2F", zIndex: -1 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>
              {tab === "stories" ? "📖 Stories" : tab === "receipts" ? "🧾 Receipts" : "📊 Totals"}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {activeTab === "stories" && (
          <motion.div key="stories" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {memoryBook.stories.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <VerdOrb size={40} />
                <p style={{ color: "#4A7C2F", marginTop: 16, marginBottom: 24 }}>No stories yet. Begin your first story!</p>
                <button
                  onClick={() => router.push("/story")}
                  style={{ background: "#4A7C2F", color: "white", padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Start Story
                </button>
              </div>
            ) : (
              <div style={{ position: "relative", paddingLeft: 20 }}>
                {/* Vertical line */}
                <div style={{ position: "absolute", left: 6, top: 20, bottom: 0, width: 2, background: "rgba(74,124,47,0.3)" }} />
                
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {[...memoryBook.stories].reverse().map((story, i) => {
                    const isExpanded = expandedStoryId === story.id;
                    return (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        style={{ position: "relative" }}
                      >
                        {/* Dot */}
                        <div style={{ position: "absolute", left: -20, top: 24, width: 12, height: 12, borderRadius: 6, background: "#4A7C2F", border: "2px solid #FFF8E7", zIndex: 2 }} />
                        
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#6B8F5E", marginBottom: 8, paddingLeft: 4 }}>
                          {formatDate(story.date)}
                        </div>
                        
                        <motion.div
                          layout
                          onClick={() => setExpandedStoryId(isExpanded ? null : story.id)}
                          style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: 16, padding: 20, cursor: "pointer", border: "1px solid rgba(184,212,168,0.5)" }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <span style={{ fontSize: 12, fontWeight: 700, background: "#4A7C2F", color: "white", padding: "4px 8px", borderRadius: 8 }}>Ch. {story.chapterNumber}</span>
                              <span style={{ fontSize: 13, background: "rgba(74, 124, 47, 0.1)", color: "#4A7C2F", padding: "4px 8px", borderRadius: 12 }}>{story.planetMood}</span>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: 18, color: story.totalCarbonKg <= 0 ? "#2D7A1F" : "#A0401A" }}>
                              {story.totalCarbonKg > 0 ? "+" : ""}{story.totalCarbonKg} kg CO₂
                            </span>
                          </div>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ overflow: "hidden", marginTop: 16 }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 16, borderTop: "1px solid rgba(184,212,168,0.3)" }}>
                                  {story.decisions.map((d, di) => {
                                    const emoji = d.moment === "breakfast" ? "🌅" : d.moment === "commute" ? "🌆" : d.moment === "lunch" ? "🌞" : d.moment === "shopping" ? "🌇" : d.moment === "dinner" ? "🌙" : d.moment === "wind-down" ? "😴" : "✨";
                                    return (
                                      <div key={di} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                                        <span>{emoji}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "#6B8F5E", width: 64, textTransform: "capitalize" }}>{d.moment}</span>
                                        <span style={{ flex: 1, color: "#2D5016", fontWeight: 500 }}>{d.choice}</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: d.impactType === "eco" ? "rgba(74,124,47,0.1)" : d.impactType === "moderate" ? "rgba(244,168,50,0.15)" : "rgba(160,64,26,0.1)", color: d.impactType === "eco" ? "#4A7C2F" : d.impactType === "moderate" ? "#A06000" : "#A0401A" }}>
                                          {d.impactType.toUpperCase()}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
                {memoryBook.stories.length === 1 && (
                  <div style={{ marginTop: 24, paddingLeft: 20, fontSize: 13, color: "#6B8F5E", fontStyle: "italic" }}>
                    Play again to add more chapters to your timeline! 🌱
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "receipts" && (
          <motion.div key="receipts" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {memoryBook.receipts.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40 }}>
                <p style={{ color: "#4A7C2F", marginBottom: 24 }}>No receipts analyzed yet.</p>
                <button
                  onClick={() => router.push("/detective")}
                  style={{ background: "#4A7C2F", color: "white", padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  Open Detective
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[...memoryBook.receipts].reverse().map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)", borderRadius: 16, padding: 20 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, textTransform: "uppercase", fontWeight: 700, color: "#6B8F5E", marginBottom: 4 }}>
                          {r.receiptType} Receipt
                        </div>
                        <div style={{ fontWeight: 600, color: "#2D5016", fontSize: 16 }}>{r.merchantName}</div>
                        <div style={{ fontSize: 13, color: "#8B6914", marginTop: 2 }}>{formatDate(r.date)}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: r.totalCO2 > 20 ? "#A0401A" : "#4A7C2F" }}>
                          {r.totalCO2} kg
                        </div>
                        <div style={{ fontSize: 12, color: "#6B8F5E" }}>CO₂ impact</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#6B8F5E", marginBottom: 8 }}>Top Items:</div>
                      {r.items.slice(0, 3).map((item, ii) => (
                        <div key={ii} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#2D5016", marginBottom: 4 }}>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>{item.name}</span>
                          <span style={{ fontWeight: 500 }}>{item.estimatedCO2}kg</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "totals" && (
          <motion.div key="totals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Big Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#2D5016" }}>{memoryBook.stories.length}</div>
                <div style={{ fontSize: 13, color: "#4A7C2F", fontWeight: 500 }}>📖 Stories Played</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#2D5016" }}>{memoryBook.receipts.length}</div>
                <div style={{ fontSize: 13, color: "#4A7C2F", fontWeight: 500 }}>🧾 Receipts Analyzed</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#4A7C2F" }}>{memoryBook.ecoChoicesCount}</div>
                <div style={{ fontSize: 13, color: "#4A7C2F", fontWeight: 500 }}>🌱 Eco Choices</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 16, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#A0401A" }}>{memoryBook.highChoicesCount}</div>
                <div style={{ fontSize: 13, color: "#A0401A", fontWeight: 500 }}>⚠️ High Impact</div>
              </div>
            </div>

            {/* Combined CO2 Total */}
            <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))", borderRadius: 20, padding: 24, textAlign: "center", border: "1px solid rgba(255,255,255,0.5)" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6B8F5E", textTransform: "uppercase", letterSpacing: 1 }}>Total Carbon Impact</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: (memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) > 0 ? "#A0401A" : "#4A7C2F", margin: "8px 0" }}>
                {Math.round((memoryBook.totalStoryCO2 + memoryBook.totalReceiptCO2) * 10) / 10} kg
              </div>
              <div style={{ fontSize: 13, color: "#8B6914" }}>Combined from stories and receipts</div>
            </div>

            {/* Carbon Trend Graph */}
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2D5016" }}>Your Carbon Journey 📈</div>
                  <div style={{ fontSize: 11, color: "#6B8F5E" }}>Last {trendData.length} stories</div>
                </div>
              </div>
              
              {trendData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <VerdOrb size={40} mood="moderate" className="mx-auto mb-2" />
                  <div style={{ fontSize: 12, color: "#6B8F5E" }}>Play a story to see your trend!</div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ width: "100%", height: 180, position: "relative" }}
                >
                  <svg viewBox="0 0 300 180" preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                    {/* Y-axis baseline */}
                    <line x1="20" y1="140" x2="290" y2="140" stroke="rgba(184,212,168,0.4)" strokeWidth="1" />
                    
                    {/* Zero line label */}
                    <text x="5" y="143" fontSize="8" fill="#A8BEA9" fontWeight="500">0 kg</text>
                    
                    {/* Bars */}
                    {trendData.map((d, i) => {
                      const barWidth = 30;
                      const gap = (270 - trendData.length * barWidth) / (trendData.length + 1);
                      const x = 20 + gap + i * (barWidth + gap);
                      
                      const rawHeight = (Math.abs(d.carbon) / maxAbsCarbon) * 100;
                      const barHeight = Math.max(2, rawHeight);
                      
                      const isEco = d.carbon < 0;
                      const isHigh = d.carbon > 0;
                      
                      const y = isEco ? 140 - barHeight : 140;
                      const fill = isEco ? "#4CAF50" : isHigh ? "#D4845A" : "#B8D4A8";
                      
                      const labelY = isEco ? y - 6 : y + barHeight + 10;
                      
                      const moodEmoji = d.mood === "Thriving" ? "🟢" : d.mood === "Under Stress" ? "🔴" : "🟡";
                      const emojiY = isEco ? y - 18 : 140 - 10;
                      
                      return (
                        <g key={i}>
                          <motion.rect
                            x={x}
                            y={isEco ? 140 : 140}
                            width={barWidth}
                            height={0}
                            fill={fill}
                            rx={4}
                            animate={{ y: y, height: barHeight }}
                            transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                          />
                          
                          {/* CO2 Value */}
                          <motion.text
                            x={x + barWidth / 2}
                            y={labelY}
                            fontSize="7"
                            fontWeight="bold"
                            fill={fill}
                            textAnchor="middle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                          >
                            {d.carbon > 0 ? "+" : ""}{d.carbon}
                          </motion.text>
                          
                          {/* Mood Emoji */}
                          <motion.text
                            x={x + barWidth / 2}
                            y={emojiY}
                            fontSize="8"
                            textAnchor="middle"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 + i * 0.08, type: "spring" }}
                          >
                            {moodEmoji}
                          </motion.text>
                          
                          {/* Date Label */}
                          <text
                            x={x + barWidth / 2}
                            y="155"
                            fontSize="7"
                            fill="#6B8F5E"
                            textAnchor="end"
                            transform={`rotate(-30, ${x + barWidth / 2}, 155)`}
                          >
                            {d.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {trendData.length === 1 && (
                    <div style={{ textAlign: "center", fontSize: 11, color: "#6B8F5E", marginTop: 8 }}>
                      Play more stories to see your trend! 📈
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Category Breakdown */}
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#2D5016", marginBottom: 16 }}>Category Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Transport", data: cats.transport, color: "#4A9B8E" },
                  { label: "Food", data: cats.food, color: "#4A7C2F" },
                  { label: "Shopping", data: cats.shopping, color: "#F4A832" },
                  { label: "Electricity", data: cats.electricity, color: "#D4845A" }
                ].map((c, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "#2D5016", marginBottom: 4 }}>
                      <span>{c.label}</span>
                      <span>{c.data.value} kg</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.data.pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{ height: "100%", background: c.color, borderRadius: 4 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missions */}
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#2D5016", marginBottom: 16 }}>Active Missions 🎯</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeMissions.map(m => (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{m.emoji}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#2D5016", textDecoration: m.completed ? "line-through" : "none" }}>{m.title}</span>
                      </div>
                      {m.completed ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#4A7C2F", background: "rgba(74, 124, 47, 0.1)", padding: "2px 8px", borderRadius: 10 }}>✓ Done</span>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#6B8F5E" }}>{Math.min(m.currentCount, m.targetCount)}/{m.targetCount}</span>
                      )}
                    </div>
                    <div style={{ height: 4, background: "rgba(0,0,0,0.05)", borderRadius: 2, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(Math.min(m.currentCount, m.targetCount) / m.targetCount) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ height: "100%", background: m.completed ? "#4A7C2F" : "#F4A832" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#2D5016", marginBottom: 16 }}>Achievements 🏆</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {achievements.map(ach => {
                  const unlocked = !!ach.unlockedAt;
                  return (
                    <div
                      key={ach.id}
                      title={unlocked ? ach.description : "Locked"}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: 12, borderRadius: 16,
                        background: unlocked ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                        border: unlocked ? "1px solid rgba(244,168,50,0.3)" : "1px solid transparent",
                        opacity: unlocked ? 1 : 0.5,
                        filter: unlocked ? "none" : "grayscale(100%)",
                        cursor: unlocked ? "help" : "default"
                      }}
                    >
                      <span style={{ fontSize: 32 }}>{ach.emoji}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#2D5016", textAlign: "center", lineHeight: 1.2 }}>{ach.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
