import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const uniqueSuffix = Date.now();

  const organizationSlug = `e2e-users-org-${uniqueSuffix}`;
  const userEmail = `user-${uniqueSuffix}@agripilot.test`;
  const secondaryUserEmail = `secondary-${uniqueSuffix}@agripilot.test`;
  const updatedUserEmail = `updated-${uniqueSuffix}@agripilot.test`;

  let organizationId: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'E2E Users Organization',
        slug: organizationSlug,
        email: `org-${uniqueSuffix}@agripilot.test`,
      })
      .expect(201);

    organizationId = organizationResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users - creates a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Pierre',
        lastName: 'E2E',
        email: userEmail,
        password: 'Password123!',
        organizationId,
      })
      .expect(201);

    expect(response.body).toMatchObject({
      firstName: 'Pierre',
      lastName: 'E2E',
      email: userEmail,
      role: 'member',
    });

    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.organization).toBeDefined();
    expect(response.body.organization.id).toBe(organizationId);
    expect(response.body.passwordHash).toBeUndefined();
    expect(response.body.password).toBeUndefined();

    userId = response.body.id;
  });

  it('POST /users - returns 404 for an unknown organization', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Unknown',
        lastName: 'Organization',
        email: `unknown-org-${uniqueSuffix}@agripilot.test`,
        password: 'Password123!',
        organizationId: '00000000-0000-4000-8000-000000000000',
      })
      .expect(404);

    expect(response.body.message).toBe('Organization not found');
  });

  it('POST /users - rejects a duplicate email', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Duplicate',
        lastName: 'User',
        email: userEmail,
        password: 'Password123!',
        organizationId,
      })
      .expect(409);

    expect(response.body.message).toBe('Email already exists');
  });

  it('GET /users - returns users without password hashes', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    const user = response.body.find(
      (item: { id: string }) => item.id === userId,
    );

    expect(user).toBeDefined();
    expect(user).toMatchObject({
      id: userId,
      email: userEmail,
      organization: {
        id: organizationId,
      },
    });

    expect(user.passwordHash).toBeUndefined();
  });

  it('GET /users/:id - returns a user', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: userId,
      firstName: 'Pierre',
      lastName: 'E2E',
      email: userEmail,
      role: 'member',
      organization: {
        id: organizationId,
      },
    });

    expect(response.body.passwordHash).toBeUndefined();
  });

  it('GET /users/:id - returns 404 for an unknown user', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/00000000-0000-4000-8000-000000000000')
      .expect(404);

    expect(response.body.message).toBe('User not found');
  });

  it('PATCH /users/:id - updates a user', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({
        firstName: 'Pierre Updated',
        lastName: 'E2E Updated',
        email: updatedUserEmail,
        role: 'manager',
        password: 'NewPassword123!',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: userId,
      firstName: 'Pierre Updated',
      lastName: 'E2E Updated',
      email: updatedUserEmail,
      role: 'manager',
    });

    expect(response.body.passwordHash).toBeUndefined();
  });

  it('PATCH /users/:id - rejects an email already used by another user', async () => {
    const secondaryResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Secondary',
        lastName: 'User',
        email: secondaryUserEmail,
        password: 'Password123!',
        organizationId,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send({
        email: secondaryUserEmail,
      })
      .expect(409);

    expect(response.body.message).toBe('Email already exists');

    await request(app.getHttpServer())
      .delete(`/users/${secondaryResponse.body.id}`)
      .expect(200);
  });

  it('DELETE /users/:id - deletes a user', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200);
  });

  it('GET /users/:id - returns 404 after deletion', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(404);

    expect(response.body.message).toBe('User not found');
  });
});
