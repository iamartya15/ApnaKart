import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { OTP } from '../models/otp.model';

describe('ApnaKart Auth API Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/apnakart_test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await OTP.deleteMany({});
  });

  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    mobile: '9876543210',
  };

  it('should sign up a user successfully', async () => {
    const res = await request(app).post('/api/auth/signup').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Registration successful');

    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeDefined();
    expect(user?.name).toBe(testUser.name);
  });

  it('should generate an OTP code', async () => {
    const res = await request(app).post('/api/auth/generate-otp').send({
      identifier: 'otp_user@example.com',
      purpose: 'login',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('OTP sent successfully');

    const record = await OTP.findOne({ identifier: 'otp_user@example.com' });
    expect(record).toBeDefined();
    expect(record?.otp).toHaveLength(6);
  });
});
