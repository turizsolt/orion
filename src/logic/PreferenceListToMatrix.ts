import { Option } from './Option';
import { Util } from './Util';
import { Preference } from './Vote';

export class PreferenceListToMatrix {
    private used: boolean[];
    private matrix: number[][];
    private valid: boolean;

    constructor(
        private preferenceList: Preference[],
        private options: Option[],
    ) {
        this.used = Util.createEmptyVector(options.length, false);
        this.matrix = Util.createEmptyMatrix(options.length);
        this.valid = true;

        this.convertAllPreferenceLevels();
        this.checkIfAllOptionsUsed();
    }

    public isValid(): boolean {
        return this.valid;
    }

    public getMatrix(): number[][] {
        return this.matrix;
    }

    private checkIfAllOptionsUsed() {
        for (const i in this.options) {
            if (!this.used[i]) {
                this.valid = false;
            }
        }
    }

    private convertAllPreferenceLevels() {
        for (const preferenceLevel of this.preferenceList) {
            this.setPreferenceLevelAsUsed(preferenceLevel);
            this.convertOnePreferenceLevel(preferenceLevel);
        }
    }

    private convertOnePreferenceLevel(preferenceLevel: Preference) {
        Util.doWith(preferenceLevel, this.convertPreference.bind(this));
    }

    private convertPreference(preference: number): void {
        const size = this.options.length;
        for (let i = 0; i < size; i++) {
            this.setIfPreferredAgainstOther(preference, i);
        }
    }

    private setIfPreferredAgainstOther(preference: number, i: number) {
        if (this.matrix[preference] === undefined) {
            this.valid = false;
        } else {
            this.matrix[preference][i] = !this.used[i] ? 1 : 0;
        }
    }

    private setPreferenceLevelAsUsed(preferenceElement: Preference) {
        Util.doWith(preferenceElement, this.setPreferenceAsUsed.bind(this));
    }

    private setPreferenceAsUsed(preference: number): void {
        if (this.used[preference]) {
            this.valid = false;
        } else {
            this.used[preference] = true;
        }
    }
}
