#!/usr/bin/env node

/**
 * Startup script for the Danger Signs Service
 * Runs the enterprise-grade clinical decision support microservice
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SmartCare PRO Danger Signs Service...');

const servicePath = path.join(__dirname, '..', 'server', 'anc-danger-signs-service.js');

const service = spawn('node', [servicePath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: process.env.DANGER_SIGNS_PORT || '3001',
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
});

service.on('close', (code) => {
  console.log(`Danger Signs Service exited with code ${code}`);
  process.exit(code);
});

service.on('error', (err) => {
  console.error('Failed to start Danger Signs Service:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Danger Signs Service...');
  service.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down Danger Signs Service...');
  service.kill('SIGTERM');
});