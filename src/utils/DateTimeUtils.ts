export class DateTimeUtils {

    static getEpochNow(): number {
        return Math.floor(Date.now() / 1000);
    }

}