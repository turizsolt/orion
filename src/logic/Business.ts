import { Matrix } from './Matrix';

export interface Business {
    getElection(id: string): Election;
    getElectionResult(id: string): ElectionResult;
    addVoteToElection(id: string, vote: VoteInput): boolean;
    createElection(name: string, options: string[]): Election;
    getElectionVoteCount(id: string): number;
}

export interface VoteInput {
    preferenceList: PreferenceList;
    name: string;
}

export interface VoteDTO {
    preferenceList: PreferenceList;
    name: string;
    electionId: string;
    id: string;
    createdAt: Date;
}

export type PreferenceList = PreferenceListItem[];
export type PreferenceListItem = number | number[];

export interface Election {
    name: string;
    options: Option[];
    id: string;
}

export interface Option {
    name: string;
}

export interface ElectionResult {
    pairwisePreferences: Matrix;
    strongestPathes: Matrix;
    order: PreferenceList;
    total: PreferenceList;
}
