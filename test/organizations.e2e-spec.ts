import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';

describe('OrganizationsController (e2e)', () => {
  let app: INestApplication;

  const uniqueSuffix = Date.now();
  const primarySlug = `e2e-organization-${uniqueSuffix}`;
  const secondarySlug = `e2e-secondary-${uniqueSuffix}`;

  let organizationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /organizations - creates an organization', async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'E2E Organization',
        slug: primarySlug,
        email: 'e2e@agripilot.test',
        phone: '+33300000000',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'E2E Organization',
      slug: primarySlug,
      email: 'e2e@agripilot.test',
      phone: '+33300000000',
    });

    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    expect(response.body.updatedAt).toEqual(expect.any(String));

    organizationId = response.body.id;
  });

  it('POST /organizations - rejects a duplicate slug', async () => {
    const response = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Duplicate Organization',
        slug: primarySlug,
      })
      .expect(409);

    expect(response.body.message).toBe(
      'An organization with this slug already exists',
    );
  });

  it('GET /organizations - returns organizations', async () => {
    const response = await request(app.getHttpServer())
      .get('/organizations')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: organizationId,
          name: 'E2E Organization',
          slug: primarySlug,
        }),
      ]),
    );
  });

  it('GET /organizations/:id - returns an organization', async () => {
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: organizationId,
      name: 'E2E Organization',
      slug: primarySlug,
      email: 'e2e@agripilot.test',
      phone: '+33300000000',
    });
  });

  it('GET /organizations/:id - returns 404 for an unknown organization', async () => {
    const response = await request(app.getHttpServer())
      .get('/organizations/00000000-0000-4000-8000-000000000000')
      .expect(404);

    expect(response.body.message).toBe('Organization not found');
  });

  it('PATCH /organizations/:id - updates an organization', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}`)
      .send({
        name: 'Updated E2E Organization',
        phone: '+33400000000',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      id: organizationId,
      name: 'Updated E2E Organization',
      slug: primarySlug,
      email: 'e2e@agripilot.test',
      phone: '+33400000000',
    });
  });

  it('PATCH /organizations/:id - rejects a duplicate slug', async () => {
    const secondaryResponse = await request(app.getHttpServer())
      .post('/organizations')
      .send({
        name: 'Secondary E2E Organization',
        slug: secondarySlug,
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .patch(`/organizations/${organizationId}`)
      .send({
        slug: secondarySlug,
      })
      .expect(409);

    expect(response.body.message).toBe(
      'An organization with this slug already exists',
    );

    await request(app.getHttpServer())
      .delete(`/organizations/${secondaryResponse.body.id}`)
      .expect(200);
  });

  it('DELETE /organizations/:id - deletes an organization', async () => {
    await request(app.getHttpServer())
      .delete(`/organizations/${organizationId}`)
      .expect(200);
  });

  it('GET /organizations/:id - returns 404 after deletion', async () => {
    const response = await request(app.getHttpServer())
      .get(`/organizations/${organizationId}`)
      .expect(404);

    expect(response.body.message).toBe('Organization not found');
  });
});
