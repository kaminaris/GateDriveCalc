import { NgClass }           from '@angular/common';
import { Component }         from '@angular/core';
import { RouterOutlet }      from '@angular/router';
import { FetService }        from '../../Service/FetService';
import { GateDriverService } from '../../Service/GateDriverService';
import { ProjectService }    from '../../Service/ProjectService';

@Component({
	selector: 'app-results',
	imports: [
		NgClass
	],
	template: `
		<h2>Results</h2>
		<p>
			for the pullup, you can use R = ton * (Vcc - Vth) / (Coss * Vbridge)<br>
			for the pulldown, you can use R = sqrt((L * Vcc) / (2 * Q_gate))
		</p>
		<button class="btn btn-success" (click)="calculate()">Calculate</button>
		@if (messages.length > 0) {
			<div class="mt-3">
				@for (msg of messages; track msg) {
					<div class="alert" [ngClass]="{
						'alert-warning': msg.type === 'warning',
						'alert-info':    msg.type === 'info'
					}">
						{{ msg.text }}
					</div>
				}
			</div>
		}

		<table class="table table-striped table-sm mt-3">
			<tr>
				<td>Ron</td>
				<td>{{ rOn }}</td>
			</tr>
			<tr>
				<td>Roff</td>
				<td>{{ rOff }}</td>
			</tr>
			<tr>
				<td>Peak Gate Current On</td>
				<td>{{ iPeakOn }}</td>
			</tr>
			<tr>
				<td>Peak Gate Current Off</td>
				<td>{{ iPeakOff }}</td>
			</tr>
		</table>
	`
})
export class ResultsComponent {
	rOn = 0;
	rOff = 0;
	iPeakOn = 0;
	iPeakOff = 0;

	messages: { type: 'warning' | 'info'; text: string }[] = [];

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
		this.messages = [];

		// for the pullup, you can use R = tRise * (Vcc - Vth) / (Coss * Vbridge)
		// for the pulldown, you can use R = sqrt((L * Vcc) / (2 * Q_gate))
		let Ton = this.p.selectedProject.tRise * 1e-9; // convert from nanoseconds to seconds

		// Vcc = driver supply voltage
		const Vcc = this.p.selectedProject.driveVoltage;
		// Vbridge = project supply voltage
		const Vbridge = this.p.selectedProject.supplyVoltage;

		const fetPairs = this.p.selectedProject.parallelFetCount;
		const totalQg = fet.Qg * 1e-9 * fetPairs;

		const Vth = fet.vTh;
		const Coss = fet.Coss * 1e-12; // convert from pF to F
		this.rOn = Ton * (Vcc - Vth) / (Coss * Vbridge);

		const L = this.p.selectedProject.loopInductance * 1e-6; // convert from uH to H
		const Q_gate = fet.Qg * 1e-9; // convert from nC to C
		this.rOff = Math.sqrt((L * Vcc) / (2 * Q_gate));

		// Standard simplified calculation:
		// const tRise = this.p.selectedProject.tRise * 1e-9;
		// const Qg = fet.Qg * 1e-9; // gate charge in C
		// this.rOn = tRise * Vcc / Qg;
		//
		// // Roff (pull-down) - typically same or lower than Ron
		// const tFall = this.p.selectedProject.tRise * 1e-9; // you may need to add this
		// this.rOff = tFall * Vcc / Qg;

		const driverSink = driver.sinkCurrent;
		const driverSource = driver.sourceCurrent;

		// Total resistance during turn-on
		const rTotalOn = driver.rdsonHigh + this.equivalentParallelResistance(fet.Rg + this.rOn, fetPairs);

		// Total resistance during turn-off
		const rTotalOff = driver.rdsonLow + this.equivalentParallelResistance(fet.Rg + this.rOff, fetPairs);

		// Peak gate current during turn-on
		this.iPeakOn = Vcc / rTotalOn;

		// Peak gate current during turn-off
		this.iPeakOff = Vcc / rTotalOff;

		const fSw = this.p.selectedProject.switchingFrequency * 1000; // in Hz
		const iAvgGate = totalQg * fSw;

		const sourceLimitExceeded = this.iPeakOn > driver.sourceCurrent;
		const sinkLimitExceeded = this.iPeakOff > driver.sinkCurrent;

		if (sourceLimitExceeded || sinkLimitExceeded) {
			if (sourceLimitExceeded) {
				this.messages.push({
					type: 'warning',
					text: `(On: Peak ${this.iPeakOn.toFixed(2)}A > Source ${driver.sourceCurrent}A)`
				});
			}
			if (sinkLimitExceeded) {
				this.messages.push({
					type: 'warning',
					text: `(Off: Peak ${this.iPeakOff.toFixed(2)}A > Sink ${driver.sinkCurrent}A)`
				});
			}
		}
	}

	equivalentParallelResistance(rSingle: number, count: number): number {
		if (count <= 1) {
			return rSingle;
		}
		return rSingle / count;
	}
}