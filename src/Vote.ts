export type Preference = number | number[];

export class Vote {
    constructor(readonly preferenceList: Preference[]) {}
}
