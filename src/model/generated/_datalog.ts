import assert from "assert"
import * as marshal from "./marshal"

export class Datalog {
  private _blockHash!: string
  private _moment!: number
  private _record!: string

  constructor(props?: Partial<Omit<Datalog, 'toJSON'>>, json?: any) {
    Object.assign(this, props)
    if (json != null) {
      this._blockHash = marshal.string.fromJSON(json.blockHash)
      this._moment = marshal.int.fromJSON(json.moment)
      this._record = marshal.string.fromJSON(json.record)
    }
  }

  get blockHash(): string {
    assert(this._blockHash != null, 'uninitialized access')
    return this._blockHash
  }

  set blockHash(value: string) {
    this._blockHash = value
  }

  get moment(): number {
    assert(this._moment != null, 'uninitialized access')
    return this._moment
  }

  set moment(value: number) {
    this._moment = value
  }

  get record(): string {
    assert(this._record != null, 'uninitialized access')
    return this._record
  }

  set record(value: string) {
    this._record = value
  }

  toJSON(): object {
    return {
      blockHash: this.blockHash,
      moment: this.moment,
      record: this.record,
    }
  }
}
