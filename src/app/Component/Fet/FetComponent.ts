import { Component, OnInit } from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { Fet }               from '../../Model/Fet';
import { FetService }        from '../../Service/FetService';

@Component({
	selector: 'fet',
	imports: [
		FormsModule
	],
	template: `
		<h2>FET Management</h2>
		<div class="btn-group mb-3">
			<button class="btn btn-primary" (click)="addFet()">Add FET</button>
			<button class="btn btn-secondary" (click)="importFets()">Import FETs</button>
			<button class="btn btn-secondary" (click)="exportFets()">Export FETs</button>
		</div>
		<div>
			<h4>Select FET</h4>
			<select class="form-select" [(ngModel)]="f.selectedFet">
				@for (fet of f.fets; track fet) {
					<option [ngValue]="fet">{{ fet.name }}</option>
				}
			</select>
		</div>
		@if (f.selectedFet) {
			<div class="row mb-2">
				<div class="col-6">
					<button class="btn btn-danger" (click)="saveFet()">Save</button>
				</div>
				<div class="col-6 text-end">
					<button class="btn btn-danger" (click)="deleteFet()">Delete</button>
				</div>
			</div>

			<table class="table table-sm table-bordered table-striped">
				<tr>
					<td>Name</td>
					<td>
						<input type="text" [(ngModel)]="f.selectedFet.name" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Rdson</td>
					<td>
						<input type="number" [(ngModel)]="f.selectedFet.rdson" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Gate Resistance</td>
					<td>
						<input type="number" [(ngModel)]="f.selectedFet.Rg" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Threshold voltage (V)</td>
					<td>
						<input type="number" [(ngModel)]="f.selectedFet.vTh" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Ciss (pF)</td>
					<td>
						<input type="number" [(ngModel)]="f.selectedFet.Ciss" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Coss (pF)</td>
					<td>
						<input type="number" [(ngModel)]="f.selectedFet.Coss" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Crss (pF)</td>
					<td>
						<input type="number" [(ngModel)]="f.selectedFet.Crss" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Qg</td>
					<td>
						<input type="number" [(ngModel)]="f.selectedFet.Qg" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Datasheet URL</td>
					<td>
						<input type="text" [(ngModel)]="f.selectedFet.datasheetUrl" class="form-control"/>
					</td>
				</tr>
			</table>
		}
	`
})
export class FetComponent implements OnInit {
	constructor(protected f: FetService) {}

	async ngOnInit() {
		await this.f.init();
	}

	addFet() {
		const newFet = new Fet();
		newFet.name = 'New FET';
		this.f.fets.push(newFet);
		this.f.selectedFet = newFet;
	}

	importFets() {

	}

	exportFets() {

	}

	async deleteFet() {
		if (!this.f.selectedFet || !confirm(`Are you sure you want to delete FET "${ this.f.selectedFet.name }"?`)) {
			return;
		}
		const index = this.f.fets.indexOf(this.f.selectedFet);
		if (index >= 0) {
			this.f.fets.splice(index, 1);
			this.f.selectedFet = undefined;
			await this.f.save();
		}
	}

	async saveFet() {
		if (!this.f.selectedFet) {
			return;
		}
		const index = this.f.fets.indexOf(this.f.selectedFet);
		if (index < 0) {
			console.warn('FET not found in the list');
			return;
		}
		this.f.fets[index] = this.f.selectedFet;
		await this.f.save();

	}
}