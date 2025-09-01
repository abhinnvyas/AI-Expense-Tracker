import client from "@/lib/openai"; // Import the singleton client

const prompt = `You are an expense categorization assistant.
Given an input string describing a transaction, do two things:
1. Extract the amount (a number).
2. Categorize the expense into one high-level category such as: Food, Clothes, Transport, Entertainment, Bills, Health, Education, Travel, Gadgets, Friends Miscellaneous, etc.
 - If none of these categories fit, choose "Miscellaneous".
Return the result strictly in this JSON format:
{
 "amount": <number>,
 "category": "<category>"
}
Example:
Input: "200 paneer tikka"
Output: { "amount": 200, "category": "Food" }
Input: "2100 nomad jacket"
Output: { "amount": 2100, "category": "Clothes" }
`;

interface CategoryResponse {
  status: boolean;
  message?: string;
  data?: {
    amount: number;
    category: string;
  };
}

export async function aiExpenseCategorizer(
  description: string
): Promise<CategoryResponse> {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // cheaper + fast for backend classification
      messages: [
        {
          role: "system",
          content: prompt,
        },
        { role: "user", content: description },
      ],
      response_format: { type: "json_object" },
    });

    const output = JSON.parse(response.choices[0].message.content || "{}");
    console.log("AI Categorization Output:", output);

    return { status: true, data: output };
  } catch (error: any) {
    console.error("Error in aiExpenseCategorizer:", error);
    return { status: false, message: "Failed to categorize expense" };
  }
}
