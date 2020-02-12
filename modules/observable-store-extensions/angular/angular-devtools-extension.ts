export class AngularDevToolsExtension {
    private window = window as any;
    private testability: any;
    private router: any;
    private ngZone: any;

    constructor() {
        this.testability = this.window.getAllAngularTestabilities()[0];

        this.router = this.testability.findProviders(
            this.window.getAllAngularRootElements()[0],
            'Router'
        );

        this.ngZone = this.getNgZone();
    }

    navigate(path: string) {
        if (this.ngZone) {
            this.runInZone(() => {
                this.router.navigateByUrl(path);
            });
        }
    }

    runInZone(action: any) {
        if (this.ngZone) {
            this.ngZone.run(() => {
                action();
            });
        }
    }

    private getNgZone() {
        try {
            return this.testability._ngZone;
        } catch (e) {
            console.log(e);
        }
    }
}
