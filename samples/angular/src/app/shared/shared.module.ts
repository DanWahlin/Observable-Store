import { NgModule } from '@angular/core';

import { CapitalizePipe } from './capitalize.pipe';


@NgModule({
    declarations: [ CapitalizePipe ],
    exports: [ CapitalizePipe ]
})
export class SharedModule { }
