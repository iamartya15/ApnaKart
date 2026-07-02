import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/token.model';
import { OTP } from '../models/otp.model';
import { MailService } from '../services/mail.service';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthController {
  // Email-based registration
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, mobile, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'Email is already registered' });
        return;
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = new User({
        name,
        email,
        mobile,
        password,
        emailVerificationToken: verificationToken,
        isEmailVerified: false,
      });

      await user.save();

      // Send verification link
      await MailService.sendVerificationEmail(email, verificationToken);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Verification email has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Verification token landing
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      if (!token) {
        res.status(400).json({ success: false, message: 'Verification token is required' });
        return;
      }

      const user = await User.findOne({ emailVerificationToken: token as string });
      if (!user) {
        res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        return;
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Your email has been verified successfully!',
      });
    } catch (error) {
      next(error);
    }
  }

  // Password Login
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      // Generate credentials tokens
      const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
      const refreshTokenValue = generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
      });

      // Save Refresh Token to MongoDB
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await RefreshToken.create({
        user: user._id,
        token: refreshTokenValue,
        expiresAt,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        accessToken,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.wallet.balance,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate OTP
  static async generateOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, purpose } = req.body; // identifier can be email

      // Generate random 6 digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

      await OTP.findOneAndUpdate(
        { identifier, purpose },
        { otp: otpCode, expiresAt },
        { upsert: true, new: true },
      );

      // Send via mail
      await MailService.sendOTPEmail(identifier, otpCode);

      res.status(200).json({
        success: true,
        message: `OTP sent successfully to ${identifier}`,
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP
  static async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, otp, purpose } = req.body;

      const record = await OTP.findOne({ identifier, otp, purpose });
      if (!record || record.expiresAt < new Date()) {
        res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
        return;
      }

      // Consume OTP
      await OTP.deleteOne({ _id: record._id });

      // If logging in via OTP
      if (purpose === 'login') {
        let user = await User.findOne({ email: identifier });
        if (!user) {
          // Auto register user if first time mobile/email login
          user = new User({
            name: identifier.split('@')[0] || 'User',
            email: identifier,
            isEmailVerified: true,
          });
          await user.save();
        }

        const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
        const refreshTokenValue = generateRefreshToken({
          userId: user._id.toString(),
          role: user.role,
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await RefreshToken.create({
          user: user._id,
          token: refreshTokenValue,
          expiresAt,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        });

        res.status(200).json({
          success: true,
          message: 'OTP verification & login successful',
          accessToken,
          refreshToken: refreshTokenValue,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            walletBalance: user.wallet.balance,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Password reset request
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        // Return 200 even if user not found for security reasons
        res.status(200).json({
          success: true,
          message: 'If a matching account exists, a password reset link has been sent.',
        });
        return;
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
      await user.save();

      await MailService.sendPasswordResetEmail(email, resetToken);

      res.status(200).json({
        success: true,
        message: 'If a matching account exists, a password reset link has been sent.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password execution
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        return;
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password has been updated successfully! You can login now.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Token Silent Refresh
  static async refresh(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required' });
        return;
      }

      const tokenRecord = await RefreshToken.findOne({ token: refreshToken, isRevoked: false });
      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        res.status(401).json({ success: false, message: 'Invalid or expired session' });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ success: false, message: 'User session no longer valid' });
        return;
      }

      const newAccessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (_error) {
      res.status(401).json({ success: false, message: 'Invalid session signature' });
    }
  }

  // Social Login Handler
  static async socialLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, name, provider, providerId } = req.body;

      let user = await User.findOne({ email });
      if (!user) {
        // Register new social user
        user = new User({
          name,
          email,
          isEmailVerified: true,
          googleId: provider === 'google' ? providerId : undefined,
          githubId: provider === 'github' ? providerId : undefined,
        });
        await user.save();
      }

      const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
      const refreshTokenValue = generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create({
        user: user._id,
        token: refreshTokenValue,
        expiresAt,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken: refreshTokenValue,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          walletBalance: user.wallet.balance,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // User Logout
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await RefreshToken.deleteOne({ token: refreshToken });
      }
      res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth Redirect
  static async googleRedirect(req: Request, res: Response): Promise<void> {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id';
    const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=profile%20email`;
    res.redirect(authUrl);
  }

  // Google OAuth Callback
  static async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;
      if (!code) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?status=error&message=NoCode`);
        return;
      }

      const clientId = process.env.GOOGLE_CLIENT_ID || 'dummy_client_id';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret';
      const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;

      // Exchange code for token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code with Google.');
      }

      const tokens = (await tokenResponse.json()) as any;
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile from Google.');
      }

      const profile = (await profileResponse.json()) as any;
      const email = profile.email;
      const name = profile.name || email.split('@')[0];

      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name,
          email,
          isEmailVerified: true,
          googleId: profile.id,
        });
        await user.save();
      } else if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }

      const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
      const refreshTokenValue = generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create({
        user: user._id,
        token: refreshTokenValue,
        expiresAt,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?status=oauth_success&token=${accessToken}&ref=${refreshTokenValue}`,
      );
    } catch (err: any) {
      console.error('[Google OAuth Error]:', err.message);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?status=error&message=OAuthFailed`);
    }
  }

  // GitHub OAuth Redirect
  static async githubRedirect(req: Request, res: Response): Promise<void> {
    const clientId = process.env.GITHUB_CLIENT_ID || 'dummy_github_id';
    const redirectUri = encodeURIComponent(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    res.redirect(authUrl);
  }

  // GitHub OAuth Callback
  static async githubCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.query;
      if (!code) {
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?status=error&message=NoCode`);
        return;
      }

      const clientId = process.env.GITHUB_CLIENT_ID || 'dummy_github_id';
      const clientSecret = process.env.GITHUB_CLIENT_SECRET || 'dummy_github_secret';

      // Exchange code
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code with GitHub.');
      }

      const tokens = (await tokenResponse.json()) as any;
      const profileResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: 'application/json',
          'User-Agent': 'ApnaKart-Server',
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user from GitHub.');
      }

      const profile = (await profileResponse.json()) as any;

      // Fetch user email if not exposed in public profile
      let email = profile.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'User-Agent': 'ApnaKart-Server',
          },
        });
        if (emailsResponse.ok) {
          const emails = (await emailsResponse.json()) as any;
          email = emails.find((e: any) => e.primary)?.email || emails[0]?.email;
        }
      }

      if (!email) {
        throw new Error('No public email associated with GitHub profile.');
      }

      const name = profile.name || profile.login || email.split('@')[0];

      let user = await User.findOne({ email });
      if (!user) {
        user = new User({
          name,
          email,
          isEmailVerified: true,
          githubId: profile.id.toString(),
        });
        await user.save();
      } else if (!user.githubId) {
        user.githubId = profile.id.toString();
        await user.save();
      }

      const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
      const refreshTokenValue = generateRefreshToken({
        userId: user._id.toString(),
        role: user.role,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await RefreshToken.create({
        user: user._id,
        token: refreshTokenValue,
        expiresAt,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?status=oauth_success&token=${accessToken}&ref=${refreshTokenValue}`,
      );
    } catch (err: any) {
      console.error('[GitHub OAuth Error]:', err.message);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?status=error&message=OAuthFailed`);
    }
  }
}
export default AuthController;
