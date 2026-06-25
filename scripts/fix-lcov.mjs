import { readFileSync, writeFileSync } from 'fs';

const path = 'coverage/lcov.info';
writeFileSync(path, readFileSync(path, 'utf8').replaceAll('\\', '/'));
