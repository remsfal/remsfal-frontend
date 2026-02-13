import { userHandlers } from './user.handlers';
import { projectHandlers } from './project.handlers';
import { projectMemberHandlers } from './project-member.handlers';
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

export const handlers = [
  ...userHandlers,
  ...projectHandlers,
  ...projectMemberHandlers,
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
];
