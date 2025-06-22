import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { gmailService } from "@/lib/gmail";
import { openaiService } from "@/lib/openai";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    emailId: z.string(),
    analysisType: z.enum(['summary', 'reply', 'action_items', 'sentiment', 'full_analysis'])
  }))
  .mutation(async ({ input }) => {
    try {
      // Check if user is authenticated with Gmail
      const isAuthenticated = await gmailService.isAuthenticated();
      
      if (!isAuthenticated) {
        throw new Error('Gmail not connected. Please authenticate first.');
      }

      // Get the specific email (this would require implementing getEmailById in gmailService)
      // For now, we'll get recent emails and find the one with matching ID
      const recentEmails = await gmailService.getRecentEmails(50);
      const targetEmail = recentEmails.find(email => email.id === input.emailId);
      
      if (!targetEmail) {
        throw new Error('Email not found');
      }

      let aiResponse;
      
      switch (input.analysisType) {
        case 'summary':
          aiResponse = await openaiService.processEmailRequest({
            subject: targetEmail.subject,
            sender: targetEmail.from,
            content: targetEmail.body,
            action: 'summarize'
          });
          break;
          
        case 'reply':
          aiResponse = await openaiService.processEmailRequest({
            subject: targetEmail.subject,
            sender: targetEmail.from,
            content: targetEmail.body,
            action: 'reply'
          });
          break;
          
        case 'action_items':
          const actionPrompt = `Analyze this email and extract any action items, tasks, or follow-ups needed:
          
          From: ${targetEmail.from}
          Subject: ${targetEmail.subject}
          Content: ${targetEmail.body}
          
          Please list any specific actions required, deadlines mentioned, or follow-up items.`;
          
          aiResponse = await openaiService.sendMessage(actionPrompt);
          break;
          
        case 'sentiment':
          const sentimentPrompt = `Analyze the sentiment and tone of this email:
          
          From: ${targetEmail.from}
          Subject: ${targetEmail.subject}
          Content: ${targetEmail.body}
          
          Provide: 1) Overall sentiment (positive/negative/neutral), 2) Tone (formal/casual/urgent/etc), 3) Key emotions detected`;
          
          aiResponse = await openaiService.sendMessage(sentimentPrompt);
          break;
          
        case 'full_analysis':
          const fullPrompt = `Provide a comprehensive analysis of this email:
          
          From: ${targetEmail.from}
          Subject: ${targetEmail.subject}
          Content: ${targetEmail.body}
          
          Please provide:
          1. Summary of key points
          2. Sentiment and tone analysis
          3. Action items or follow-ups needed
          4. Priority level and urgency
          5. Suggested response approach
          6. Any red flags or important considerations`;
          
          aiResponse = await openaiService.sendMessage(fullPrompt);
          break;
          
        default:
          throw new Error('Invalid analysis type');
      }
      
      return {
        success: true,
        emailId: input.emailId,
        analysisType: input.analysisType,
        analysis: aiResponse.message,
        analyzedAt: Date.now(),
        email: {
          subject: targetEmail.subject,
          from: targetEmail.from,
          date: targetEmail.date,
          snippet: targetEmail.snippet
        }
      };
    } catch (error) {
      console.error('Email analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze email');
    }
  });