import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai/ai.service';
import { ChatHistory } from '../models/chat-history.model';

export class AIController {
  // NLP Search query parsing to filter values
  static async parseSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ success: false, message: 'Text criteria is required' });
        return;
      }

      const prompt = `Extract e-commerce search criteria from this text: "${text}". 
      Return JSON with keys: "searchTerm" (string), "maxPrice" (number or null), "filters" (object containing brand or category keys).`;

      const responseText = await aiService.analyze(prompt, true);
      const parsed = JSON.parse(responseText);

      res.status(200).json({
        success: true,
        parsed,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get AI Product summary
  static async getProductSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;

      const prompt = `Generate a product review summary for ID "${productId}". 
      Include structured pros (array of strings), cons (array of strings), summary text, and buying recommendation.`;

      const responseText = await aiService.analyze(prompt, true);
      const summary = JSON.parse(responseText);

      res.status(200).json({
        success: true,
        summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // Fake review trust analyzer
  static async analyzeReviewsTrust(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;

      const prompt = `Perform fraud review analysis on product ID: "${productId}".
      Return JSON with fields: trustScore (0-100), fakePercentage (0-100), sentiment (object with positive, neutral, negative fields), and key phrases (mostMentionedPositives, mostMentionedNegatives arrays).`;

      const responseText = await aiService.analyze(prompt, true);
      const analysis = JSON.parse(responseText);

      res.status(200).json({
        success: true,
        analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  // Seller scam evaluator
  static async evaluateSellerTrust(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sellerId } = req.params;

      const prompt = `Calculate merchant scam trust score for seller ID: "${sellerId}".
      Return JSON with fields: sellerTrustScore (0-100), deliverySuccessRate (percentage), returnRatePercentage, complaintHistoryCount.`;

      const responseText = await aiService.analyze(prompt, true);
      const sellerStats = JSON.parse(responseText);

      res.status(200).json({
        success: true,
        sellerStats,
      });
    } catch (error) {
      next(error);
    }
  }

  // Gift suggestions
  static async findGifts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { description } = req.body;
      if (!description) {
        res.status(400).json({ success: false, message: 'Person description is required' });
        return;
      }

      const prompt = `Generate gift suggestions based on this description: "${description}".
      Return JSON containing a suggestions array with fields item and reason.`;

      const responseText = await aiService.analyze(prompt, true);
      const result = JSON.parse(responseText);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Budget shopping combinations
  static async computeBudgetCombo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { budget, itemsCount } = req.body;
      if (!budget) {
        res.status(400).json({ success: false, message: 'Budget value is required' });
        return;
      }

      const prompt = `Suggest the best e-commerce purchase combination within an absolute budget limit of ₹${budget}. Max items: ${itemsCount || 3}.
      Return JSON containing items (name, price, reason), totalPrice, and remainingBalance.`;

      const responseText = await aiService.analyze(prompt, true);
      const result = JSON.parse(responseText);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Fashion outfit coordinator
  static async recommendOutfit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { gender, occasion, budget, season } = req.body;

      const prompt = `Generate clothing outfit recommendations. Criteria: Gender=${gender || 'unisex'}, Occasion=${occasion || 'casual'}, Budget=₹${budget || 'any'}, Season=${season || 'summer'}.
      Return JSON containing combinationName, items (item name, color, marketplace), and estimatedCost.`;

      const responseText = await aiService.analyze(prompt, true);
      const result = JSON.parse(responseText);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Fetch recent saved conversations list
  static async getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { conversationId } = req.params;
      const history = await ChatHistory.findOne({ conversationId });

      res.status(200).json({
        success: true,
        history: history ? history.messages : [],
      });
    } catch (error) {
      next(error);
    }
  }
}
export default AIController;
