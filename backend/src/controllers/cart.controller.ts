import { Request, Response, NextFunction } from 'express';
import { Cart } from '../models/cart.model';
import { redisClient } from '../config/redis';

export class CartController {
  // Get active cart (checks Redis cache first)
  static async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const guestId = req.query.guestId as string;

      if (!userId && !guestId) {
        res.status(200).json({ success: true, items: [], savedForLater: [] });
        return;
      }

      const cacheKey = userId ? `cart:user:${userId}` : `cart:guest:${guestId}`;

      // Try Redis Cart Cache
      if (redisClient.isOpen) {
        try {
          const cached = await redisClient.get(cacheKey);
          if (cached) {
            console.log(`[Redis Cart Hit] Served cart for key: ${cacheKey}`);
            res.status(200).json({ success: true, ...JSON.parse(cached) });
            return;
          }
        } catch (err) {
          console.warn('Redis cart read failed:', err);
        }
      }

      // Query Database
      const query = userId ? { user: userId, status: 'active' } : { guestId, status: 'active' };
      let cart = await Cart.findOne(query as any);

      if (!cart) {
        cart = await Cart.create({
          user: userId || undefined,
          guestId: userId ? undefined : guestId,
          items: [],
          savedForLater: [],
          status: 'active',
        });
      }

      const responseData = {
        items: cart.items,
        savedForLater: cart.savedForLater,
      };

      // Set Redis Cart Cache
      if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData)); // 1 hour expiry
      }

      res.status(200).json({ success: true, ...responseData });
    } catch (error) {
      next(error);
    }
  }

  // Add item to cart
  static async addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { guestId, productId, quantity, price, title, imageUrl, marketplace } = req.body;

      if (!productId || !quantity || !price || !title || !imageUrl || !marketplace) {
        res.status(400).json({ success: false, message: 'Missing item attributes' });
        return;
      }

      const query = userId ? { user: userId, status: 'active' } : { guestId, status: 'active' };
      let cart = await Cart.findOne(query as any);

      if (!cart) {
        cart = new Cart({
          user: userId || undefined,
          guestId: userId ? undefined : guestId,
          items: [],
          savedForLater: [],
          status: 'active',
        });
      }

      const existingIndex = cart.items.findIndex((item) => item.productId === productId);
      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price, title, imageUrl, marketplace });
      }

      await cart.save();

      // Invalidate Redis Cache
      const cacheKey = userId ? `cart:user:${userId}` : `cart:guest:${guestId}`;
      if (redisClient.isOpen) {
        await redisClient.del(cacheKey);
      }

      res.status(200).json({ success: true, items: cart.items });
    } catch (error) {
      next(error);
    }
  }

  // Update item quantity
  static async updateQuantity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { guestId, productId, quantity } = req.body;

      const query = userId ? { user: userId, status: 'active' } : { guestId, status: 'active' };
      const cart = await Cart.findOne(query as any);

      if (!cart) {
        res.status(404).json({ success: false, message: 'Cart not found' });
        return;
      }

      const index = cart.items.findIndex((item) => item.productId === productId);
      if (index > -1) {
        if (quantity <= 0) {
          cart.items.splice(index, 1);
        } else {
          cart.items[index].quantity = quantity;
        }
        await cart.save();
      }

      const cacheKey = userId ? `cart:user:${userId}` : `cart:guest:${guestId}`;
      if (redisClient.isOpen) {
        await redisClient.del(cacheKey);
      }

      res.status(200).json({ success: true, items: cart.items });
    } catch (error) {
      next(error);
    }
  }

  // Merge Guest Cart to Logged-in Cart on Login
  static async mergeCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const { guestId } = req.body;

      if (!userId || !guestId) {
        res.status(400).json({ success: false, message: 'Missing parameters for merge' });
        return;
      }

      const guestCart = await Cart.findOne({ guestId, status: 'active' });
      let userCart = await Cart.findOne({ user: userId, status: 'active' });

      if (guestCart && guestCart.items.length > 0) {
        if (!userCart) {
          userCart = await Cart.create({
            user: userId,
            items: [],
            savedForLater: [],
            status: 'active',
          });
        }

        // Merge items list
        guestCart.items.forEach((guestItem) => {
          const userIdx = userCart!.items.findIndex((x) => x.productId === guestItem.productId);
          if (userIdx > -1) {
            userCart!.items[userIdx].quantity += guestItem.quantity;
          } else {
            userCart!.items.push(guestItem);
          }
        });

        // Mark guest cart as ordered/merged
        guestCart.status = 'ordered';
        await guestCart.save();
        await userCart.save();
      }

      // Invalidate caches
      if (redisClient.isOpen) {
        await redisClient.del(`cart:user:${userId}`);
        await redisClient.del(`cart:guest:${guestId}`);
      }

      res.status(200).json({ success: true, message: 'Carts merged successfully' });
    } catch (error) {
      next(error);
    }
  }
}
export default CartController;
