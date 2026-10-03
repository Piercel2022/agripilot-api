import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

const UNKNOWN_UUID = '00000000-0000-4000-8000-000000000000';

describe('Fertilisations (e2e)', () => {
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

  let fertilisationId: string;

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
        name: `Fertilisation E2E ${timestamp}`,
        slug: `fertilisation-e2e-${timestamp}`,
        email: `fertilisation-${timestamp}@example.com`,
      })
      .expect(201);

    const organizationId = organizationResponse.body.id;

    const secondOrganizationResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: `Fertilisation E2E Second ${timestamp}`,
        slug: `fertilisation-e2e-second-${timestamp}`,
        email: `fertilisation-second-${timestamp}@example.com`,
      })
      .expect(201);

    const secondOrganizationId = secondOrganizationResponse.body.id;

    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Fertilisation',
        lastName: 'Tester',
        email: `fertilisation-user-${timestamp}@example.com`,
        password: 'Password123!',
        role: 'member',
        organizationId,
      })
      .expect(201);

    const secondUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        firstName: 'Second',
        lastName: 'Fertilisation',
        email: `fertilisation-second-${timestamp}@example.com`,
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
        email: `fertilisation-user-${timestamp}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    const secondLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `fertilisation-second-${timestamp}@example.com`,
        password: 'Password123!',
      })
      .expect(201);

    secondAccessToken = secondLoginResponse.body.accessToken;

    const farmResponse = await request(app.getHttpServer())
      .post('/farms')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Ferme Fertilisation E2E',
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
        name: 'Ferme Fertilisation Second E2E',
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
        name: 'Parcelle Fertilisation Nord',
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
        name: 'Parcelle Fertilisation Sud',
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
        name: 'Campagne Blé Fertilisation 2026',
        season: '2026',
        startDate: '2026-10-01',
        endDate: '2027-07-15',
        status: 'active',
        notes: 'Campagne utilisée pour les tests E2E fertilisation',
        cropId,
      })
      .expect(201);

    campaignId = campaignResponse.body.id;

    const secondCampaignResponse = await request(app.getHttpServer())
      .post('/campaigns')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Campagne Maïs Second Org',
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
        name: 'Apport azoté',
        type: 'fertilization',
        scheduledDate: '2026-10-15',
        status: 'planned',
        notes: 'Intervention de fertilisation pour la parcelle nord',
        campaignId,
      })
      .expect(201);

    interventionId = interventionResponse.body.id;

    const secondInterventionResponse = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Fertilisation maïs',
        type: 'fertilization',
        scheduledDate: '2026-10-20',
        status: 'planned',
        campaignId: secondCampaignId,
      })
      .expect(201);

    secondInterventionId = secondInterventionResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /fertilisations - rejects unauthenticated requests', async () => {
    await request(app.getHttpServer())
      .get('/fertilisations')
      .expect(401);
  });

  it('POST /fertilisations - creates a fertilisation with complete data', async () => {
    const response = await request(app.getHttpServer())
      .post('/fertilisations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Apport azoté automne',
        product: 'Urée 46%',
        type: 'nitrogen',
        scheduledDate: '2026-10-15',
        completedDate: '2026-10-16',
        quantity: '250.50',
        unit: 'kg_per_hectare',
        applicationMethod: 'broadcast',
        status: 'completed',
        notes: 'Application réalisée sur la parcelle nord',
        interventionId,
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Apport azoté automne');
    expect(response.body.product).toBe('Urée 46%');
    expect(response.body.type).toBe('nitrogen');
    expect(response.body.scheduledDate).toBe('2026-10-15');
    expect(response.body.completedDate).toBe('2026-10-16');
    expect(response.body.quantity).toBe('250.50');
    expect(response.body.unit).toBe('kg_per_hectare');
    expect(response.body.applicationMethod).toBe('broadcast');
    expect(response.body.status).toBe('completed');
    expect(response.body.notes).toBe(
      'Application réalisée sur la parcelle nord',
    );
    expect(response.body.intervention.id).toBe(interventionId);

    fertilisationId = response.body.id;
  });

  it('POST /fertilisations - rejects an unknown intervention', async () => {
    await request(app.getHttpServer())
      .post('/fertilisations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Fertilisation invalide',
        product: 'NPK 15-15-15',
        type: 'npk',
        interventionId: UNKNOWN_UUID,
      })
      .expect(404);
  });

  it('POST /fertilisations - rejects an intervention from another organization', async () => {
    await request(app.getHttpServer())
      .post('/fertilisations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Fertilisation cross-organization',
        product: 'NPK 15-15-15',
        type: 'npk',
        quantity: '100',
        unit: 'kg',
        applicationMethod: 'broadcast',
        interventionId: secondInterventionId,
      })
      .expect(404);
  });

  it('GET /fertilisations - returns fertilisations scoped to the organization', async () => {
    expect(fertilisationId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get('/fertilisations')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(
      response.body.some(
        (fertilisation: { id: string }) =>
          fertilisation.id === fertilisationId,
      ),
    ).toBe(true);

    expect(
      response.body.every(
        (fertilisation: {
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
          fertilisation.intervention.campaign.crop.field.farm.id === farmId,
      ),
    ).toBe(true);
  });

  it('GET /fertilisations/:id - returns the fertilisation with relations', async () => {
    expect(fertilisationId).toBeDefined();

    const response = await request(app.getHttpServer())
      .get(`/fertilisations/${fertilisationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.id).toBe(fertilisationId);
    expect(response.body.intervention.id).toBe(interventionId);
    expect(response.body.intervention.campaign.id).toBe(campaignId);
    expect(response.body.intervention.campaign.crop.id).toBe(cropId);
    expect(response.body.intervention.campaign.crop.field.id).toBe(fieldId);
    expect(
      response.body.intervention.campaign.crop.field.farm.id,
    ).toBe(farmId);
  });

  it('GET /fertilisations/:id - rejects an unknown fertilisation', async () => {
    await request(app.getHttpServer())
      .get(`/fertilisations/${UNKNOWN_UUID}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('GET /fertilisations/:id - rejects a fertilisation from another organization', async () => {
    const secondFertilisationResponse = await request(app.getHttpServer())
      .post('/fertilisations')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Fertilisation Second Organisation',
        product: 'NPK 12-12-17',
        type: 'npk',
        quantity: '180',
        unit: 'kg',
        applicationMethod: 'localized',
        status: 'planned',
        interventionId: secondInterventionId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/fertilisations/${secondFertilisationResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('GET /fertilisations/:id - rejects an invalid UUID', async () => {
    await request(app.getHttpServer())
      .get('/fertilisations/not-a-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('PATCH /fertilisations/:id - updates fertilisation data', async () => {
    expect(fertilisationId).toBeDefined();

    const response = await request(app.getHttpServer())
      .patch(`/fertilisations/${fertilisationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Apport azoté automne modifié',
        product: 'Urée stabilisée 46%',
        quantity: '275.75',
        unit: 'kg_per_hectare',
        applicationMethod: 'localized',
        status: 'completed',
        notes: 'Application modifiée après contrôle terrain',
      })
      .expect(200);

    expect(response.body.id).toBe(fertilisationId);
    expect(response.body.name).toBe('Apport azoté automne modifié');
    expect(response.body.product).toBe('Urée stabilisée 46%');
    expect(response.body.quantity).toBe('275.75');
    expect(response.body.unit).toBe('kg_per_hectare');
    expect(response.body.applicationMethod).toBe('localized');
    expect(response.body.status).toBe('completed');
    expect(response.body.notes).toBe(
      'Application modifiée après contrôle terrain',
    );
    expect(response.body.intervention.id).toBe(interventionId);
  });

  it('PATCH /fertilisations/:id - rejects a fertilisation from another organization', async () => {
    const secondFertilisationResponse = await request(app.getHttpServer())
      .post('/fertilisations')
      .set('Authorization', `Bearer ${secondAccessToken}`)
      .send({
        name: 'Fertilisation protégée',
        product: 'Ammonitrate',
        type: 'nitrogen',
        quantity: '200',
        unit: 'kg',
        status: 'planned',
        interventionId: secondInterventionId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/fertilisations/${secondFertilisationResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Tentative de modification',
      })
      .expect(404);
  });

  it('PATCH /fertilisations/:id - rejects an invalid UUID', async () => {
    await request(app.getHttpServer())
      .patch('/fertilisations/not-a-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Fertilisation invalide',
      })
      .expect(400);
  });

  it('DELETE /fertilisations/:id - deletes the fertilisation', async () => {
    expect(fertilisationId).toBeDefined();

    await request(app.getHttpServer())
      .delete(`/fertilisations/${fertilisationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/fertilisations/${fertilisationId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('DELETE /fertilisations/:id - rejects an invalid UUID', async () => {
    await request(app.getHttpServer())
      .delete('/fertilisations/not-a-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });
});
