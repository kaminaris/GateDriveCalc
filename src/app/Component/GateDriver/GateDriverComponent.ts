import { Component, OnInit } from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { GateDriver }        from '../../Model/GateDriver';
import { GateDriverService } from '../../Service/GateDriverService';

@Component({
	selector: 'app-gate-driver',
	imports: [
		FormsModule
	],
	template: `
		<h2>Gate Driver Management</h2>
		<div class="btn-group mb-3">
			<button class="btn btn-primary" (click)="addGateDriver()">Add GateDriver</button>
			<button class="btn btn-secondary" (click)="importGateDrivers()">Import GateDrivers</button>
			<button class="btn btn-secondary" (click)="exportGateDrivers()">Export GateDrivers</button>
		</div>
		<div>
			<h4>Select Driver</h4>
			<select class="form-select" [(ngModel)]="d.selectedDriver">
				@for (driver of d.drivers; track driver) {
					<option [ngValue]="driver">{{ driver.name }}</option>
				}
			</select>
		</div>
		@if (d.selectedDriver) {
			<div class="row mb-2">
				<div class="col-6">
					<button class="btn btn-success" (click)="saveDriver()">Save</button>
				</div>
				<div class="col-6 text-end">
					<button class="btn btn-danger" (click)="deleteDriver()">Delete</button>
				</div>
			</div>

			<table class="table table-sm table-bordered table-striped">
				<tr>
					<td>Name</td>
					<td>
						<input type="text" [(ngModel)]="d.selectedDriver.name" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Rdson High</td>
					<td>
						<input type="number" [(ngModel)]="d.selectedDriver.rdsonHigh" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Rdson Low</td>
					<td>
						<input type="number" [(ngModel)]="d.selectedDriver.rdsonLow" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Source Current</td>
					<td>
						<input type="number" [(ngModel)]="d.selectedDriver.sourceCurrent" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Sink Current</td>
					<td>
						<input type="number" [(ngModel)]="d.selectedDriver.sinkCurrent" class="form-control"/>
					</td>
				</tr>
			</table>
		}
	`
})
export class GateDriverComponent implements OnInit {

	constructor(protected d: GateDriverService) {}

	async ngOnInit() {
		await this.d.init();
	}

	async addGateDriver() {
		const newDriver = new GateDriver();
		newDriver.name = 'New Gate Driver';
		this.d.drivers.push(newDriver);
		await this.d.save();
	}

	importGateDrivers() {

	}

	exportGateDrivers() {

	}

	async saveDriver() {
		if (!this.d.selectedDriver) {
			return;
		}
		const index = this.d.drivers.indexOf(this.d.selectedDriver);
		if (index < 0) {
			console.warn('Driver does not exist in the list');
			return;
		}
		this.d.drivers[index] = this.d.selectedDriver;
		await this.d.save();

	}

	async deleteDriver() {
		if (!this.d.selectedDriver || !confirm(
			`Are you sure you want to delete Gate Driver "${ this.d.selectedDriver.name }"?`)) {
			return;
		}

		const index = this.d.drivers.indexOf(this.d.selectedDriver);
		if (index >= 0) {
			this.d.drivers.splice(index, 1);
			this.d.selectedDriver = undefined;
			await this.d.save();
		}
	}
}