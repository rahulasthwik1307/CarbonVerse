export interface DetectiveItem {
  name: string;
  category: string;
  estimatedCO2: number;
  confidence: "high" | "medium" | "low";
  note: string;
}

export interface DetectiveSuggestion {
  action: string;
  potentialSaving: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface DetectiveResult {
  isValid: boolean;
  invalidReason?: string | null;
  receiptType: "food"|"fuel"|"electricity"|"transport"|"shopping"|"unknown";
  merchantName?: string | null;
  items: DetectiveItem[];
  totalCO2: number;
  totalCO2Label: string;
  impactLevel: "low"|"moderate"|"high"|"very_high";
  verdVerdict: string;
  suggestions: DetectiveSuggestion[];
  topInsight: string;
}
