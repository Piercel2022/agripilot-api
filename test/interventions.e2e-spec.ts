import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

describe('Interventions (e2e)', () => {
  let app: INestApplication;

  let accessToken: string;
  let secondAccessToken: string;

  let farmId: string;
  let secondFarmId: string;

  let fieldId: string;
  let secondFieldId: string;

  let cropId: string;
  let secondCropId: string;

  let campaignId: string;
  let interventionId: string;

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
        name: `Interventions E2E ${timestamp}`,
        slug: `interventions-e2e-${timestamp}`,
        email: `interventions-${timestamp}@example.com`,
      })
      .expect(201);

    const organizationId = organizationResponse.body.id;

    const secondOrganizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: `Interventions E2E Second ${timestamp}`,
        slug: `interventions-e2e-second-${timestamp}`,
        email: `interventions-second-${timestamp}@example.com`,
      })
      .expect(201);

    const secondOrganizationId = secondOrganizationResponse.body.id;

    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Intervention',
        lastName: 'Tester',
        email: `intervention-user-${timestamp}@example.com`,
        password: 'Password123!',
        role: 'member',
        organizationId,
      })
      .expect(201);

    const secondUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Second',
        lastName: 'Intervention',
        email: `intervention-second-${timestamp}@example.com`,
        password: 'Password123!',
        role: 'member',
        organizationId: secondOrganizationId,
      })
      .expect(201);

    expect(userResponse.body.id).toBeDefined();
    expect(secondUserResponse.body.id).toBeDefined();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `intervention-user-${timestamp}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `intervention-second-${timestamp}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;

    const farmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Ferme Intervention E2E',
        city: 'Strasbourg',
        postalCode: '67000',
        country: 'France',
      })
      .expect(201);

    farmId = farmResponse.body.id;

    const secondFarmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Ferme Intervention Second E2E',
        city: 'Colmar',
        postalCode: '68000',
        country: 'France',
      })
      .expect(201);

    secondFarmId = secondFarmResponse.body.id;

    const fieldResponse = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Parcelle Intervention Nord',
        areaHectares: 15.5,
        soilType: 'Limoneux',
        cropType: 'Blé tendre',
        farmId,
      })
      .expect(201);

    fieldId = fieldResponse.body.id;

    const secondFieldResponse = await request(app.getHttpServer())
      .post('/fields')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Parcelle Intervention Sud',
        areaHectares: 8.25,
        soilType: 'Argileux',
        cropType: 'Maïs',
        farmId: secondFarmId,
      })
      .expect(201);

    secondFieldId = secondFieldResponse.body.id;

    const cropResponse = await request(app.getHttpServer())
      .post('/crops')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Blé tendre',
        variety: 'Apache',
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

    const campaignResponse = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Campagne Blé 2026',
        season: '2026',
        startDate: '2026-10-01',
        endDate: '2027-07-15',
        status: 'active',
        notes: 'Campagne utilisée pour les tests E2E interventions',
        cropId,
      })
      .expect(201);

    campaignId = campaignResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /interventions - rejects unauthenticated requests', async () => {
    await request(app.getHttpServer()).get('/interventions').expect(401);
  });

  it('POST /interventions - creates an intervention with complete data', async () => {
    const response = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Traitement préventif',
        type: 'phytosanitary',
        scheduledDate: '2026-10-15',
        status: 'planned',
        notes: 'Intervention préventive sur la parcelle nord',
        campaignId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Traitement préventif');
    expect(response.body.type).toBe('phytosanitary');
    expect(response.body.status).toBe('planned');
    expect(response.body.notes).toBe(
      'Intervention préventive sur la parcelle nord',
    );
    expect(response.body.campaign.id).toBe(campaignId);

    interventionId = response.body.id;
  });

  it('POST /interventions - rejects an unknown campaign', async () => {
    await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Intervention invalide',
        type: 'irrigation',
        scheduledDate: '2026-10-20',
        campaignId: UNKNOWN_UUID,
      })
      .expect(404);
  });

  it('POST /interventions - rejects a campaign from another organization', async () => {
    const secondCampaignResponse = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Campagne Second Org',
        season: '2026',
        status: 'active',
        cropId: secondCropId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Intervention cross-campaign',
        type: 'irrigation',
        scheduledDate: '2026-10-20',
        campaignId: secondCampaignResponse.body.id,
      })
      .expect(404);
  });

  it('GET /interventions - returns interventions scoped to the organization', async () => {
    expect(interventionId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get('/interventions')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(
      response.body.some(
        (intervention: { id: string }) => intervention.id === interventionId,
      ),
    ).toBe(true);

    expect(
      response.body.every(
        (intervention: {
          campaign: { crop: { field: { farm: { id: string } } } };
        }) => intervention.campaign.crop.field.farm.id === farmId,
      ),
    ).toBe(true);
  });

  it('GET /interventions/:id - returns the intervention with relations', async () => {
    expect(interventionId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(interventionId);
    expect(response.body.campaign.id).toBe(campaignId);
    expect(response.body.campaign.crop.id).toBe(cropId);
    expect(response.body.campaign.crop.field.id).toBe(fieldId);
    expect(response.body.campaign.crop.field.farm.id).toBe(farmId);
  });

  it('GET /interventions/:id - rejects an unknown intervention', async () => {
    await request(app.getHttpServer())
      .get(`/interventions/${UNKNOWN_UUID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it.each([
    ['GET', 'get'],
    ['PATCH', 'patch'],
    ['DELETE', 'delete'],
  ] as const)(
    '%s /interventions/:id - rejects an invalid uuid',
    async (_label, method) => {
      await request(app.getHttpServer())
        [method]('/interventions/not-a-uuid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    },
  );

  it('PATCH /interventions/:id - updates the intervention', async () => {
    expect(interventionId).toBeDefined();

    const response = await request(app.getHttpServer())
      .patch(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Traitement préventif mis à jour',
        type: 'phytosanitary',
        status: 'completed',
        notes: 'Intervention terminée',
      })
      .expect(200);

    expect(response.body.id).toBe(interventionId);
    expect(response.body.name).toBe('Traitement préventif mis à jour');
    expect(response.body.status).toBe('completed');
    expect(response.body.notes).toBe('Intervention terminée');
  });

  it('GET /interventions/:id - rejects access from another organization', async () => {
    await request(app.getHttpServer())
      .get(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .expect(404);
  });

  it('PATCH /interventions/:id - rejects updates from another organization', async () => {
    await request(app.getHttpServer())
      .patch(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({ name: 'Modification interdite' })
      .expect(404);
  });

  it('DELETE /interventions/:id - rejects deletion from another organization', async () => {
    await request(app.getHttpServer())
      .delete(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .expect(404);
  });

  it('DELETE /interventions/:id - deletes the intervention', async () => {
    await request(app.getHttpServer())
      .delete(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
