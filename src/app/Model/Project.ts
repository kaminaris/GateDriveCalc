import { FieldType } from 'hydrator-next';

export class Project {
	name = 'Unnamed';
	selectedDriver = '';
	selectedFet = '';
	parallelFetCount = 1;
	driveVoltage = 12;
	supplyVoltage = 100;
	tRise = 20; // in ns
	loopInductance = 30; // in uH
	switchingFrequency = 30; // in kHz

	@FieldType({ ignore: true })
	results: any;
}