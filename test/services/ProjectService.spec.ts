import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { projectService, type Project, type ProjectList } from '@/services/ProjectService';
import { server } from '../mocks/server';
import { testErrorHandling } from '../utils/testHelpers';

const mockProjects: ProjectList = {
  projects: [
    {
 id: 'project-1', title: 'Project 1', memberRole: 'MANAGER' 
},
    {
 id: 'project-2', title: 'Project 2', memberRole: 'CONTRACTOR' 
},
  ],
  offset: 0,
  limit: 10,
  total: 2,
};

const mockProject: Project = {
  id: 'project-1',
  title: 'Project 1',
  description: 'Test project description',
  memberRole: 'MANAGER',
};

const handlers = [
  http.get('/api/v1/projects', ({ request }) => {
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset') || '0';
    const limit = url.searchParams.get('limit') || '10';
    return HttpResponse.json({
      ...mockProjects,
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
  }),
  http.get('/api/v1/projects/:projectId', ({ params }) => {
    if (params.projectId === 'not-found') {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return HttpResponse.json({
      ...mockProject,
      id: params.projectId,
    });
  }),
  http.post('/api/v1/projects', async ({ request }) => {
    const body = (await request.json()) as { title: string };
    return HttpResponse.json(
      {
        id: 'new-project-id',
        title: body.title,
        memberRole: 'MANAGER',
      },
      { status: 201 },
    );
  }),
  http.patch('/api/v1/projects/:projectId', async ({ request, params }) => {
    const body = (await request.json()) as Partial<Project>;
    return HttpResponse.json({
      ...mockProject,
      ...body,
      id: params.projectId,
    });
  }),
  http.delete('/api/v1/projects/:projectId', () => {
    return HttpResponse.json({}, { status: 204 });
  }),
];

describe('ProjectService', () => {
  beforeEach(() => {
    server.use(...handlers);
  });

  describe('getProjects', () => {
    it('should fetch projects with default pagination', async () => {
      const result = await projectService.getProjects();
      expect(result.projects).toHaveLength(2);
      expect(result.offset).toBe(0);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(2);
    });

    it('should fetch projects with custom pagination', async () => {
      const result = await projectService.getProjects(20, 5);
      expect(result.offset).toBe(20);
      expect(result.limit).toBe(5);
    });
  });

  describe('searchProjects', () => {
    it('should filter projects by ID', async () => {
      const result = await projectService.searchProjects('project-1');
      expect(result.projects).toHaveLength(1);
      expect(result.projects?.[0]?.id).toBe('project-1');
    });

    it('should return empty array when project not found', async () => {
      const result = await projectService.searchProjects('non-existing');
      expect(result.projects).toHaveLength(0);
    });

    it('should handle empty projects array', async () => {
      server.use(
        http.get('/api/v1/projects', () => {
          return HttpResponse.json({
 projects: [], offset: 0, limit: 100, total: 0 
});
        }),
      );

      const result = await projectService.searchProjects('any-id');
      expect(result.projects).toHaveLength(0);
    });
  });

  describe('createProject', () => {
    it('should create a new project', async () => {
      const result = await projectService.createProject('New Project');
      expect(result.id).toBe('new-project-id');
      expect(result.title).toBe('New Project');
      expect(result.memberRole).toBe('MANAGER');
    });

    it('should handle creation errors', async () => {
      await testErrorHandling(server, '/api/v1/projects', 'post', 400, () =>
        projectService.createProject('Invalid'),
      );
    });
  });

  describe('getProject', () => {
    it('should fetch a single project', async () => {
      const result = await projectService.getProject('project-1');
      expect(result.id).toBe('project-1');
      expect(result.title).toBe('Project 1');
    });

    it('should handle 404 error', async () => {
      await expect(projectService.getProject('not-found')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      await testErrorHandling(server, '/api/v1/projects/:projectId', 'get', 500, () =>
        projectService.getProject('project-1'),
      );
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const updates: Project = {
        ...mockProject,
        title: 'Updated Title',
        description: 'Updated description',
      };
      const result = await projectService.updateProject('project-1', updates);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
    });

    it('should handle update errors', async () => {
      await testErrorHandling(server, '/api/v1/projects/:projectId', 'patch', 403, () =>
        projectService.updateProject('project-1', mockProject),
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      await expect(projectService.deleteProject('project-1')).resolves.not.toThrow();
    });

    it('should handle deletion errors', async () => {
      await testErrorHandling(server, '/api/v1/projects/:projectId', 'delete', 404, () =>
        projectService.deleteProject('non-existing'),
      );
    });
  });
});
