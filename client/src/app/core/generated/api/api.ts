export * from './min-advent-api.service';
import { MinAdventApiService } from './min-advent-api.service';
export * from './min-factory-api.service';
import { MinFactoryApiService } from './min-factory-api.service';
export * from './min-poker-api.service';
import { MinPokerApiService } from './min-poker-api.service';
export * from './min-rps-api.service';
import { MinRPSApiService } from './min-rps-api.service';
export const APIS = [MinAdventApiService, MinFactoryApiService, MinPokerApiService, MinRPSApiService];
