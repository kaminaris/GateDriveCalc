import { Component, OnInit } from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { Hydrator }          from 'hydrator-next';
import { Fet }               from '../../Model/Fet';
import { GateDriver }        from '../../Model/GateDriver';
import { FetService }        from '../../Service/FetService';
import { GateDriverService } from '../../Service/GateDriverService';
import { ProjectService }    from '../../Service/ProjectService';
import { Project }           from '../../Model/Project';

@Component({
	selector: 'app-project',
	imports: [
		FormsModule
	],
	template: `
		<h2>Project Management</h2>
		<div class="btn-group mb-3">
			<button class="btn btn-primary" (click)="addProject()">Add Project</button>
			<button class="btn btn-secondary" (click)="importProjects()">Import Projects</button>
			<button class="btn btn-secondary" (click)="exportProjects()">Export Projects</button>
			<button class="btn btn-danger" (click)="clearAll()">Clear All</button>
		</div>
		<div>
			<h4>Select Project</h4>
			<select class="form-select"
				[(ngModel)]="p.selectedProject"
				(ngModelChange)="changeProject()"
			>
				@for (project of p.projects; track project) {
					<option [ngValue]="project">{{ project.name }}</option>
				}
			</select>
		</div>
		@if (p.selectedProject) {
			<div class="row mb-2">
				<div class="col-6">
					<button class="btn btn-success" (click)="saveProject()">Save</button>
				</div>
				<div class="col-6 text-end">
					<button class="btn btn-danger" (click)="deleteProject()">Delete</button>
				</div>
			</div>

			<table class="table table-sm table-bordered table-striped">
				<tr>
					<td>Name</td>
					<td>
						<input type="text" [(ngModel)]="p.selectedProject.name" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Selected FET</td>
					<td>
						<select class="form-select" [(ngModel)]="p.selectedProject.selectedFet">
							@for (fet of f.fets; track fet) {
								<option [ngValue]="fet.name">{{ fet.name }}</option>
							}
						</select>
					</td>
				</tr>
				<tr>
					<td>Selected Gate Driver</td>
					<td>
						<select class="form-select" [(ngModel)]="p.selectedProject.selectedDriver">
							@for (driver of d.drivers; track driver) {
								<option [ngValue]="driver.name">{{ driver.name }}</option>
							}
						</select>
					</td>
				</tr>
				<tr>
					<td>Supply Voltage (V)</td>
					<td>
						<input type="number" [(ngModel)]="p.selectedProject.supplyVoltage" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Drive Voltage (V)</td>
					<td>
						<input type="number" [(ngModel)]="p.selectedProject.driveVoltage" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Parallel Fet Count</td>
					<td>
						<input type="number" [(ngModel)]="p.selectedProject.parallelFetCount" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Target rise time (ns)</td>
					<td>
						<input type="number" [(ngModel)]="p.selectedProject.tRise" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Gate Loop inductance (nH)</td>
					<td>
						<input type="number" [(ngModel)]="p.selectedProject.loopInductance" class="form-control"/>
					</td>
				</tr>
				<tr>
					<td>Switching Frequency (kHz)</td>
					<td>
						<input type="number" [(ngModel)]="p.selectedProject.switchingFrequency" class="form-control"/>
					</td>
				</tr>
			</table>
		}
	`
})
export class ProjectComponent implements OnInit {
	exportedJson = '';

	constructor(
		protected p: ProjectService,
		protected f: FetService,
		protected d: GateDriverService
	) {}

	async ngOnInit() {
		await this.p.init();
	}

	async addProject() {
		const newProject = new Project();
		newProject.name = 'New Project';
		this.p.projects.push(newProject);
		await this.p.save();
	}

	async importProjects() {
		const data = prompt('Paste project JSON here:');
		if (!data) {
			return;
		}

		try {
			const raw = JSON.parse(data);
			const fet = Hydrator.hydrate(Fet, raw.selectedFet);
			if (!fet) {
				throw new Error('FET cannot be parsed');
			}

			const driver = Hydrator.hydrate(GateDriver, raw.selectedDriver);
			if (!driver) {
				throw new Error('Gate Driver cannot be parsed');
			}

			raw.selectedFet = fet.name;
			raw.selectedDriver = driver.name;
			const project = Hydrator.hydrate(Project, raw);
			if (!project) {
				throw new Error('Project cannot be parsed');
			}

			let foundFetIdx = this.f.fets.findIndex(f => f.name === fet.name);
			if (foundFetIdx < 0) {
				this.f.fets.push(fet);
				foundFetIdx = this.f.fets.length - 1;
			} else {
				this.f.fets[foundFetIdx] = fet;
			}
			await this.f.save();


			let foundDriverIdx = this.d.drivers.findIndex(d => d.name === driver.name);
			if (foundDriverIdx < 0) {
				this.d.drivers.push(driver);
				foundDriverIdx = this.d.drivers.length - 1;
			} else {
				this.d.drivers[foundDriverIdx] = driver;
			}
			await this.d.save();

			let foundProjectIdx = this.p.projects.findIndex(p => p.name === project.name);
			if (foundProjectIdx < 0) {
				this.p.projects.push(project);
			} else {
				this.p.projects[foundProjectIdx] = project;
			}
			await this.p.save();
		}
		catch (e) {
			alert('Failed to import project: ' + e);
		}
		finally {
			this.exportedJson = '';
			alert('Import complete');
		}
	}

	exportProjects() {
		if (!this.p.selectedProject) {
			return;
		}
		const raw = Hydrator.dehydrate(this.p.selectedProject);
		const rawFet = Hydrator.dehydrate(this.f.selectedFet);
		const rawDriver = Hydrator.dehydrate(this.d.selectedDriver);
		raw.selectedFet = rawFet;
		raw.selectedDriver = rawDriver;
		this.exportedJson = JSON.stringify(raw, null, 2);
		prompt('Copy this to clipboard', this.exportedJson);
	}

	async saveProject() {
		if (!this.p.selectedProject) {
			return;
		}
		const index = this.p.projects.indexOf(this.p.selectedProject);
		if (index < 0) {
			console.warn('Driver does not exist in the list');
			return;
		}
		this.p.projects[index] = this.p.selectedProject;
		await this.p.save();

	}

	async deleteProject() {
		if (!this.p.selectedProject || !confirm(
			`Are you sure you want to delete Gate Driver "${ this.p.selectedProject.name }"?`)) {
			return;
		}

		const index = this.p.projects.indexOf(this.p.selectedProject);
		if (index >= 0) {
			this.p.projects.splice(index, 1);
			this.p.selectedProject = undefined;
			await this.p.save();
		}
	}

	changeProject() {
		console.log('Selected project changed to:', this.p.selectedProject);
		if (!this.p.selectedProject) {
			return;
		}

		const foundFet = this.f.fets.find(fet => fet.name === this.p.selectedProject!.selectedFet);
		if (!foundFet) {
			console.warn('Selected FET not found:', this.p.selectedProject.selectedFet);
		}
		else {
			console.log('Found selected FET:', foundFet);
			this.f.selectedFet = foundFet;
		}

		const foundDriver = this.d.drivers.find(driver => driver.name === this.p.selectedProject!.selectedDriver);
		if (!foundDriver) {
			console.warn('Selected Gate Driver not found:', this.p.selectedProject.selectedDriver);
		}
		else {
			console.log('Found selected Gate Driver:', foundDriver);
			this.d.selectedDriver = foundDriver;
		}
	}

	clearAll() {
		if (!confirm('Are you sure you want to clear ALL projects? This action cannot be undone.')) {
			return;
		}
		this.p.projects = [];
		this.p.selectedProject = undefined;
		this.p.save();
	}
}