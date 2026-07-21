import { authHandlers } from './auth.handlers';
import { userHandlers } from './user.handlers';
import { organizationHandlers } from './organization.handlers';
import { contractorHandlers } from './contractor.handlers';
import { projectHandlers } from './project.handlers';
import { projectMemberHandlers } from './project-member.handlers';
import { organizationMemberHandlers } from './organization-member.handlers';
import { propertyHandlers } from './property.handlers';
import { apartmentHandlers } from './apartment.handlers';
import { buildingHandlers } from './building.handlers';
import { siteHandlers } from './site.handlers';
import { commercialHandlers } from './commercial.handlers';
import { storageHandlers } from './storage.handlers';
import { rentalAgreementHandlers } from './rental-agreement.handlers';
import { tenancyHandlers } from './tenancy.handlers';
import { taskHandlers } from './task.handlers';
import { issueHandlers } from './issue.handlers';
import { inboxHandlers } from './inbox.handlers';
import { quotationRequestHandlers } from './quotation-request.handlers';
import { quotationHandlers } from './quotation.handlers';
import { tenantHandlers } from './tenant.handlers';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...organizationHandlers,
  ...contractorHandlers,
  ...projectHandlers,
  ...projectMemberHandlers,
  ...organizationMemberHandlers,
  ...propertyHandlers,
  ...apartmentHandlers,
  ...buildingHandlers,
  ...siteHandlers,
  ...commercialHandlers,
  ...storageHandlers,
  ...rentalAgreementHandlers,
  ...tenancyHandlers,
  ...taskHandlers,
  ...issueHandlers,
  ...inboxHandlers,
  ...quotationRequestHandlers,
  ...quotationHandlers,
  ...tenantHandlers,
];
