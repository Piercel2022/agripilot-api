import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

describe('FarmsController (e2e)', () => {
  let app: INestApplication;

  const uniqueSuffix = Date.now();

  const primaryOrganizationSlug = `e2e-farms-primary-${uniqueSuffix}`;
  const secondaryOrganizationSlug = `e2e-farms-secondary-${uniqueSuffix}`;

  const primaryUserEmail = `farms-primary-${uniqueSuffix}@agripilot.test`;
  const secondaryUserEmail = `farms-secondary-${uniqueSuffix}@agripilot.test`;

  let primaryOrganizationId: string;
  let secondaryOrganizationId: string;
  let primaryAccessToken: string;
  let secondaryAccessToken: string;
  let farmId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const primaryOrganizationResponse = await request(
      app.getHttpServer(),
    )
      .post('/organizations')
      .send({
        name: 'E2E Farms Primary Organization',
        slug: primaryOrganizationSlug,
      })
      .expect(201);

    primaryOrganizationId = primaryOrganizationResponse.body.id;

    const secondaryOrganizationResponse = await request(
      app.getHttpServer(),
    )
      .post('/organizations')
      .send({
        name: 'E2E Farms Secondary Organization',
        slug: secondaryOrganizationSlug,
      })
      .expect(201);

    secondaryOrganizationId = secondaryOrganizationResponse.body.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Primary',
        lastName: 'Farm User',
        email: primaryUserEmail,
        password: 'Password123!',
        organizationId: primaryOrganizationId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'Secondary',
        lastName: 'Farm User',
        email: secondaryUserEmail,
        password: 'Password123!',
        organizationId: secondaryOrganizationId,
      })
      .expect(201);

    const primaryLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: primaryUserEmail,
        password: 'Password123!',
      })
      .expect(201);

    primaryAccessToken = primaryLoginResponse.body.accessToken;

    const secondaryLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: secondaryUserEmail,
        password: 'Password123!',
      })
      .expect(201);

    secondaryAccessToken = secondaryLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /farms - rejects unauthenticated requests', async () => {
    await request(app.getHttpServer())
      .get('/farms')
      .expect(401);
  });

  it('POST /farms - creates a farm for the authenticated organization', async () => {
    const response = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${primaryAccessToken}`)
      .send({
        name: 'Ferme E2E',
        address: '1 rue des Champs',
        city: 'Strasbourg',
        postalCode: '67000',
        country: 'France',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Ferme E2E',
      address: '1 rue des Champs',
      city: 'Strasbourg',
      postalCode: '67000',
      country: 'France',
    });

    expect(response.body.id).toEqual(expect.any(String));

    farmId = response.body.id;
  });

  it('GET /farms - returns farms from the authenticated organization', async () => {
    const response = await request(app.getHttpServer())
      .get('/farms')
      .set('Authorization', `Bearer ${primaryAccessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: farmId,
          name: 'Ferme E2E',
        }),
      ]),
    );

    expect(
      response.body.some(
        (farm: { organization?: { id?: string } }) =>
          farm.organization?.id === secondaryOrganizationId,
      ),
    ).toBe(false);
  });

  it('GET /farms/:id - returns a farm from the authenticated organization', async () => {
    const response = await request(app.getHttpServer())
      .get(`/farms/${farmId}`)
      .set('Authorization', `Bearer ${primaryAccessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: farmId,
      name: 'Ferme E2E',
      city: 'Strasbourg',
      postalCode: '67000',
    });
  });

  it('GET /farms/:id - returns 404 for an unknown farm', async () => {
    const response = await request(app.getHttpServer())
      .get('/farms/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${primaryAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Farm not found');
  });

  it('PATCH /farms/:id - updates a farm', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/farms/${farmId}`)
      .set('Authorization', `Bearer ${primaryAccessToken}`)
      .send({
        name: 'Ferme E2E Updated',
        city: 'Schiltigheim',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: farmId,
      name: 'Ferme E2E Updated',
      address: '1 rue des Champs',
      city: 'Schiltigheim',
      postalCode: '67000',
      country: 'France',
    });
  });

  it('GET /farms/:id - prevents access from another organization', async () => {
    const response = await request(app.getHttpServer())
      .get(`/farms/${farmId}`)
      .set('Authorization', `Bearer ${secondaryAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Farm not found');
  });

  it('PATCH /farms/:id - prevents updates from another organization', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/farms/${farmId}`)
      .set('Authorization', `Bearer ${secondaryAccessToken}`)
      .send({
        name: 'Unauthorized Farm Update',
      })
      .expect(404);

    expect(response.body.message).toBe('Farm not found');
  });

  it('DELETE /farms/:id - deletes a farm', async () => {
    await request(app.getHttpServer())
      .delete(`/farms/${farmId}`)
      .set('Authorization', `Bearer ${primaryAccessToken}`)
      .expect(200);
  });

  it('GET /farms/:id - returns 404 after deletion', async () => {
    const response = await request(app.getHttpServer())
      .get(`/farms/${farmId}`)
      .set('Authorization', `Bearer ${primaryAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Farm not found');
  });
});
