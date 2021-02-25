export class ObjUtils {

    static fetchField<T>(obj: any, path:Array<string>, fallback: T): T {
        let cur:any = obj;
        for (let i = 0; i < path.length; i++) {
            cur = cur[path[i]];
            if (cur) {
                if (i === path.length-1) {
                    return cur;
                }
            } else {
                return fallback;
            }
        }   
        return fallback;
    }

}