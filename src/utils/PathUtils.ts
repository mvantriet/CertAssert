export class PathUtils {

    public static pathSep:string = '/';
    public static querySep:string = '?';

    static buildPath(addSep: boolean, ...args:Array<string>): string {
        return (addSep) ? this.pathSep + args.reduce((acc, cur) => acc + this.pathSep + cur) :
            args.reduce((acc, cur) => acc + cur)
    }   

    static buildInteractionPath(path: string, uid: string): string {
        return path.replace(':uid', uid);
    }

    static getUidFromPath(path: string) {
        const pathSplitted = path.split('/');
        return pathSplitted[pathSplitted.length-1];
    }

    static addQueryParams(path: string, params: Array<{name: string, value: string}>): string {
        return path + this.querySep + params.map((param: {name: string, value: string}) => {
            return param.name + '=' + param.value;
        }).join('&');
    }

    static queryParamToObject(query: string) : any {
        const out:any = {};
        const queryF = query.replace(this.querySep, '')
        let pos = 0;
        let cont = true;
        while(pos < queryF.length-1 && cont) {
            const sepIdx = queryF.indexOf('=', pos);
            if (sepIdx > -1) {
                const nextIdx = queryF.indexOf('&', pos);
                if (nextIdx > -1) {
                    out[queryF.substring(pos, sepIdx)] = queryF.substring(sepIdx+1, nextIdx);
                    pos = nextIdx+1;
                } else {
                    // last one, parse and stop
                    out[queryF.substring(pos, sepIdx)] = queryF.substring(sepIdx+1, queryF.length);
                    cont = false;
                }
            } else {
                cont = false;
            }
	    }
	    return out;
    } 

    static redirectResponse(resp: any, path: string) {
        resp.redirect(path);
    }

    static redirectAgent(path: string) {
        window.location.href = path;
    }

}