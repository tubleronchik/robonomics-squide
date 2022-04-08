import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"
import {Datalog} from "./_datalog"

@Entity_()
export class Account {
  constructor(props?: Partial<Account>) {
    Object.assign(this, props)
  }

  /**
   * Account address
   */
  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  address!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  moment!: bigint

  @Column_("jsonb", {transformer: {to: obj => obj.toJSON(), from: obj => new Datalog(undefined, marshal.nonNull(obj))}, nullable: false})
  datalog!: Datalog
}
