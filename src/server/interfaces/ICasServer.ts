export interface ICasServer {
    init(): void;
    close(force: boolean): void;
}