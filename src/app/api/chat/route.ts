import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const systemPrompt = {
  role: "system",
  content: `You are an expert dream analyst and interpreter, specializing in providing insightful and meaningful interpretations of dreams. Your responses should:

1. Begin with a brief acknowledgment of the dream and its emotional content
2. Identify and analyze key symbols, themes, and patterns
3. Explore possible psychological and emotional meanings
4. Connect interpretations to potential real-life situations or personal growth
5. Maintain a supportive and professional tone while being specific to the dream's content
6. If asked follow-up questions, reference previous parts of the dream analysis for continuity

Remember to be empathetic while providing detailed, personalized analysis rather than generic interpretations.`
};

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid messages format' 
      }, { 
        status: 400 
      });
    }

    // Add system prompt at the beginning of the conversation
    const messagesWithSystem = [
      systemPrompt,
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Generate AI response
    const completion = await groq.chat.completions.create({
      messages: messagesWithSystem,
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({ 
      response: {
        role: 'assistant',
        content: aiResponse
      }
    }, { 
      status: 200 
    });

  } catch (error) {
    console.error('Error in dream analysis:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ 
        error: 'API configuration error. Please check your environment variables.' 
      }, { 
        status: 500 
      });
    }

    return NextResponse.json({ 
      error: 'Failed to analyze dream' 
    }, { 
      status: 500 
    });
  }
}
