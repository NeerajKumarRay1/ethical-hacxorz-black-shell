import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing message:', message, 'for session:', sessionId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save user message to database
    if (sessionId) {
      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          content: message,
          sender: 'user'
        });

      if (userMessageError) {
        console.error('Error saving user message:', userMessageError);
      }
    }

    let aiResponse = "I'm an AI assistant focused on providing helpful and ethical responses. How can I assist you today?";
    let confidence = 75;

    // Try to get a real AI response from Hugging Face
    try {
      const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
      
      console.log('Making request to Hugging Face API...');
      console.log('Token available:', !!huggingFaceToken);
      console.log('Message:', message);
      
      const response = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-small',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingFaceToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {
              past_user_inputs: [],
              generated_responses: [],
              text: message
            },
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
        }
      );
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Hugging Face response:', data);
        
        if (data && data.generated_text) {
          // DialoGPT model returns conversational response
          console.log('Raw model output:', JSON.stringify(data, null, 2));
          
          aiResponse = data.generated_text.trim();
          confidence = 85; // High confidence for successful API call
          
          console.log('Generated AI response:', aiResponse);
          console.log('Confidence:', confidence);
        } else if (data && Array.isArray(data) && data.length > 0 && data[0].generated_text) {
          // Alternative format handling
          aiResponse = data[0].generated_text.trim();
          confidence = 85;
          
          console.log('Generated AI response:', aiResponse);
          console.log('Confidence:', confidence);
        }
      } else {
        const errorText = await response.text();
        console.log('API Error:', errorText);
        
        // Create a more dynamic fallback response
        const fallbackResponses = [
          `I see you mentioned "${message}". That's interesting! Can you tell me more about what you'd like to know or discuss?`,
          `Regarding "${message}" - I'm here to help! What specific information or assistance are you looking for?`,
          `Thanks for bringing up "${message}". I'd be happy to help you explore this topic further. What questions do you have?`,
          `I notice you're asking about "${message}". While I process that, what particular aspect interests you most?`
        ];
        
        aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        confidence = 65;
      }
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      
      // Even better fallback with message context
      const dynamicFallbacks = [
        `I received your message: "${message}". I'm processing this and would love to help! What can I assist you with?`,
        `Thank you for reaching out about "${message}". I'm here to provide helpful information. What would you like to know?`,
        `I see you're interested in "${message}". That's a great topic! How can I best support you with this?`
      ];
      
      aiResponse = dynamicFallbacks[Math.floor(Math.random() * dynamicFallbacks.length)];
      confidence = 60;
    }

    // Add ethical considerations to responses about sensitive topics
    if (message.toLowerCase().includes('fake') || message.toLowerCase().includes('misinformation')) {
      aiResponse += "\n\nRemember to verify information from multiple reliable sources and think critically about what you read online.";
      confidence = Math.max(confidence - 15, 45); // Lower confidence for sensitive topics
    }

    // Save AI response to database
    if (sessionId) {
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          content: aiResponse,
          sender: 'ai',
          confidence: confidence
        });

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError);
      }
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        confidence: confidence
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        response: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        confidence: 30
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});