import { type Rule } from '../core/index.js';
/** What the command line touches in the world, so it can be tested without it. */
export type Io = {
    readStdin(): Promise<string>;
    readFile(path: string): Promise<string>;
    /** Loads a JavaScript or TypeScript module (a `--config` file), relative to the current directory. */
    importModule(path: string): Promise<unknown>;
    writeFile(path: string, data: string): Promise<void>;
    out(text: string): void;
    err(text: string): void;
};
/** One line per rule: id, category (blank for a rule without one), description, and a note on a rule that is off unless enabled. */
export declare function formatRules(rules: readonly Rule[]): string;
export declare function run(argv: string[], io: Io): Promise<number>;
