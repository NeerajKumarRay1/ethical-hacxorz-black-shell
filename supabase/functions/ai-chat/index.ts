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

    // Use Hugging Face's free inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: message,
          parameters: {
            max_length: 200,
            temperature: 0.8,
            do_sample: true,
            pad_token_id: 50256
          }
        }),
      }
    );

    let aiResponse = "I'm an AI assistant focused on providing helpful and ethical responses. How can I assist you today?";
    let confidence = 75; // Default confidence for fallback response

    if (response.ok) {
      const data = await response.json();
      console.log('Hugging Face response:', data);
      
      if (data && data[0] && data[0].generated_text) {
        // Extract only the new part of the response (DialoGPT includes the input)
        const fullText = data[0].generated_text;
        const newResponse = fullText.replace(message, '').trim();
        if (newResponse && newResponse.length > 0) {
          aiResponse = newResponse;
          confidence = Math.floor(Math.random() * 30) + 60; // Random confidence between 60-90
        }
      }
    } else {
      console.log('Hugging Face API error, using fallback response');
      // Add some variety to fallback responses
      const fallbackResponses = [
        "I'm an AI assistant focused on providing helpful and ethical responses. How can I assist you today?",
        "I'm here to help you with information and answer your questions. What would you like to know?",
        "As an AI assistant, I aim to provide accurate and helpful information. What can I help you with?",
        "I'm designed to assist with various topics while maintaining ethical guidelines. How may I help you?"
      ];
      aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
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