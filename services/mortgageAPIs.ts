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

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFeeSummaryWithAI = async (fees: FeeData): Promise<string> => {
    const prompt = `Please provide a one or two-sentence professional summary for a loan officer based on this fee data. Mention any notable highs or lows. Fee Data: ${JSON.stringify(fees)}`;
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
    const prompt = `
Analyze the following unstructured text from a mortgage pricing sheet. Extract all available rate options. Each option should contain an interest rate, the cost in points, and any lender credits.

- 'rate' should be a number (e.g., 6.75).
- 'points' should be the dollar amount of the cost. If it's a percentage, calculate the dollar amount based on a $500,000 loan amount. If no points, it's 0.
- 'credits' should be the dollar amount of the credit. If no credits, it's 0.

Pricing Sheet Text:
"${sheetText}"
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
                        credits: { type: Type.NUMBER },
                    },
                    required: ["rate", "points", "credits"],
                },
            },
        },
    });

    try {
        const jsonText = response.text.trim();
        const parsedOptions: PricingOption[] = JSON.parse(jsonText);
        // Sort by rate, lowest to highest
        parsedOptions.sort((a, b) => a.rate - b.rate);
        return parsedOptions;
    } catch (e) {
        console.error("Failed to parse AI response as JSON", e);
        return [];
    }
};