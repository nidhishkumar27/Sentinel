import { UserProfile, Coordinate } from './types';

export const MOCK_USER: UserProfile = {
  id: 'USR-8829-X',
  name: 'Alex Mercer',
  nationality: 'Canadian',
  passportNumber: '******892',
  verificationHash: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  photoUrl: 'https://picsum.photos/200/200'
};

export const INITIAL_LOCATION: Coordinate = { x: 50, y: 50 }; // Center of the map (0-100 scale)

export const MAP_BUILDINGS = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  x: Math.random() * 80 + 10,
  y: Math.random() * 80 + 10,
  width: Math.random() * 10 + 5,
  height: Math.random() * 10 + 5,
}));