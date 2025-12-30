import type { CalibrationProfile } from './coatvision-types';

// Demo/mock calibration profiles
export const demoCalibrationProfiles: CalibrationProfile[] = [
  {
    id: 'calib-1',
    workshopId: 'workshop-1',
    hallName: 'Main Hall',
    geometry: {
      L: 5.0,
      W: 2.2,
      H: 1.8,
      referenceDistance: 2.5,
      angles: { cameraToPanelDeg: 45 },
    },
    lightProfile: {
      low: { lux: 180 },
      normal: { lux: 400 },
      high: { lux: 800 },
    },
    learningZoneActive: true,
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-05T12:00:00Z',
    status: 'valid',
  },
  {
    id: 'calib-2',
    workshopId: 'workshop-2',
    hallName: 'Test Hall',
    geometry: {
      L: 4.2,
      W: 2.0,
      H: 1.5,
      referenceDistance: 2.0,
      angles: { cameraToPanelDeg: 38 },
    },
    lightProfile: {
      low: { lux: 150 },
      normal: { lux: 350 },
      high: { lux: 700 },
    },
    learningZoneActive: false,
    createdAt: '2025-11-20T09:00:00Z',
    status: 'inactive',
  },
];
