export class ArrayUtils {

    public static range(nofElements: number, offset?: number): Array<number> {
        const appliedOffset = offset ? offset : 0;
        return Array.from({ length: nofElements }, (_, idx) => idx+appliedOffset);
    }

}