import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import setupHealthEndpoints from './plugins/health-check/health-endpoints.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const enableHealthCheck = process.env.ENABLE_HEALTH_CHECK === 'true';

class ViteHealthPlugin {
    constructor() {
        this.status = {
            state: 'idle',
            errors: [],
            warnings: [],
            lastCompileTime: null,
            lastSuccessTime: null,
            compileDuration: 0,
            totalCompiles: 0,
            firstCompileTime: null,
        };
    }

    getStatus() {
        return {
            ...this.status,
            isHealthy: this.status.state === 'success',
            errorCount: this.status.errors.length,
            warningCount: this.status.warnings.length,
            hasCompiled: this.status.totalCompiles > 0,
        };
    }

    getSimpleStatus() {
        return {
            state: this.status.state,
            isHealthy: this.status.state === 'success',
            errorCount: this.status.errors.length,
            warningCount: this.status.warnings.length,
        };
    }

    reset() {
        this.status = {
            state: 'idle',
            errors: [],
            warnings: [],
            lastCompileTime: null,
            lastSuccessTime: null,
            compileDuration: 0,
            totalCompiles: 0,
            firstCompileTime: null,
        };
    }
}

function formatError(error) {
    if (!error) {
        return {
            message: 'Unknown error',
            stack: null,
        };
    }

    if (typeof error === 'string') {
        return {
            message: error,
            stack: null,
        };
    }

    return {
        message: error.message || String(error),
        stack: error.stack || null,
    };
}

const healthPluginInstance = new ViteHealthPlugin();

export default defineConfig({
    plugins: [
        react(),
        enableHealthCheck && {
            name: 'vite-health-check-plugin',
            buildStart() {
                const now = Date.now();
                healthPluginInstance.status.state = 'compiling';
                healthPluginInstance.status.lastCompileTime = now;
                if (!healthPluginInstance.status.firstCompileTime) {
                    healthPluginInstance.status.firstCompileTime = now;
                }
            },
            buildEnd(error) {
                const now = Date.now();
                healthPluginInstance.status.compileDuration = now - (healthPluginInstance.status.lastCompileTime || now);
                healthPluginInstance.status.totalCompiles += 1;

                if (error) {
                    healthPluginInstance.status.state = 'failed';
                    healthPluginInstance.status.errors = [formatError(error)];
                    healthPluginInstance.status.warnings = [];
                } else {
                    healthPluginInstance.status.state = 'success';
                    healthPluginInstance.status.lastSuccessTime = now;
                    healthPluginInstance.status.errors = [];
                    healthPluginInstance.status.warnings = [];
                }
            },
            configureServer(server) {
                setupHealthEndpoints(server, healthPluginInstance);
            },
        },
    ].filter(Boolean),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5175,
    },
});
