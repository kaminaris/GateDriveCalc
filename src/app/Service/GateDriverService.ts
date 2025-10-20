import { Injectable } from '@angular/core';
import { Hydrator }   from 'hydrator-next';
import { GateDriver } from '../Model/GateDriver';

@Injectable({ providedIn: 'root' })
export class GateDriverService {
	drivers: GateDriver[] = [];
	selectedDriver?: GateDriver;

	async init() {
		const data = localStorage.getItem('gateDrivers');
		if (data) {
			this.drivers = Hydrator.hydrateArray(GateDriver, JSON.parse(data)) as GateDriver[];
		}
		else {
			this.drivers = [];
		}
	}

	async save() {
		localStorage.setItem('gateDrivers', JSON.stringify(Hydrator.dehydrateArray(this.drivers)));
	}
}