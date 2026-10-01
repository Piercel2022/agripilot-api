import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from './../src/app.module.js';

describe('Crops (e2e)', () => {
  let app: INestApplication;

  let accessToken: string;
  let secondAccessToken: string;
  let organizationId: string;
  let secondOrganizationId: string;
  let farmId: string;
  let secondFarmId: string;
  let fieldId: string;
  let secondFieldId: string;
  let cropId: string;

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
        name: `Crops E2E Organization ${timestamp}`,
        slug: `crops-e2e-${timestamp}`,
      })
      .expect(201);

    organizationId = organizationResponse.body.id;

    const secondOrganizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: `Crops E2E Organization 2 ${timestamp}`,
        slug: `crops-e2e-2-${timestamp}`,
      })
      .expect(201);

    secondOrganizationId = secondOrganizationResponse.body.id;

    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Crops',
        lastName: 'Tester',
        email: `crops-${timestamp}@example.com`,
        password: 'password123',
        role: 'owner',
        organizationId,
      })
      .expect(201);

    const secondUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Crops',
        lastName: 'Tester 2',
        email: `crops-2-${timestamp}@example.com`,
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
        email: `crops-${timestamp}@example.com`,
        password: 'password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `crops-2-${timestamp}@example.com`,
        password: 'password123',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;

    const farmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Crops E2E Farm',
        city: 'Strasbourg',
        country: 'France',
      })
      .expect(201);

    farmId = farmResponse.body.id;

    const secondFarmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Crops E2E Farm 2',
        city: 'Strasbourg',
        country: 'France',
      })
      .expect(201);

    secondFarmId = secondFarmResponse.body.id;

    const fieldResponse = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Crops E2E Field',
        areaHectares: 15,
        soilType: 'Limoneux',
        farmId,
      })
      .expect(201);

    fieldId = fieldResponse.body.id;

    const secondFieldResponse = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Crops E2E Field 2',
        areaHectares: 20,
        soilType: 'Argileux',
        farmId: secondFarmId,
      })
      .expect(201);

    secondFieldId = secondFieldResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer())
      .get('/crops')
      .expect(401);
  });

  it('creates a crop with complete data', async () => {
    const response = await request(app.getHttpServer())
      .post('/crops')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Blé tendre',
        variety: 'Chevignon',
        season: '2026',
        sowingDate: '2025-10-15',
        harvestDate: '2026-07-20',
        status: 'active',
        notes: 'Culture principale de la parcelle',
        fieldId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Blé tendre');
    expect(response.body.variety).toBe('Chevignon');
    expect(response.body.season).toBe('2026');
    expect(response.body.sowingDate).toBe('2025-10-15');
    expect(response.body.harvestDate).toBe('2026-07-20');
    expect(response.body.status).toBe('active');
    expect(response.body.notes).toBe(
      'Culture principale de la parcelle',
    );
    expect(response.body.field.id).toBe(fieldId);

    cropId = response.body.id;
  });

  it('rejects creation with an unknown field', async () => {
    const response = await request(app.getHttpServer())
      .post('/crops')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Culture inconnue',
        fieldId: '00000000-0000-4000-8000-000000000000',
      })
      .expect(404);

    expect(response.body.message).toBe('Field not found');
  });

  it('rejects creation with another organization field', async () => {
    const response = await request(app.getHttpServer())
      .post('/crops')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Culture cross organization',
        fieldId: secondFieldId,
      })
      .expect(404);

    expect(response.body.message).toBe('Field not found');
  });

  it('lists crops scoped to the organization', async () => {
    const response = await request(app.getHttpServer())
      .get('/crops')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(
      response.body.some(
        (crop: { id: string }) => crop.id === cropId,
      ),
    ).toBe(true);

    expect(
      response.body.every(
        (crop: { field: { id: string } }) =>
          crop.field.id === fieldId,
      ),
    ).toBe(true);
  });

  it('gets a crop', async () => {
    const response = await request(app.getHttpServer())
      .get(`/crops/${cropId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(cropId);
    expect(response.body.name).toBe('Blé tendre');
    expect(response.body.field.id).toBe(fieldId);
    expect(response.body.field.farm.id).toBe(farmId);
  });

  it('returns 404 for an unknown crop', async () => {
    const response = await request(app.getHttpServer())
      .get('/crops/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Crop not found');
  });

  it('updates a crop', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/crops/${cropId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Blé tendre modifié',
        variety: 'KWS Extase',
        season: '2026-2027',
        status: 'harvested',
      })
      .expect(200);

    expect(response.body.id).toBe(cropId);
    expect(response.body.name).toBe('Blé tendre modifié');
    expect(response.body.variety).toBe('KWS Extase');
    expect(response.body.season).toBe('2026-2027');
    expect(response.body.status).toBe('harvested');
    expect(response.body.field.id).toBe(fieldId);
  });

  it('prevents another organization from accessing the crop', async () => {
    await request(app.getHttpServer())
      .get(`/crops/${cropId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .expect(404);
  });

  it('prevents another organization from updating the crop', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/crops/${cropId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Tentative cross organization',
      })
      .expect(404);

    expect(response.body.message).toBe('Crop not found');
  });

  it('prevents another organization from deleting the crop', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/crops/${cropId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Crop not found');
  });

  it('deletes a crop and returns 404 afterwards', async () => {
    await request(app.getHttpServer())
      .delete(`/crops/${cropId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/crops/${cropId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
