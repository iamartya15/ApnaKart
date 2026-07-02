import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, category } = req.query;
      if (!q) {
        res
          .status(400)
          .json({ success: false, message: 'Search query parameter "q" is required.' });
        return;
      }

      const products = await SearchService.search(q as string, category as string);

      res.status(200).json({
        success: true,
        count: products.length,
        query: q,
        products,
      });
    } catch (error) {
      next(error);
    }
  }

  static autocomplete(req: Request, res: Response, next: NextFunction): void {
    try {
      const { q } = req.query;
      if (!q) {
        res.status(200).json({ success: true, suggestions: [] });
        return;
      }

      const suggestions = SearchService.autocomplete(q as string);
      res.status(200).json({ success: true, suggestions });
    } catch (error) {
      next(error);
    }
  }

  static getMetadata(req: Request, res: Response, next: NextFunction): void {
    try {
      res.status(200).json({
        success: true,
        recent: SearchService.getRecentQueries(),
        trending: SearchService.getTrendingQueries(),
      });
    } catch (error) {
      next(error);
    }
  }
}
export default SearchController;
