import { jest } from '@jest/globals';

//only necesary because there are jest-calls in the mocks of the musea-server-library
//perhaps in the future: make the library testing-framework-agnostic
global.jest = jest;