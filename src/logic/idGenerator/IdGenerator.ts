export type Id = string;

export interface IdGenerator {
    generate(): Id;
}
