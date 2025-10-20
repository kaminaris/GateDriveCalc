import { bootstrapApplication } from '@angular/platform-browser';
import { App }                  from './app/App';
import { appConfig }            from './app/AppConfig';

bootstrapApplication(App, appConfig)
	.catch((err) => console.error(err));
