import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';


import { AppModule } from './../src/app.module.js';

describe('Fields (e2e)', () => {
  let app: INestApplication;

  let accessToken: string;
  let secondAccessToken: string;
  let organizationId: string;
  let secondOrganizationId: string;
  let farmId: string;
  let secondFarmId: string;
  let fieldId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const timestamp = Date.now();

    const organizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: `Fields E2E Organization ${timestamp}`,
        slug: `fields-e2e-${timestamp}`,
      })
      .expect(201);

    organizationId = organizationResponse.body.id;

    const secondOrganizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: `Fields E2E Organization 2 ${timestamp}`,
        slug: `fields-e2e-2-${timestamp}`,
      })
      .expect(201);

    secondOrganizationId = secondOrganizationResponse.body.id;

    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Fields',
        lastName: 'Tester',
        email: `fields-${timestamp}@example.com`,
        password: 'password123',
        role: 'owner',
        organizationId,
      })
      .expect(201);

    const secondUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Fields',
        lastName: 'Tester 2',
        email: `fields-2-${timestamp}@example.com`,
        password: 'password123',
        role: 'owner',
        organizationId: secondOrganizationId,
      })
      .expect(201);

    expect(userResponse.body.id).toBeDefined();
    expect(secondUserResponse.body.id).toBeDefined();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `fields-${timestamp}@example.com`,
        password: 'password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `fields-2-${timestamp}@example.com`,
        password: 'password123',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;

    const farmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Fields E2E Farm',
        city: 'Strasbourg',
        country: 'France',
      })
      .expect(201);

    farmId = farmResponse.body.id;

    const secondFarmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Fields E2E Farm 2',
        city: 'Strasbourg',
        country: 'France',
      })
      .expect(201);

    secondFarmId = secondFarmResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer())
      .get('/fields')
      .expect(401);
  });

  it('creates a field', async () => {
    const response = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Parcelle E2E Nord',
        areaHectares: 12.5,
        soilType: 'Limoneux',
        cropType: 'Blé tendre',
        notes: 'Parcelle de test E2E',
        farmId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Parcelle E2E Nord');
    expect(Number(response.body.areaHectares)).toBe(12.5);
    expect(response.body.soilType).toBe('Limoneux');
    expect(response.body.cropType).toBe('Blé tendre');
    expect(response.body.notes).toBe('Parcelle de test E2E');
    expect(response.body.farm.id).toBe(farmId);

    fieldId = response.body.id;
  });

  it('rejects creation with an unknown farm', async () => {
    const response = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Parcelle Farm Inconnue',
        areaHectares: 5,
        farmId: '00000000-0000-4000-8000-000000000000',
      })
      .expect(404);

    expect(response.body.message).toBe('Farm not found');
  });

  it('rejects creation with another organization farm', async () => {
    const response = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Parcelle Cross Organization',
        areaHectares: 5,
        farmId: secondFarmId,
      })
      .expect(404);

    expect(response.body.message).toBe('Farm not found');
  });

  it('lists fields scoped to the organization', async () => {
    const response = await request(app.getHttpServer())
      .get('/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(
      response.body.some(
        (field: { id: string }) => field.id === fieldId,
      ),
    ).toBe(true);
    expect(
      response.body.every(
        (field: { farm: { id: string } }) =>
          field.farm.id === farmId,
      ),
    ).toBe(true);
  });

  it('gets a field', async () => {
    const response = await request(app.getHttpServer())
      .get(`/fields/${fieldId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(fieldId);
    expect(response.body.name).toBe('Parcelle E2E Nord');
    expect(response.body.farm.id).toBe(farmId);
  });

  it('returns 404 for an unknown field', async () => {
    const response = await request(app.getHttpServer())
      .get('/fields/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Field not found');
  });

  it('updates a field', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/fields/${fieldId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Parcelle E2E Nord Modifiée',
        areaHectares: 13.75,
        cropType: 'Maïs',
      })
      .expect(200);

    expect(response.body.id).toBe(fieldId);
    expect(response.body.name).toBe('Parcelle E2E Nord Modifiée');
    expect(Number(response.body.areaHectares)).toBe(13.75);
    expect(response.body.cropType).toBe('Maïs');
    expect(response.body.soilType).toBe('Limoneux');
  });

  it('prevents another organization from accessing the field', async () => {
    await request(app.getHttpServer())
      .get(`/fields/${fieldId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .expect(404);
  });

  it('prevents another organization from updating the field', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/fields/${fieldId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Tentative Cross Organization',
      })
      .expect(404);

    expect(response.body.message).toBe('Field not found');
  });

  it('deletes a field and returns 404 afterwards', async () => {
    await request(app.getHttpServer())
      .delete(`/fields/${fieldId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/fields/${fieldId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
