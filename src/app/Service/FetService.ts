import { Injectable } from '@angular/core';
import { Hydrator }   from 'hydrator-next';
import { Fet }        from '../Model/Fet';

@Injectable({ providedIn: 'root' })
export class FetService {
	fets: Fet[] = [];
	selectedFet?: Fet;


	async init() {
		const data = localStorage.getItem('fets');
		if (data) {
			this.fets = Hydrator.hydrateArray(Fet, JSON.parse(data)) as Fet[];
		}
		else {
			this.fets = [];
		}
	}

	async save() {
		localStorage.setItem('fets', JSON.stringify(Hydrator.dehydrateArray(this.fets)));
	}
}