import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-filter-textbox',
    imports: [FormsModule],
    template: `
        Filter: <input type="text" [(ngModel)]="filter" />
    `
})
export class FilterTextboxComponent implements OnInit {

    private _filter = '';
    @Input() get filter() {
        return this._filter;
    }

    set filter(val: string) {
        this._filter = val;
        this.changed.emit(this.filter);
    }

    @Output() changed: EventEmitter<string> = new EventEmitter<string>();

    constructor() { }

    ngOnInit() { }
}
