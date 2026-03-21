import { Routes } from '@angular/router';

export enum MinPokerPath {
	Root = '',
}

export const MINPOKER_ROUTES: Routes = [
	{
		path: MinPokerPath.Root,
		loadComponent: () =>
			import('./pages/minpoker-home/minpoker-home.component').then((m) => m.MinPokerHomeComponent),
	},
];