// Minimal ambient declaration for `node-pop3`, which ships no types.
declare module "node-pop3" {
  interface Pop3Options {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    tls?: boolean;
    timeout?: number;
  }
  export default class Pop3 {
    constructor(options?: Pop3Options);
    connect(): Promise<void>;
    UIDL(msgNumber?: number): Promise<string | Array<[string, string]>>;
    LIST(msgNumber?: number): Promise<string | Array<[string, string]>>;
    RETR(msgNumber: number | string): Promise<string>;
    QUIT(): Promise<string>;
  }
}
