const request = require('supertest');
const app = require('../src/app');

describe('Task API Tests', () => {
  
  describe('GET /', () => {
    it('should return API information', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'Test Task' };
      const res = await request(app)
        .post('/api/tasks')
        .send(newTask);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(newTask.title);
      expect(res.body.completed).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({});
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by ID', async () => {
      const res = await request(app).get('/api/tasks/1');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).get('/api/tasks/999');
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const updates = { completed: true };
      const res = await request(app)
        .put('/api/tasks/1')
        .send(updates);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.completed).toBe(true);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request(app).delete('/api/tasks/1');
      expect(res.statusCode).toBe(204);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for invalid routes', async () => {
      const res = await request(app).get('/invalid-route');
      expect(res.statusCode).toBe(404);
    });
  });
});
