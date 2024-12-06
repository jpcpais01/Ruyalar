// AI Dream Analysis Service using API

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const dreamKeywords = {
  emotions: ['happy', 'sad', 'angry', 'scared', 'peaceful', 'anxious', 'excited', 'confused'],
  places: ['house', 'school', 'work', 'beach', 'forest', 'city', 'mountains', 'sky'],
  actions: ['running', 'flying', 'falling', 'swimming', 'talking', 'searching', 'hiding', 'fighting'],
  elements: ['water', 'fire', 'earth', 'air', 'light', 'darkness', 'colors', 'nature'],
  people: ['family', 'friends', 'strangers', 'children', 'parents', 'partner', 'teacher', 'leader']
};

function findRelevantKeywords(dream: string) {
  const lowerDream = dream.toLowerCase();
  const found = {
    emotions: dreamKeywords.emotions.filter(word => lowerDream.includes(word)),
    places: dreamKeywords.places.filter(word => lowerDream.includes(word)),
    actions: dreamKeywords.actions.filter(word => lowerDream.includes(word)),
    elements: dreamKeywords.elements.filter(word => lowerDream.includes(word)),
    people: dreamKeywords.people.filter(word => lowerDream.includes(word))
  };
  return found;
}

function generateAnalysis(dream: string) {
  const keywords = findRelevantKeywords(dream);
  let analysis = "Dream Analysis:\n\n";

  // Initial reflection
  analysis += `Thank you for sharing your dream. Let me analyze its key elements and potential meanings.\n\n`;

  // Analyze emotions
  if (keywords.emotions.length > 0) {
    analysis += `Emotional Elements:\nYour dream contains ${keywords.emotions.join(', ')} emotions, which suggests you may be processing these feelings in your waking life. ${
      keywords.emotions.includes('anxious') ? 'The presence of anxiety might indicate underlying concerns or uncertainties.' :
      keywords.emotions.includes('peaceful') ? 'The peaceful emotions suggest a period of harmony or resolution in your life.' :
      'These emotions may reflect your current emotional state or desires.'
    }\n\n`;
  }

  // Analyze settings
  if (keywords.places.length > 0) {
    analysis += `Setting Analysis:\nThe dream takes place in/around ${keywords.places.join(', ')}. ${
      keywords.places.includes('house') ? 'Houses often represent the self or personal life.' :
      keywords.places.includes('work') ? 'Work settings might reflect professional ambitions or concerns.' :
      'These locations may symbolize different aspects of your life journey.'
    }\n\n`;
  }

  // Analyze actions
  if (keywords.actions.length > 0) {
    analysis += `Actions and Movement:\nIn your dream, there is ${keywords.actions.join(', ')}. ${
      keywords.actions.includes('flying') ? 'Flying often represents freedom, transcendence, or escape from limitations.' :
      keywords.actions.includes('falling') ? 'Falling might indicate feelings of losing control or fear of failure.' :
      'These actions may represent your current life direction or desires.'
    }\n\n`;
  }

  // Analyze elements
  if (keywords.elements.length > 0) {
    analysis += `Symbolic Elements:\nThe presence of ${keywords.elements.join(', ')} is significant. ${
      keywords.elements.includes('water') ? 'Water often symbolizes emotions and the unconscious mind.' :
      keywords.elements.includes('light') ? 'Light might represent clarity, insight, or hope.' :
      'These elements may represent different aspects of your psyche.'
    }\n\n`;
  }

  // Analyze people
  if (keywords.people.length > 0) {
    analysis += `People and Relationships:\nThe dream involves ${keywords.people.join(', ')}. ${
      keywords.people.includes('family') ? 'Family members in dreams often represent close personal relationships or aspects of yourself.' :
      keywords.people.includes('strangers') ? 'Strangers might represent unknown aspects of yourself or new possibilities.' :
      'These relationships may reflect important connections or aspects of your social life.'
    }\n\n`;
  }

  // General interpretation if no specific keywords found
  if (Object.values(keywords).every(arr => arr.length === 0)) {
    analysis += `General Interpretation:\nWhile your dream doesn't contain common symbolic elements, it's important to consider the overall feeling and context. Dreams often reflect our subconscious thoughts, emotions, and experiences. Consider how this dream might relate to your current life situations or emotional state.\n\n`;
  }

  // Conclusion
  analysis += `Remember that dream interpretation is highly personal, and these insights are meant to help you reflect on possible meanings. The most valuable interpretation often comes from your own intuition about what these symbols and experiences mean to you personally.`;

  return analysis;
}

let conversationHistory: Message[] = [];

export async function analyzeDream(dream: string): Promise<string> {
  try {
    // Add user message to conversation history
    conversationHistory.push({
      role: 'user',
      content: dream
    });

    // Make API request with full conversation history
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: conversationHistory }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze dream');
    }

    const data = await response.json();
    
    // Add AI response to conversation history
    conversationHistory.push({
      role: 'assistant',
      content: data.response.content
    });

    // Keep only the last 10 messages to prevent the context from getting too large
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    return data.response.content;
  } catch (error) {
    console.error('Error analyzing dream:', error);
    throw error;
  }
}

// Function to reset conversation history (useful when starting a new dream analysis)
export function resetConversation() {
  conversationHistory = [];
}
