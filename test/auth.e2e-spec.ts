import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  let organizationId: string;
  let userEmail: string;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'E2E Auth Organization',
        slug: `e2e-auth-${Date.now()}`,
        email: 'e2e-auth@example.com',
      })
      .expect(201);

    organizationId = organizationResponse.body.id;
    expect(organizationId).toBeDefined();

    userEmail = `e2e-auth-${Date.now()}@example.com`;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          firstName: 'E2E',
          lastName: 'Auth',
          email: userEmail,
          password: 'password123',
          organizationId,
        })
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.firstName).toBe('E2E');
      expect(response.body.user.lastName).toBe('Auth');
      expect(response.body.user.email).toBe(userEmail);
      expect(response.body.user.role).toBe('member');
      expect(response.body.user.passwordHash).toBeUndefined();
    });
  });

  describe('POST /auth/login', () => {
    it('should reject an invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: 'wrong-password',
        })
        .expect(401);
    });

    it('should return a JWT access token with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: 'password123',
        })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.tokenType).toBe('Bearer');

      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.email).toBe(userEmail);
      expect(response.body.user.role).toBe('member');
      expect(response.body.user.passwordHash).toBeUndefined();

      accessToken = response.body.accessToken;
    });
  });

  describe('GET /auth/me', () => {
    it('should reject requests without a JWT', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should return the authenticated user with a valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(userEmail);
      expect(response.body.role).toBe('member');
      expect(response.body.passwordHash).toBeUndefined();
    });
  });
});
