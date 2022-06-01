import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import {Datalog} from "./datalog.model"

@Entity_()
export class IPFSData {
  constructor(props?: Partial<IPFSData>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Datalog, {nullable: false})
  datalog!: Datalog

  @Column_("text", {nullable: false})
  data!: string
}
