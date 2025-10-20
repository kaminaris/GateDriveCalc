import { Injectable } from '@angular/core';
import { Hydrator }   from 'hydrator-next';
import { Project }    from '../Model/Project';

@Injectable({ providedIn: 'root' })
export class ProjectService {
	projects: Project[] = [];
	selectedProject?: Project;

	async init() {
		const data = localStorage.getItem('projects');
		if (data) {
			this.projects = Hydrator.hydrateArray(Project, JSON.parse(data)) as Project[];
		}
		else {
			this.projects = [];
		}
	}

	async save() {
		localStorage.setItem('projects', JSON.stringify(Hydrator.dehydrateArray(this.projects)));
	}
}