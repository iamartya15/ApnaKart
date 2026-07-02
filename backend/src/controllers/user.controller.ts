import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class UserController {
  // Get User Profile
  static async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = req.user;
      res.status(200).json({
        success: true,
        user: {
          id: user?._id,
          name: user?.name,
          email: user?.email,
          mobile: user?.mobile,
          role: user?.role,
          addresses: user?.addresses,
          walletBalance: user?.wallet.balance,
          walletHistory: user?.wallet.history,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Update profile attributes
  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, mobile } = req.body;
      const user = req.user!;

      if (name) user.name = name;
      if (mobile) user.mobile = mobile;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Add new shipping address
  static async addAddress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { label, street, city, state, postalCode, country, isDefault } = req.body;
      const user = req.user!;

      if (isDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      user.addresses.push({
        label,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || user.addresses.length === 0, // Auto default if first address
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Address added successfully',
        addresses: user.addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update existing address
  static async updateAddress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { addressId } = req.params;
      const { label, street, city, state, postalCode, country, isDefault } = req.body;
      const user = req.user!;

      const addressIndex = user.addresses.findIndex(
        (addr) => (addr as any)._id.toString() === addressId,
      );
      if (addressIndex === -1) {
        res.status(404).json({ success: false, message: 'Address not found' });
        return;
      }

      if (isDefault) {
        user.addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      const current = user.addresses[addressIndex];
      if (label) current.label = label;
      if (street) current.street = street;
      if (city) current.city = city;
      if (state) current.state = state;
      if (postalCode) current.postalCode = postalCode;
      if (country) current.country = country;
      if (isDefault !== undefined) current.isDefault = isDefault;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        addresses: user.addresses,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete address
  static async deleteAddress(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { addressId } = req.params;
      const user = req.user!;

      const addressIndex = user.addresses.findIndex(
        (addr) => (addr as any)._id.toString() === addressId,
      );
      if (addressIndex === -1) {
        res.status(404).json({ success: false, message: 'Address not found' });
        return;
      }

      const wasDefault = user.addresses[addressIndex].isDefault;
      user.addresses.splice(addressIndex, 1);

      // Re-assign default if we deleted the default address and others remain
      if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        addresses: user.addresses,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default UserController;
