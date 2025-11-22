
import { describe, it, expect } from 'vitest';
import { masterApi } from '../../services/masterApi';
import { tenantApi } from '../../services/tenantApi';
import { MOCK_COMPANIES, MOCK_EQUIPMENT } from '../../services/mockData';

describe('Service Layer Abstraction', () => {
  describe('masterApi', () => {
    it('getCompanies returns all mock companies', async () => {
      const companies = await masterApi.getCompanies();
      expect(companies).toHaveLength(MOCK_COMPANIES.length);
      expect(companies[0].name).toBeDefined();
    });
  });

  describe('tenantApi', () => {
    it('getEquipments filters by companyId', async () => {
      const targetCompanyId = 'c1';
      const equipments = await tenantApi.getEquipments(targetCompanyId);
      
      // Verify all returned items belong to c1
      equipments.forEach(eq => {
        expect(eq.companyId).toBe(targetCompanyId);
      });

      // Verify count matches mock data count for c1
      const expectedCount = MOCK_EQUIPMENT.filter(e => e.companyId === targetCompanyId).length;
      expect(equipments).toHaveLength(expectedCount);
    });

    it('getEquipments returns empty array for non-existent company', async () => {
      const equipments = await tenantApi.getEquipments('non-existent-id');
      expect(equipments).toEqual([]);
    });
  });
});
