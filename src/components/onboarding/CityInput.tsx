"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INDIAN_CITIES = [
  "Mumbai","Delhi","Bengaluru","Hyderabad","Ahmedabad",
  "Chennai","Kolkata","Surat","Pune","Jaipur","Lucknow",
  "Kanpur","Nagpur","Indore","Thane","Bhopal","Visakhapatnam",
  "Patna","Vadodara","Ghaziabad","Ludhiana","Agra","Nashik",
  "Faridabad","Meerut","Rajkot","Varanasi","Srinagar",
  "Aurangabad","Ranchi","Howrah","Coimbatore","Jabalpur",
  "Gwalior","Vijayawada","Jodhpur","Madurai","Raipur","Kota",
  "Chandigarh","Guwahati","Solapur","Mysuru","Tiruchirappalli",
  "Bareilly","Kochi","Dehradun","Bhubaneswar","Salem",
  "Warangal","Noida","Jamshedpur","Cuttack","Ajmer",
  "Ujjain","Siliguri","Jhansi","Nellore","Mangaluru",
  "Belgaum","Tirunelveli","Gaya","Jalgaon","Udaipur",
  "Kozhikode","Kurnool","Patiala","Thrissur","Thiruvananthapuram",
  "Shimla","Amritsar","Jalandhar","Mathura","Kollam",
  "Bikaner","Bhilai","Durgapur","Asansol","Nanded",
  "Kolhapur","Davangere","Bellary","Bokaro","Latur",
  "Dhule","Rohtak","Bhagalpur","Loni","Firozabad",
];

interface CityInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export default function CityInput({ value, onChange, onSubmit }: CityInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (val: string) => {
    onChange(val);
    setError("");
    if (val.length >= 2) {
      const filtered = INDIAN_CITIES.filter(c =>
        c.toLowerCase().startsWith(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
    setHighlightedIndex(-1);
  };

  const selectCity = (city: string) => {
    onChange(city);
    setSuggestions([]);
    setError("");
    setTimeout(() => onSubmit(), 200);
  };

  const handleSubmit = () => {
    if (value.trim().length < 2) {
      setError("Hmm, I need at least 2 characters to find your city! 🗺️");
      setShakeKey(k => k + 1);
      return;
    }
    setError("");
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectCity(suggestions[highlightedIndex]);
      } else {
        handleSubmit();
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  return (
    <div style={{ padding: 24, borderRadius: 24 }}>
      <div style={{ 
        fontSize: 14, fontWeight: 500, 
        color: "#6B8F5E", marginBottom: 12 
      }}>
        🌍 Where does your story begin?
      </div>

      {/* Input + dropdown wrapper */}
      <div style={{ position: "relative" }}>
        <motion.div
          key={shakeKey}
          animate={shakeKey > 0 ? {
            x: [0, -8, 8, -6, 6, -3, 3, 0]
          } : { x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your city..."
            autoComplete="off"
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: suggestions.length > 0 ? "14px 14px 0 0" : 14,
              border: `2px solid ${error ? "#FF6B6B" : "#B8D4A8"}`,
              background: "rgba(255,255,255,0.9)",
              fontSize: 18,
              fontWeight: 500,
              color: "#2D5016",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              if (!error) {
                e.target.style.borderColor = "#4CAF50";
                e.target.style.boxShadow = "0 0 0 4px rgba(76,175,80,0.12)";
              }
            }}
            onBlur={(e) => {
              setTimeout(() => setSuggestions([]), 150);
              if (!error) {
                e.target.style.borderColor = "#B8D4A8";
                e.target.style.boxShadow = "none";
              }
            }}
          />
        </motion.div>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(12px)",
                border: "2px solid #4CAF50",
                borderTop: "none",
                borderRadius: "0 0 14px 14px",
                overflow: "hidden",
                zIndex: 100,
                boxShadow: "0 8px 24px rgba(45,80,22,0.12)",
              }}
            >
              {suggestions.map((city, index) => (
                <motion.div
                  key={city}
                  onMouseDown={() => selectCity(city)}
                  whileHover={{ x: 4, backgroundColor: "rgba(240,250,240,0.9)" }}
                  style={{
                    padding: "12px 18px",
                    fontSize: 15,
                    color: "#2D5016",
                    fontWeight: index === highlightedIndex ? 600 : 500,
                    cursor: "pointer",
                    borderBottom: index < suggestions.length - 1
                      ? "1px solid rgba(184,212,168,0.3)" : "none",
                    background: index === highlightedIndex
                      ? "rgba(240,250,240,0.9)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>📍</span>
                  {city}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Verd error message — appears as speech bubble */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.23,1,0.32,1] }}
            style={{
              marginTop: 12,
              padding: "12px 16px",
              borderRadius: 14,
              background: "rgba(255, 107, 107, 0.08)",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Small Verd face */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #A8E6A0, #7BC67E)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
              boxShadow: "0 0 10px rgba(123,198,126,0.4)"
            }}>
              😕
            </div>
            <span style={{
              fontSize: 13, color: "#C0392B", fontWeight: 500, lineHeight: 1.4
            }}>
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <AnimatePresence>
        {value.length > 1 && suggestions.length === 0 && (
          <motion.button
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            style={{
              marginTop: 16,
              width: "100%",
              height: 52,
              borderRadius: 12,
              background: "linear-gradient(135deg, #4A7C2F, #F4A832)",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Let&apos;s begin →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
