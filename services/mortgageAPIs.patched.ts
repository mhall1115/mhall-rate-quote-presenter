import type { Quote } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { AddressDetails } from '../components/common/AddressAutocomplete';


export interface FeeData {
    TaxRate: number;
    TitleFees: number;
    EscrowFees: number;
    RecordingFee: number;
    TransferTax: number;
}

export interface PricingOption {
    rate: number;
    points: number;
    credits: number;
}

// --- Address Autocomplete Service (Mock) ---
const mockAddressSuggestions = [
  { description: '123 Main St, Anytown, USA 12345', id: '1' },
  { description: '456 Oak Ave, Somecity, USA 67890', id: '2' },
  { description: '789 Pine Ln, Otherville, USA 13579', id: '3' },
];

const mockAddressDetails: Record<string, AddressDetails> = {
  '1': { fullAddress: '123 Main St, Anytown, USA 12345', zipCode: '12345' },
  '2': { fullAddress: '456 Oak Ave, Somecity, USA 67890', zipCode: '67890' },
  '3': { fullAddress: '789 Pine Ln, Otherville, USA 13579', zipCode: '13579' },
};

export const fetchAddressSuggestions = (query: string): Promise<{description: string, id: string}[]> => {
    console.log(`Simulating address suggestion fetch for: ${query}`);
    return new Promise(resolve => {
        setTimeout(() => {
            if (!query) resolve([]);
            const filtered = mockAddressSuggestions.filter(s => s.description.toLowerCase().includes(query.toLowerCase()));
            resolve(filtered);
        }, 300);
    });
};

export const getAddressDetails = (id: string): Promise<AddressDetails> => {
     console.log(`Simulating address details fetch for id: ${id}`);
     return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockAddressDetails[id] || { fullAddress: 'N/A', zipCode: 'N/A' });
        }, 500);
     });
};


// --- Fee Estimation Service (Mock) ---
export const fetchEstimatedFees = (address: string, purchasePrice: number): Promise<FeeData> => {
    console.log(`Simulating fee fetch for address: ${address} and price: ${purchasePrice}`);
    
    return new Promise(resolve => {
        setTimeout(() => {
            // Simple logic: higher price = higher fees. A real API would use location.
            const baseTitle = purchasePrice * 0.0025;
            const baseEscrow = purchasePrice * 0.0015;
            const taxRate = 1.0 + (Math.random() * 0.5); // Random tax rate between 1.0 and 1.5

            resolve({
                TaxRate: parseFloat(taxRate.toFixed(2)),
                TitleFees: Math.round((baseTitle + 500) / 50) * 50, // round to nearest 50
                EscrowFees: Math.round((baseEscrow + 300) / 50) * 50,
                RecordingFee: 150 + Math.floor(Math.random() * 100),
                TransferTax: Math.round((purchasePrice * 0.001) / 100) * 100,
            });
        }, 1500); // Simulate network delay
    });
};


// --- Gemini AI Services ---

// Use Vite-style env var so it's injected at build time if provided.
// IMPORTANT: On GitHub Pages (static hosting), any client-side API key will be PUBLIC.
// Prefer leaving VITE_API_KEY undefined in production or proxying through a backend.
const API_KEY = import.meta.env.VITE_API_KEY;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getFeeSummaryWithAI = async (fees: FeeData): Promise<string> => {
  if (!ai) {
    // Fallback: return a simple, deterministic summary without calling an external API.
    const total =
      (fees.TitleFees || 0) +
      (fees.EscrowFees || 0) +
      (fees.RecordingFee || 0) +
      (fees.TransferTax || 0);
    return `Estimated closing costs around $${total.toLocaleString()} (excludes prepaid taxes/insurance). Check title/escrow for final figures.`;
  }
  const prompt = `Please provide a one or two-sentence professional summary for a loan officer based on this fee data. Fee Data: ${JSON.stringify(fees)}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "You are a mortgage data analyst providing concise insights to loan officers."
    }
  });
  return response.text;
};

export const parsePricingSheetWithAI = async (sheetText: string): Promise<PricingOption[]> => {
  if (!ai) {
    // Fallback: naive parse – look for number-like tokens and build a few mock options.
    try {
      const rates = Array.from(sheetText.matchAll(/\b(\d{1,2}\.\d{2,3})%?/g)).map(m => parseFloat(m[1]));
      const uniques = [...new Set(rates)].slice(0, 5).sort((a,b)=>a-b);
      return uniques.map((r, idx) => ({
        rate: r,
        points: +(Math.max(0, 0.25*idx - 0.25).toFixed(2)),
        apr: +(r + 0.05).toFixed(3),
        payment: 0,
        lenderCredit: +(Math.max(0, 1000 - 250*idx).toFixed(2)),
        totalCashToClose: 0,
        notes: "Fallback parsing; provide API key for AI-enhanced parsing."
      }));
    } catch {
      return [];
    }
  }

  const prompt = `
Analyze the following mortgage rate/pricing sheet text and extract a clean JSON array of pricing options.
Each option: { "rate": number, "points": number, "apr": number, "payment": number, "lenderCredit": number, "totalCashToClose": number, "notes": string }
Return ONLY JSON.

-----
${sheetText}
  `.trim();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            rate: { type: Type.NUMBER },
            points: { type: Type.NUMBER },
            apr: { type: Type.NUMBER },
            payment: { type: Type.NUMBER },
            lenderCredit: { type: Type.NUMBER },
            totalCashToClose: { type: Type.NUMBER },
            notes: { type: Type.STRING }
          },
          required: ["rate", "points"]
        }
      }
    }
  });

  try {
    const jsonText = response.text.trim();
    const parsedOptions: PricingOption[] = JSON.parse(jsonText);
    parsedOptions.sort((a, b) => a.rate - b.rate);
    return parsedOptions;
  } catch (e) {
    console.error("Failed to parse AI response as JSON", e);
    return [];
  }
};
