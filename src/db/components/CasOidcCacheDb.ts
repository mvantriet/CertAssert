const LRU = require('lru-cache');
import { DateTimeUtils } from '../../utils/DateTimeUtils';
import { Adapter, AdapterPayload } from 'oidc-provider';

enum OIDC_STORAGE_ENTITY {
    GRANT="grant",
    SESSION_UID="sessionUid",
    USER_CODE="userCode"
}

enum MODEL_TYPE {
    SESSION="Session",
    ACCESS_TOKEN="AccessToken",
    AUTH_CODE="AuthorizationCode",
    INTERACTION="Interaction"
}

type ACCEPTED_MODEL_TYPE = MODEL_TYPE.ACCESS_TOKEN | MODEL_TYPE.AUTH_CODE | MODEL_TYPE.INTERACTION | MODEL_TYPE.SESSION;

const storageKeyEntityDelim:string = ':';

export class CasOidcCacheDb implements Adapter {

    private model: ACCEPTED_MODEL_TYPE;
    private cacheDb = new LRU({}); // set a max

    constructor(name: string) {
        this.model = name as ACCEPTED_MODEL_TYPE;
    }

    public async find(id: string): Promise<AdapterPayload | undefined | void> {
        return this.cacheDb.get(this.key(id));
    }
    
    public async findByUid(uid: string): Promise<AdapterPayload | undefined | void> {
        const id:string = this.cacheDb.get(this.oidcEntityToStorage(OIDC_STORAGE_ENTITY.SESSION_UID,uid));
        return this.find(id);
    }
    
    public async findByUserCode(userCode: string): Promise<AdapterPayload | undefined | void> {
        const id:string = this.cacheDb.get(this.oidcEntityToStorage(OIDC_STORAGE_ENTITY.USER_CODE,userCode));
        return this.find(id);
    }
    
    public async upsert(id: string, payload: AdapterPayload, expiresIn: number): Promise<void> {
        const key:string = this.key(id);
        if (this.model === MODEL_TYPE.SESSION) {
          this.cacheDb.set(this.oidcEntityToStorage(OIDC_STORAGE_ENTITY.SESSION_UID, payload.uid), id, expiresIn * 1000);
        }
        const { grantId, userCode } = payload;
        if (grantId) {
          const grantKey:string = this.oidcEntityToStorage(OIDC_STORAGE_ENTITY.GRANT, grantId);
          const grant:Array<string> | undefined = this.cacheDb.get(grantKey);
          if (!grant) {
            this.cacheDb.set(grantKey, [key]);
          } else {
            grant.push(key);
          }
        }
        if (userCode) {
          this.cacheDb.set(this.oidcEntityToStorage(OIDC_STORAGE_ENTITY.USER_CODE,userCode), id, expiresIn * 1000);
        }
        this.cacheDb.set(key, payload, expiresIn * 1000);
    }


    public async consume(id: string): Promise<void> {
        this.cacheDb.get(this.key(id)).consumed = DateTimeUtils.getEpochNow();
    }

    public async destroy(id: string): Promise<void> {
        this.cacheDb.del(this.key(id));
    }

    public key(id: string): string {
        return `${this.model}:${id}`
    }

    public async revokeByGrantId(grantId: string): Promise<void> {
        const grantKey:string = this.oidcEntityToStorage(OIDC_STORAGE_ENTITY.GRANT, grantId);
        const grant:any = this.cacheDb.get(grantKey);
        if (grant) {
          grant.forEach((token: any) => this.cacheDb.del(token));
          this.cacheDb.del(grantKey);
        }
    }

    private oidcEntityToStorage(entity: OIDC_STORAGE_ENTITY, id: any): string {
        return `${entity}${storageKeyEntityDelim}${id}`;
    }
}
