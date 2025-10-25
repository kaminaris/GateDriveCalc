import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer }                        from '@angular/platform-browser';
import katex                                   from 'katex';

@Component({
	selector: 'katex',
	template: `
		<div [innerHTML]="formulaHtml" style="font-size: 150%"></div>`
})
export class KatexComponent implements OnInit, OnChanges {
	@Input() formula: string = '';
	formulaHtml: string = '';

	constructor(protected sanitizer: DomSanitizer) {}

	ngOnChanges() {
		this.renderFormula();
	}

	ngOnInit() {
		this.renderFormula();
	}

	renderFormula() {
		const html = katex.renderToString(this.formula, {
			throwOnError: false,
			output: 'mathml'
		});
		this.formulaHtml = this.sanitizer.bypassSecurityTrustHtml(html) as string;
	}
}