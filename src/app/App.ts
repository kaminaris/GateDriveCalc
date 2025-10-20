import { Component, signal }   from '@angular/core';
import { RouterOutlet }        from '@angular/router';
import { ResultsComponent }    from './Component/Results/ResultsComponent';
import { ProjectComponent }    from './Component/Project/ProjectComponent';
import { GateDriverComponent } from './Component/GateDriver/GateDriverComponent';
import { FetComponent }        from './Component/Fet/FetComponent';

@Component({
	selector: 'app-root',
	imports: [FetComponent, GateDriverComponent, GateDriverComponent, ProjectComponent, ResultsComponent],
	templateUrl: './App.html'
})
export class App {
	protected readonly title = signal('GateDriveCalc');
}
