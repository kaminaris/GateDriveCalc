import { NgClass }           from '@angular/common';
import { Component }         from '@angular/core';
import { FormsModule }       from '@angular/forms';
import { KatexComponent }    from '../KatexComponent';
import { FetService }        from '../../Service/FetService';
import { GateDriverService } from '../../Service/GateDriverService';
import { ProjectService }    from '../../Service/ProjectService';

@Component({
	selector: 'app-results',
	imports: [
		NgClass,
		KatexComponent,
		FormsModule
	],
	template: `
		<h2>Results</h2>
		<div class="row">
			<div class="col-6 mt-3">
				for the Ron, you can use
				<!--			R = ton * (Vcc - Vth) / (Coss * Vbridge)-->
				<katex [formula]="ronFormula"></katex>
				<br>
				@if (ronSub) {
					<katex [formula]="ronSub"></katex>
				}
			</div>
			<div class="col-6 mt-3">
				for the Roff, you can use
				<!--			R = sqrt((L * Vcc) / (2 * Q_gate))-->
				<katex [formula]="roffFormula"></katex>
				<br>
				@if (roffSub) {
					<katex [formula]="roffSub"></katex>
				}
			</div>
		</div>
		<div class="row">
			<div class="col-12 mt-3">
				<button class="btn btn-success" (click)="calculate()">Calculate</button>
				<p>Peak Gate Current Formula</p>
				<katex [formula]="currentFormula"></katex>
			</div>
		</div>
		<div class="row">
			<div class="col-6 mt-3">
				<h4>Ron</h4>
				<div class="input-group mb-3">
					<input type="number" [(ngModel)]="rOn" class="form-control"
						(ngModelChange)="calculateCurrents()"/>
					<div class="input-group-append">
						<span class="input-group-text">&Omega;</span>
					</div>
				</div>

				@if (iPeakOn) {
					<p>Peak Gate Current On</p>
					<katex [formula]="iPeakOnSub"></katex>
				}
			</div>
			<div class="col-6 mt-3">
				<h4>Roff</h4>
				<div class="input-group mb-3">
					<input type="number" [(ngModel)]="rOff" class="form-control"
						(ngModelChange)="calculateCurrents()"/>
					<div class="input-group-append">
						<span class="input-group-text">&Omega;</span>
					</div>
				</div>

				@if (iPeakOff) {
					<p>Peak Gate Current Off</p>
					<katex [formula]="iPeakOffSub"></katex>
				}
			</div>
		</div>

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
	`
})
export class ResultsComponent {
	rOn = 0;
	rOff = 0;
	iPeakOn = 0;
	iPeakOff = 0;

	ronFormula = `R_{on} = \\frac{T_{\\text{rise}}\\times\\,(V_{cc}-V_{th})}{C_{\\text{oss}}\\times\\,V_{\\text{bridge}}}`
	// R = sqrt((L * Vcc) / (2 * Q_gate))
	roffFormula = `R_{off} = \\sqrt{\\frac{L\\times\\,V_{cc}}{2\\times\\,Q_{\\text{gate}}}}`

	currentFormula = `I_{peak} = \\frac{V_{cc}}{R_{driver} + \\frac{R_{g} + R_{on/off}}{N_{fets}}}`;
	iPeakOnSub = '';
	iPeakOffSub = '';

	ronSub = '';
	roffSub = '';
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
		// round it to two places
		this.rOn = parseFloat(this.rOn.toFixed(2));
		this.ronSub = `R_{on} = \\frac{${(Ton * 1e9).toFixed(0)}\\,\\text{ns} \\times\\,(${Vcc}\\text{V}- ${Vth}\\text{V})}{${(Coss * 1e12).toFixed(0)}\\,\\text{pF} \\times\\, ${Vbridge}\\text{V}} = ${this.rOn.toFixed(2)}\\,\\Omega`;

		// convert from nH to H which is 1e-9
		const L = this.p.selectedProject.loopInductance * 1e-9;
		const Q_gate = fet.Qg * 1e-9; // convert from nC to C
		this.rOff = Math.sqrt((L * Vcc) / (2 * Q_gate));
		// round it to two places
		this.rOff = parseFloat(this.rOff.toFixed(2));
		this.roffSub = `R_{off} = \\sqrt{\\frac{${(L * 1e9).toFixed(0)}\\,\\text{nH} \\times\\, ${Vcc}\\text{V}}{2 \\times\\, ${fet.Qg.toFixed()}\\,\\text{nC}}} = ${this.rOff.toFixed(2)}\\,\\Omega`;

		// Standard simplified calculation:
		// const tRise = this.p.selectedProject.tRise * 1e-9;
		// const Qg = fet.Qg * 1e-9; // gate charge in C
		// this.rOn = tRise * Vcc / Qg;
		//
		// // Roff (pull-down) - typically same or lower than Ron
		// const tFall = this.p.selectedProject.tRise * 1e-9; // you may need to add this
		// this.rOff = tFall * Vcc / Qg;


		// Total resistance during turn-on
		this.calculateCurrents();
	}

	equivalentParallelResistance(rSingle: number, count: number): number {
		if (count <= 1) {
			return rSingle;
		}
		return rSingle / count;
	}

	protected calculateCurrents() {
		// if user changes rOn or rOff manually, we should recalculate peak currents
		const fet = this.f.selectedFet;
		const driver = this.d.selectedDriver;
		if (!fet || !driver || !this.p.selectedProject) {
			return;
		}

		const Vcc = this.p.selectedProject?.driveVoltage || 0;
		const fetPairs = this.p.selectedProject?.parallelFetCount || 1;

		// Total resistance during turn-on
		const rTotalOn = driver.rdsonHigh + this.equivalentParallelResistance(fet.Rg + this.rOn, fetPairs);

		// Total resistance during turn-off
		const rTotalOff = driver.rdsonLow + this.equivalentParallelResistance(fet.Rg + this.rOff, fetPairs);

		// Peak gate current during turn-on
		this.iPeakOn = Vcc / rTotalOn;

		// Peak gate current during turn-off
		this.iPeakOff = Vcc / rTotalOff;

		const fSw = this.p.selectedProject.switchingFrequency * 1000; // in Hz
		// const iAvgGate = totalQg * fSw;

		const sourceLimitExceeded = this.iPeakOn > driver.sourceCurrent;
		const sinkLimitExceeded = this.iPeakOff > driver.sinkCurrent;

		this.messages = [];
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

		this.updatePeakFormulaSub();
	}

	updatePeakFormulaSub() {
		const Vcc = this.p.selectedProject?.driveVoltage || 0;
		const driver = this.d.selectedDriver;
		const fet = this.f.selectedFet;
		const fetPairs = this.p.selectedProject?.parallelFetCount || 1;

		if (!fet || !driver) {
			return;
		}

		this.iPeakOnSub = `I_{peak} = \\frac{${Vcc}\\text{V}}{${driver.rdsonHigh}\\,\\Omega + \\frac{${fet.Rg}\\,\\Omega + ${this.rOn.toFixed(2)}\\,\\Omega}{${fetPairs}}} = ${this.iPeakOn.toFixed(2)}\\,\\text{A}`;
		this.iPeakOffSub = `I_{peak} = \\frac{${Vcc}\\text{V}}{${driver.rdsonLow}\\,\\Omega + \\frac{${fet.Rg}\\,\\Omega + ${this.rOff.toFixed(2)}\\,\\Omega}{${fetPairs}}} = ${this.iPeakOff.toFixed(2)}\\,\\text{A}`;
	}
}