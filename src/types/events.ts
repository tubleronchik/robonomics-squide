import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v5 from './v5'

export class DatalogNewRecordEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'datalog.NewRecord')
  }

  /**
   * New data added.
   */
  get isV5(): boolean {
    return this.ctx._chain.getEventHash('datalog.NewRecord') === '9b7852b5d9c95c8ccf8dac3bd64f50fd6e8caf7679bf935c0b99a12dba866e32'
  }

  /**
   * New data added.
   */
  get asV5(): [v5.AccountId32, bigint, Uint8Array] {
    assert(this.isV5)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV5
  }

  get asLatest(): [v5.AccountId32, bigint, Uint8Array] {
    deprecateLatest()
    return this.asV5
  }
}
