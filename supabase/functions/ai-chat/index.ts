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

    // Try to classify the message for fake/misleading content
    try {
      const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
      
      console.log('Making request to Hugging Face API for classification...');
      console.log('Token available:', !!huggingFaceToken);
      console.log('Message:', message);
      
      // First, classify the message for potential fake/misleading content
      const classificationResponse = await fetch(
        'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingFaceToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: message,
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
        }
      );
      
      console.log('Classification response status:', classificationResponse.status);
      
      let isSuspicious = false;
      let classificationConfidence = 0.5;
      
      if (classificationResponse.ok) {
        const classificationData = await classificationResponse.json();
        console.log('Classification response:', classificationData);
        
        if (Array.isArray(classificationData) && classificationData.length > 0) {
          // Some HF models return nested arrays, so unwrap safely
          const firstLevel = Array.isArray(classificationData[0]) ? classificationData[0] : classificationData;
          
          // Take top prediction (highest score)
          const top = firstLevel.reduce((best, cur) =>
            cur.score > best.score ? cur : best
          );

          isSuspicious = top.label === 'NEGATIVE' && top.score > 0.7;
          classificationConfidence = top.score;
        }
      }

      // Additional zero-shot classification for specific fake patterns
      const zeroShotResponse = await fetch(
        "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${huggingFaceToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: message,
            parameters: { candidate_labels: ["fake_scarcity", "hidden_fee", "safe"] }
          }),
        }
      );

      if (zeroShotResponse.ok) {
        const zeroShotData = await zeroShotResponse.json();
        console.log('Zero-shot classification response:', zeroShotData);
        
        // Check if fake_scarcity or hidden_fee have high scores
        if (zeroShotData.labels && zeroShotData.scores) {
          const fakeScarcityIndex = zeroShotData.labels.indexOf('fake_scarcity');
          const hiddenFeeIndex = zeroShotData.labels.indexOf('hidden_fee');
          
          if (fakeScarcityIndex !== -1 && zeroShotData.scores[fakeScarcityIndex] > 0.6) {
            isSuspicious = true;
          }
          if (hiddenFeeIndex !== -1 && zeroShotData.scores[hiddenFeeIndex] > 0.6) {
            isSuspicious = true;
          }
        }
      }
      
      // Check for suspicious patterns in the message
      const suspiciousPatterns = [
        /only \d+ left/i,
        /hurry.*before.*gone/i,
        /final price.*\+.*fee/i,
        /free.*iphone/i,
        /urgent.*act now/i,
        /limited time.*offer/i,
        /click here.*win/i,
        /congratulations.*selected/i
      ];
      
      const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(message));
      
      // Generate appropriate response based on classification
      if (isSuspicious || hasSuspiciousPattern) {
        const warningResponses = [
          `I notice your message contains language that might be associated with misleading content. "${message}" - Please be cautious about urgent offers or hidden fees. Can I help you fact-check something?`,
          `Your message "${message}" contains patterns often seen in deceptive content. I'd recommend verifying any offers or claims from multiple reliable sources. What specific information would you like me to help you research?`,
          `The message "${message}" has characteristics that suggest it might be misleading. Always be skeptical of urgent offers or unexpected fees. How can I help you verify this information?`
        ];
        
        aiResponse = warningResponses[Math.floor(Math.random() * warningResponses.length)];
        confidence = Math.round(classificationConfidence * 100);
      } else {
        // Generate helpful response for normal content
        const helpfulResponses = [
          `Thanks for your message about "${message}". I'm here to provide factual information and help with any questions you might have. What would you like to know more about?`,
          `I received your message: "${message}". I can help you research topics, verify information, or discuss various subjects. What can I assist you with today?`,
          `Regarding "${message}" - I'm happy to help you explore this topic further with reliable information. What specific aspect interests you most?`
        ];
        
        aiResponse = helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
        confidence = Math.round(classificationConfidence * 100);
      }
      
      console.log('Generated AI response:', aiResponse);
      console.log('Classification confidence:', confidence);
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