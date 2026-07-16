import client from './client';

/**
 * 2.1 Single & Bulk Allocation
 * Method & URL: POST /api/allocation/allocate
 * Request Body: { assetIds?: number[], assetId?: number, lokasiAlokasiId: number, catatan?: string }
 */
export const allocateAssets = async ({ assetIds, assetId, lokasiAlokasiId, catatan }) => {
  return await client.post('/allocation/allocate', {
    assetIds,
    assetId,
    lokasiAlokasiId: Number(lokasiAlokasiId),
    catatan,
  });
};

/**
 * 2.2 Atomic Relocation
 * Method & URL: POST /api/allocation/relocate
 * Request Body: { assetIds?: number[], assetId?: number, lokasiTujuanId: number, catatan?: string }
 */
export const relocateAssets = async ({ assetIds, assetId, lokasiTujuanId, catatan }) => {
  return await client.post('/allocation/relocate', {
    assetIds,
    assetId,
    lokasiTujuanId: Number(lokasiTujuanId),
    catatan,
  });
};

/**
 * 2.3 Allocated Asset Maintenance — Masuk Servis
 * Method & URL: POST /api/allocation/maintenance/start
 * Request Body: { assetId: number, lokasiServisId: number, catatan?: string }
 */
export const startMaintenance = async ({ assetId, lokasiServisId, catatan }) => {
  return await client.post('/allocation/maintenance/start', {
    assetId: Number(assetId),
    lokasiServisId: Number(lokasiServisId),
    catatan,
  });
};

/**
 * 2.4 Allocated Asset Maintenance — Selesai Servis (Selesaikan Servis & Kembalikan)
 * Method & URL: POST /api/allocation/maintenance/finish
 * Request Body: { assetId: number, kondisiHasil: 'BAIK' | 'RUSAK', catatan?: string }
 */
export const finishMaintenance = async ({ assetId, kondisiHasil, catatan }) => {
  return await client.post('/allocation/maintenance/finish', {
    assetId: Number(assetId),
    kondisiHasil,
    catatan,
  });
};

/**
 * 2.5 Allocation & Maintenance Audit Trail
 * Method & URL: GET /api/allocation/history
 * Query Params: ?assetId=1&jenisKejadian=ALOKASI
 */
export const getAllocationHistory = async (params = {}) => {
  return await client.get('/allocation/history', { params });
};

/**
 * 2.6 Location Summary
 * Method & URL: GET /api/allocation/location-summary
 */
export const getLocationSummary = async () => {
  return await client.get('/allocation/location-summary');
};

/**
 * 2.7 Safe Allocated Catalog for USER
 * Method & URL: GET /api/allocation/user-catalog
 */
export const getAllocatedCatalogUser = async () => {
  return await client.get('/allocation/user-catalog');
};

export const getUserAllocatedCatalog = getAllocatedCatalogUser;
