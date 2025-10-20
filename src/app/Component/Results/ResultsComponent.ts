import { Component }         from '@angular/core';
import { RouterOutlet }      from '@angular/router';
import { FetService }        from '../../Service/FetService';
import { GateDriverService } from '../../Service/GateDriverService';
import { ProjectService }    from '../../Service/ProjectService';

@Component({
	selector: 'app-results',
	template: `
		<h2>Results</h2>
		for the pullup, you can use R = ton * (Vcc - Vth) / (Coss * Vbridge)
		for the pulldown, you can use R = sqrt((L * Vcc) / (2 * Q_gate))
		<button class="btn btn-success" (click)="calculate()">Calculate</button>
		<table class="table table-striped table-sm mt-3">
			<tr>
				<td>Ron</td>
				<td>{{ rOn }}</td>
			</tr>
			<tr>
				<td>Roff</td>
				<td>{{ rOff }}</td>
			</tr>
		</table>
	`
})
export class ResultsComponent {
	rOn = 0;
	rOff = 0;

	constructor(
		protected p: ProjectService,
		protected f: FetService,
		protected d: GateDriverService
	) {}

	calculate() {
		if (!this.p.selectedProject) {
			return;
		}

		const fet = this.f.selectedFet;
		const driver = this.d.selectedDriver;
		if (!fet || !driver) {
			return;
		}

		// for the pullup, you can use R = tRise * (Vcc - Vth) / (Coss * Vbridge)
		// for the pulldown, you can use R = sqrt((L * Vcc) / (2 * Q_gate))
		let Ton = this.p.selectedProject.tRise * 1e-9; // convert from nanoseconds to seconds

		// Vcc = driver supply voltage
		const Vcc = this.p.selectedProject.driveVoltage;
		// Vbridge = project supply voltage
		const Vbridge = this.p.selectedProject.supplyVoltage;

		const Vth = fet.vTh;
		const Coss = fet.Coss * 1e-12; // convert from pF to F
		this.rOn = Ton * (Vcc - Vth) / (Coss * Vbridge);

		const L = this.p.selectedProject.loadInductance * 1e-6; // convert from uH to H
		const Q_gate = fet.Qg * 1e-9; // convert from nC to C
		this.rOff = Math.sqrt((L * Vcc) / (2 * Q_gate));


	}
}