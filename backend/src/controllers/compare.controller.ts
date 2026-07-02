import { Request, Response, NextFunction } from 'express';
import { CompareService } from '../services/compare.service';

export class CompareController {
  static async compare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.query;
      if (!ids) {
        res.status(400).json({
          success: false,
          message: 'Comparison query parameter "ids" (comma-separated product IDs) is required.',
        });
        return;
      }

      const idArray = (ids as string)
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      if (idArray.length < 2) {
        res
          .status(400)
          .json({ success: false, message: 'Minimum 2 product IDs required for comparison.' });
        return;
      }

      const matrix = await CompareService.compareProducts(idArray);

      res.status(200).json({
        success: true,
        matrix,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default CompareController;
