export interface Logger {
    log: (...attr: any[]) => void;
    warn: (...attr: any[]) => void;
    error: (message: string | Error) => void;
}
