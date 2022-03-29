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
    return this.ctx._chain.getEventHash('datalog.NewRecord') === '07ad1120d7700ba803c78da859323f5300cb02c262c2813d857801b0c06ce6cc'
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
