import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { gmailService } from "@/lib/gmail";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    lastSync: z.number().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      // Check if user is authenticated with Gmail
      const isAuthenticated = await gmailService.isAuthenticated();
      
      if (!isAuthenticated) {
        throw new Error('Gmail not connected. Please authenticate first.');
      }

      // Get email statistics
      const emailStats = await gmailService.getEmailStats();
      
      // Get recent emails for processing
      const recentEmails = await gmailService.getRecentEmails(20);
      
      return {
        success: true,
        syncedAt: Date.now(),
        emailStats: {
          total: emailStats.totalEmails,
          unread: emailStats.unreadCount,
          important: emailStats.importantCount,
          today: emailStats.todayCount,
          processed: recentEmails.length
        },
        recentEmails: recentEmails.slice(0, 5).map(email => ({
          id: email.id,
          subject: email.subject,
          from: email.from,
          snippet: email.snippet,
          isRead: email.isRead,
          date: email.date
        }))
      };
    } catch (error) {
      console.error('Email sync error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to sync emails');
    }
  });