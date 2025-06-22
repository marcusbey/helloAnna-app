import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { gmailService } from "@/lib/gmail";
import { openaiService } from "@/lib/openai";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
    aiAssist: z.boolean().optional().default(false),
    tone: z.enum(['professional', 'friendly', 'formal', 'casual']).optional().default('professional')
  }))
  .mutation(async ({ input }) => {
    try {
      // Check if user is authenticated with Gmail
      const isAuthenticated = await gmailService.isAuthenticated();
      
      if (!isAuthenticated) {
        throw new Error('Gmail not connected. Please authenticate first.');
      }

      let emailBody = input.body;
      
      // If AI assistance is requested, enhance the email
      if (input.aiAssist) {
        const aiPrompt = `Please improve this email draft for me. Make it ${input.tone} in tone.
        
        To: ${input.to}
        Subject: ${input.subject}
        
        Original draft:
        ${input.body}
        
        Please provide a polished, well-structured email that maintains the core message but improves clarity, tone, and professionalism.`;
        
        try {
          const aiResponse = await openaiService.sendMessage(aiPrompt);
          emailBody = aiResponse.message;
        } catch (aiError) {
          console.error('AI assistance failed, using original body:', aiError);
          // Continue with original body if AI fails
        }
      }

      // Send the email through Gmail
      await gmailService.sendEmail(input.to, input.subject, emailBody);
      
      return {
        success: true,
        sentAt: Date.now(),
        to: input.to,
        subject: input.subject,
        enhancedByAI: input.aiAssist,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to send email');
    }
  });