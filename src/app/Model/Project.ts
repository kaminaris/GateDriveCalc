import { FieldType } from 'hydrator-next';

export class Project {
	name = 'Unnamed';
	selectedDriver = '';
	selectedFet = '';
	parallelFetCount = 1;
	driveVoltage = 12;
	supplyVoltage = 100;
	tRise = 20; // in ns
	loadInductance = 30; // in uH

	@FieldType({ ignore: true })
	results: any;
}