import { Preference } from "./Vote";
import { Option } from "./Option";
import { Util } from "./Util";

export class PreferenceListToMatrix {
    private used:boolean[];
    private matrix:number[][];
    private valid:boolean;

    constructor(private preferenceList: Preference[], private options: Option[]) {
        this.used = Util.createEmptyVector(options.length, false);
        this.matrix = Util.createEmptyMatrix(options.length);
        this.valid = true;

        this.convertAllPreferenceLevels();
        this.checkIfAllOptionsUsed();
    }

    isValid():boolean {
        return this.valid;
    }

    getMatrix():number[][] {
        return this.matrix;
    }

    private checkIfAllOptionsUsed() {
        for (let i in this.options) {
            if (!this.used[i])
                this.valid = false;
        }
    }

    private convertAllPreferenceLevels() {
        for (let preferenceLevel of this.preferenceList) {
            this.setPreferenceLevelAsUsed(preferenceLevel);
            this.convertOnePreferenceLevel(preferenceLevel);
        }
    }

    private convertOnePreferenceLevel(preferenceLevel: Preference) {
        Util.doWith(preferenceLevel, this.convertPreference.bind(this));
    }

    private convertPreference (preference: number): void {
        for (let i in this.options) {
            this.setIfPreferredAgainstOther(preference, i);
        }
    }

    private setIfPreferredAgainstOther(preference: number, i: string) {
        if (this.matrix[preference] === undefined)
            this.valid = false;
        else
            this.matrix[preference][i] = !this.used[i] ? 1 : 0;
    }

    private setPreferenceLevelAsUsed(preferenceElement: Preference) {
        Util.doWith(preferenceElement, this.setPreferenceAsUsed.bind(this));
    }

    private setPreferenceAsUsed(preference: number): void {
        if (this.used[preference])
            this.valid = false;
        else
            this.used[preference] = true;
    }
}
