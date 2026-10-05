import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

describe('Irrigations (e2e)', () => {
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
  let secondCampaignId: string;

  let interventionId: string;
  let secondInterventionId: string;

  let irrigationId: string;

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
        name: `Irrigation E2E ${timestamp}`,
        slug: `irrigation-e2e-${timestamp}`,
        email: `irrigation-${timestamp}@example.com`,
      })
      .expect(201);

    const organizationId = organizationResponse.body.id;

    const secondOrganizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: `Irrigation E2E Second ${timestamp}`,
        slug: `irrigation-e2e-second-${timestamp}`,
        email: `irrigation-second-${timestamp}@example.com`,
      })
      .expect(201);

    const secondOrganizationId = secondOrganizationResponse.body.id;

    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Irrigation',
        lastName: 'Tester',
        email: `irrigation-user-${timestamp}@example.com`,
        password: 'Password123!',
        role: 'member',
        organizationId,
      })
      .expect(201);

    const secondUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Second',
        lastName: 'Irrigation',
        email: `irrigation-second-${timestamp}@example.com`,
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
        email: `irrigation-user-${timestamp}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `irrigation-second-${timestamp}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;

    const farmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Ferme Irrigation E2E',
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
        name: 'Ferme Irrigation Second E2E',
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
        name: 'Parcelle Irrigation Nord',
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
        name: 'Parcelle Irrigation Sud',
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
        name: 'Campagne Blé Irrigation 2026',
        season: '2026',
        startDate: '2026-10-01',
        endDate: '2027-07-15',
        status: 'active',
        notes: 'Campagne utilisée pour les tests E2E irrigation',
        cropId,
      })
      .expect(201);

    campaignId = campaignResponse.body.id;

    const secondCampaignResponse = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Campagne Maïs Irrigation Second Org',
        season: '2026',
        status: 'active',
        cropId: secondCropId,
      })
      .expect(201);

    secondCampaignId = secondCampaignResponse.body.id;

    const interventionResponse = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Irrigation parcelle Nord',
        type: 'irrigation',
        scheduledDate: '2026-10-20',
        status: 'planned',
        notes: 'Intervention d’irrigation pour la parcelle nord',
        campaignId,
      })
      .expect(201);

    interventionId = interventionResponse.body.id;

    const secondInterventionResponse = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Irrigation parcelle Sud',
        type: 'irrigation',
        scheduledDate: '2026-10-21',
        status: 'planned',
        campaignId: secondCampaignId,
      })
      .expect(201);

    secondInterventionId = secondInterventionResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /irrigations - rejects unauthenticated requests', async () => {
    await request(app.getHttpServer())
      .get('/irrigations')
      .expect(401);
  });

  it('POST /irrigations - creates an irrigation with complete data', async () => {
    const response = await request(app.getHttpServer())
      .post('/irrigations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Irrigation parcelle Nord',
        method: 'sprinkler',
        scheduledDate: '2026-10-20',
        completedDate: '2026-10-20',
        durationMinutes: 90,
        waterVolumeLiters: '1250.50',
        status: 'completed',
        notes: 'Irrigation réalisée sur la parcelle nord',
        interventionId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Irrigation parcelle Nord');
    expect(response.body.method).toBe('sprinkler');
    expect(response.body.scheduledDate).toBe('2026-10-20');
    expect(response.body.completedDate).toBe('2026-10-20');
    expect(response.body.durationMinutes).toBe(90);
    expect(response.body.waterVolumeLiters).toBe('1250.50');
    expect(response.body.status).toBe('completed');
    expect(response.body.notes).toBe(
      'Irrigation réalisée sur la parcelle nord',
    );
    expect(response.body.intervention.id).toBe(interventionId);

    irrigationId = response.body.id;
  });

  it('POST /irrigations - rejects an unknown intervention', async () => {
    await request(app.getHttpServer())
      .post('/irrigations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Irrigation invalide',
        method: 'sprinkler',
        interventionId: UNKNOWN_UUID,
      })
      .expect(404);
  });

  it('POST /irrigations - rejects an intervention from another organization', async () => {
    await request(app.getHttpServer())
      .post('/irrigations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Irrigation cross-organization',
        method: 'drip',
        interventionId: secondInterventionId,
      })
      .expect(404);
  });

  it('GET /irrigations - returns irrigations scoped to the organization', async () => {
    expect(irrigationId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get('/irrigations')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(
      response.body.some(
        (irrigation: { id: string }) => irrigation.id === irrigationId,
      ),
    ).toBe(true);

    expect(
      response.body.every(
        (irrigation: {
          intervention: {
            campaign: {
              crop: {
                field: {
                  farm: {
                    id: string;
                  };
                };
              };
            };
          };
        }) =>
          irrigation.intervention.campaign.crop.field.farm.id === farmId,
      ),
    ).toBe(true);
  });

  it('GET /irrigations/:id - returns the irrigation with relations', async () => {
    expect(irrigationId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get(`/irrigations/${irrigationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(irrigationId);
    expect(response.body.intervention.id).toBe(interventionId);
    expect(response.body.intervention.campaign.id).toBe(campaignId);
    expect(response.body.intervention.campaign.crop.id).toBe(cropId);
    expect(response.body.intervention.campaign.crop.field.id).toBe(fieldId);
    expect(response.body.intervention.campaign.crop.field.farm.id).toBe(
      farmId,
    );
  });

  it('GET /irrigations/:id - rejects an unknown irrigation', async () => {
    await request(app.getHttpServer())
      .get(`/irrigations/${UNKNOWN_UUID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('GET /irrigations/:id - rejects an invalid UUID', async () => {
    await request(app.getHttpServer())
      .get('/irrigations/not-a-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('GET /irrigations/:id - rejects an irrigation from another organization', async () => {
    const response = await request(app.getHttpServer())
      .post('/irrigations')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Irrigation Second Org',
        method: 'drip',
        scheduledDate: '2026-10-21',
        status: 'planned',
        interventionId: secondInterventionId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/irrigations/${response.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('PATCH /irrigations/:id - updates irrigation status and data', async () => {
    expect(irrigationId).toBeDefined();

    const response = await request(app.getHttpServer())
      .patch(`/irrigations/${irrigationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'completed',
        completedDate: '2026-10-20',
        durationMinutes: 120,
        waterVolumeLiters: '1800.00',
        notes: 'Irrigation terminée',
      })
      .expect(200);

    expect(response.body.id).toBe(irrigationId);
    expect(response.body.status).toBe('completed');
    expect(response.body.completedDate).toBe('2026-10-20');
    expect(response.body.durationMinutes).toBe(120);
    expect(response.body.waterVolumeLiters).toBe('1800.00');
    expect(response.body.notes).toBe('Irrigation terminée');
  });

  it('PATCH /irrigations/:id - persists the updated status', async () => {
    expect(irrigationId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get(`/irrigations/${irrigationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.status).toBe('completed');
  });

  it('PATCH /irrigations/:id - rejects an invalid UUID', async () => {
    await request(app.getHttpServer())
      .patch('/irrigations/not-a-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'completed',
      })
      .expect(400);
  });

  it('PATCH /irrigations/:id - rejects an irrigation from another organization', async () => {
    const response = await request(app.getHttpServer())
      .post('/irrigations')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Irrigation Second Org Update',
        method: 'pivot',
        interventionId: secondInterventionId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/irrigations/${response.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: 'completed',
      })
      .expect(404);
  });

  it('DELETE /irrigations/:id - rejects an invalid UUID', async () => {
    await request(app.getHttpServer())
      .delete('/irrigations/not-a-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('DELETE /irrigations/:id - rejects an irrigation from another organization', async () => {
    const response = await request(app.getHttpServer())
      .post('/irrigations')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Irrigation Second Org Delete',
        method: 'flood',
        interventionId: secondInterventionId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/irrigations/${response.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('DELETE /irrigations/:id - deletes the irrigation', async () => {
    expect(irrigationId).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/irrigations/${irrigationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/irrigations/${irrigationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
