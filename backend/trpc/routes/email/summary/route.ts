import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { gmailService } from "@/lib/gmail";
import { openaiService } from "@/lib/openai";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    category: z.enum(['primary', 'social', 'promotions', 'updates', 'forums']).optional(),
    limit: z.number().optional().default(10)
  }))
  .query(async ({ input }) => {
    try {
      // Check if user is authenticated with Gmail
      const isAuthenticated = await gmailService.isAuthenticated();
      
      if (!isAuthenticated) {
        throw new Error('Gmail not connected. Please authenticate first.');
      }

      // Get recent emails
      const recentEmails = await gmailService.getRecentEmails(input.limit);
      
      // Get email statistics
      const emailStats = await gmailService.getEmailStats();
      
      // Process emails with AI categorization and priority detection
      const processedEmails = await Promise.all(
        recentEmails.map(async (email) => {
          try {
            // Use Emma to categorize and prioritize emails
            const response = await openaiService.processEmailRequest({
              subject: email.subject,
              sender: email.from,
              content: email.snippet,
              action: 'categorize'
            });
            
            const priorityResponse = await openaiService.processEmailRequest({
              subject: email.subject,
              sender: email.from,
              content: email.snippet,
              action: 'priority'
            });
            
            // Extract category and priority from AI responses
            const category = extractCategory(response.message);
            const isPriority = extractPriority(priorityResponse.message);
            
            return {
              id: email.id,
              sender: email.from,
              subject: email.subject,
              preview: email.snippet,
              date: email.date,
              isRead: email.isRead,
              isPriority,
              category,
              aiSummary: response.message
            };
          } catch (error) {
            console.error('Error processing email with AI:', error);
            // Fallback without AI processing
            return {
              id: email.id,
              sender: email.from,
              subject: email.subject,
              preview: email.snippet,
              date: email.date,
              isRead: email.isRead,
              isPriority: false,
              category: input.category || 'primary'
            };
          }
        })
      );
      
      return {
        emails: processedEmails,
        totalCount: emailStats.totalEmails,
        unreadCount: emailStats.unreadCount
      };
    } catch (error) {
      console.error('Email summary error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get email summary');
    }
  });

// Helper functions to extract AI insights
function extractCategory(aiResponse: string): string {
  const response = aiResponse.toLowerCase();
  if (response.includes('work') || response.includes('business')) return 'primary';
  if (response.includes('social') || response.includes('facebook') || response.includes('twitter')) return 'social';
  if (response.includes('promotion') || response.includes('marketing') || response.includes('deal')) return 'promotions';
  if (response.includes('newsletter') || response.includes('update')) return 'updates';
  if (response.includes('forum') || response.includes('discussion')) return 'forums';
  return 'primary';
}

function extractPriority(aiResponse: string): boolean {
  const response = aiResponse.toLowerCase();
  return response.includes('high') || response.includes('urgent') || response.includes('important');
}