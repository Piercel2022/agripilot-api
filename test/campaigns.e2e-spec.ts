import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from './../src/app.module.js';

describe('Campaigns (e2e)', () => {
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
  let secondCropId: string;
  let campaignId: string;

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
        name: `Campaigns E2E Organization ${timestamp}`,
        slug: `campaigns-e2e-${timestamp}`,
      })
      .expect(201);

    organizationId = organizationResponse.body.id;

    const secondOrganizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: `Campaigns E2E Organization 2 ${timestamp}`,
        slug: `campaigns-e2e-2-${timestamp}`,
      })
      .expect(201);

    secondOrganizationId = secondOrganizationResponse.body.id;

    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Campaigns',
        lastName: 'Tester',
        email: `campaigns-${timestamp}@example.com`,
        password: 'password123',
        role: 'owner',
        organizationId,
      })
      .expect(201);

    const secondUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Campaigns',
        lastName: 'Tester 2',
        email: `campaigns-2-${timestamp}@example.com`,
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
        email: `campaigns-${timestamp}@example.com`,
        password: 'password123',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `campaigns-2-${timestamp}@example.com`,
        password: 'password123',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;

    const farmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Campaigns E2E Farm',
        city: 'Strasbourg',
        country: 'France',
      })
      .expect(201);

    farmId = farmResponse.body.id;

    const secondFarmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Campaigns E2E Farm 2',
        city: 'Strasbourg',
        country: 'France',
      })
      .expect(201);

    secondFarmId = secondFarmResponse.body.id;

    const fieldResponse = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Campaigns E2E Field',
        areaHectares: 18,
        soilType: 'Limoneux',
        farmId,
      })
      .expect(201);

    fieldId = fieldResponse.body.id;

    const secondFieldResponse = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Campaigns E2E Field 2',
        areaHectares: 22,
        soilType: 'Argileux',
        farmId: secondFarmId,
      })
      .expect(201);

    secondFieldId = secondFieldResponse.body.id;

    const cropResponse = await request(app.getHttpServer())
      .post('/crops')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Blé tendre',
        variety: 'Chevignon',
        season: '2026',
        status: 'active',
        fieldId,
      })
      .expect(201);

    cropId = cropResponse.body.id;

    const secondCropResponse = await request(app.getHttpServer())
      .post('/crops')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Maïs',
        variety: 'DKC',
        season: '2026',
        status: 'active',
        fieldId: secondFieldId,
      })
      .expect(201);

    secondCropId = secondCropResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects unauthenticated access', async () => {
    await request(app.getHttpServer())
      .get('/campaigns')
      .expect(401);
  });

  it('creates a campaign with complete data', async () => {
    const response = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Campagne Blé 2026',
        season: '2026',
        startDate: '2026-10-01',
        endDate: '2027-07-15',
        status: 'active',
        notes: 'Campagne principale de la parcelle',
        cropId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Campagne Blé 2026');
    expect(response.body.season).toBe('2026');
    expect(response.body.startDate).toBe('2026-10-01');
    expect(response.body.endDate).toBe('2027-07-15');
    expect(response.body.status).toBe('active');
    expect(response.body.notes).toBe(
      'Campagne principale de la parcelle',
    );
    expect(response.body.crop.id).toBe(cropId);

    campaignId = response.body.id;
  });

  it('rejects creation with an unknown crop', async () => {
    const response = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Campagne inconnue',
        season: '2026',
        cropId: '00000000-0000-4000-8000-000000000000',
      })
      .expect(404);

    expect(response.body.message).toBe('Crop not found');
  });

  it('rejects creation with another organization crop', async () => {
    const response = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Campagne cross organization',
        season: '2026',
        cropId: secondCropId,
      })
      .expect(404);

    expect(response.body.message).toBe('Crop not found');
  });

  it('lists campaigns scoped to the organization', async () => {
    const response = await request(app.getHttpServer())
      .get('/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(
      response.body.some(
        (campaign: { id: string }) =>
          campaign.id === campaignId,
      ),
    ).toBe(true);

    expect(
      response.body.every(
        (campaign: { crop: { id: string } }) =>
          campaign.crop.id === cropId,
      ),
    ).toBe(true);
  });

  it('gets a campaign', async () => {
    const response = await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(campaignId);
    expect(response.body.name).toBe('Campagne Blé 2026');
    expect(response.body.crop.id).toBe(cropId);
    expect(response.body.crop.field.id).toBe(fieldId);
    expect(response.body.crop.field.farm.id).toBe(farmId);
  });

  it('returns 404 for an unknown campaign', async () => {
    const response = await request(app.getHttpServer())
      .get(
        '/campaigns/00000000-0000-4000-8000-000000000000',
      )
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Campaign not found');
  });

  it('updates a campaign', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Campagne Blé 2026 Modifiée',
        season: '2026-2027',
        status: 'completed',
      })
      .expect(200);

    expect(response.body.id).toBe(campaignId);
    expect(response.body.name).toBe(
      'Campagne Blé 2026 Modifiée',
    );
    expect(response.body.season).toBe('2026-2027');
    expect(response.body.status).toBe('completed');
    expect(response.body.crop.id).toBe(cropId);
  });

  it('prevents another organization from accessing the campaign', async () => {
    await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .expect(404);
  });

  it('prevents another organization from updating the campaign', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Tentative cross organization',
      })
      .expect(404);

    expect(response.body.message).toBe('Campaign not found');
  });

  it('prevents another organization from deleting the campaign', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .expect(404);

    expect(response.body.message).toBe('Campaign not found');
  });

  it('deletes a campaign and returns 404 afterwards', async () => {
    await request(app.getHttpServer())
      .delete(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/campaigns/${campaignId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
