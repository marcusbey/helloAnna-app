import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    category: z.enum(['primary', 'social', 'promotions', 'updates', 'forums']).optional(),
    limit: z.number().optional().default(10)
  }))
  .query(async ({ input }) => {
    // In a real app, this would fetch emails from the database
    // For this MVP, we'll return mock data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock email summaries
    const mockEmails = Array.from({ length: input.limit }, (_, i) => ({
      id: `email-${i + 1}`,
      sender: `sender-${i + 1}@example.com`,
      subject: `Email subject ${i + 1}`,
      preview: `This is a preview of email ${i + 1}. It contains a brief summary of the email content...`,
      date: new Date(Date.now() - i * 3600000).toISOString(),
      isRead: Math.random() > 0.3,
      isPriority: Math.random() > 0.8,
      category: input.category || 'primary'
    }));
    
    return {
      emails: mockEmails,
      totalCount: 120,
      unreadCount: 15
    };
  });