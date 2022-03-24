import assert from 'assert'
import {EventContext, Result, deprecateLatest} from './support'
import * as v5 from './v5'
import * as v8 from './v8'

export class BalancesTransferEvent {
  constructor(private ctx: EventContext) {
    assert(this.ctx.event.name === 'balances.Transfer')
  }

  /**
   * Transfer succeeded. \[from, to, value\]
   */
  get isV5(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '9611bd6b933331f197e8fa73bac36184681838292120987fec97092ae037d1c8'
  }

  /**
   * Transfer succeeded. \[from, to, value\]
   */
  get asV5(): [v5.AccountId32, v5.AccountId32, bigint] {
    assert(this.isV5)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  /**
   * Transfer succeeded.
   */
  get isV8(): boolean {
    return this.ctx._chain.getEventHash('balances.Transfer') === '99bc4786247456e0d4a44373efe405e598bfadfac87a7c41b0a82a91296836c1'
  }

  /**
   * Transfer succeeded.
   */
  get asV8(): {from: v8.AccountId32, to: v8.AccountId32, amount: bigint} {
    assert(this.isV8)
    return this.ctx._chain.decodeEvent(this.ctx.event)
  }

  get isLatest(): boolean {
    deprecateLatest()
    return this.isV8
  }

  get asLatest(): {from: v8.AccountId32, to: v8.AccountId32, amount: bigint} {
    deprecateLatest()
    return this.asV8
  }
}
