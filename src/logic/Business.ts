export interface Business {
    getElection(id: string);
    getElectionResult(id: string);
    addVoteToElection(id: string, vote: VoteInput);
}

export interface VoteInput {
    preferenceList: PreferenceList;
    name: string;
}

export type PreferenceList = PreferenceListItem[];
export type PreferenceListItem = number | number[];
