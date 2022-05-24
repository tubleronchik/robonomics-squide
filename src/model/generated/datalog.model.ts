import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Account} from "./account.model"
import {IPFSData} from "./ipfsData.model"

@Entity_()
export class Datalog {
  constructor(props?: Partial<Datalog>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Account, {nullable: false})
  account!: Account

  @Column_("text", {nullable: false})
  blockHash!: string

  @Column_("text", {nullable: false})
  record!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  blockMoment!: bigint

  @OneToMany_(() => IPFSData, e => e.datalog)
  ipfsData!: IPFSData[]
}
