import { ResourceRegistry } from '../utils/registry';
import { repositoryResource } from './repository';
import { issueResource } from './issue';
import { pullRequestResource } from './pullRequest';
import { organizationResource } from './organization';
import { userResource } from './user';
import { commentResource } from './comment';
import { labelResource } from './label';
import { milestoneResource } from './milestone';
import { releaseResource } from './release';
import { branchResource } from './branch';
import { fileResource } from './file';

const registry = new ResourceRegistry();

registry.register(repositoryResource);
registry.register(issueResource);
registry.register(pullRequestResource);
registry.register(organizationResource);
registry.register(userResource);
registry.register(commentResource);
registry.register(labelResource);
registry.register(milestoneResource);
registry.register(releaseResource);
registry.register(branchResource);
registry.register(fileResource);

export { registry };
