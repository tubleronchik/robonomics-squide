import * as ss58 from "@subsquid/ss58";
import {
  EventHandlerContext,
  Store,
  SubstrateProcessor,
} from "@subsquid/substrate-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { Account, Datalog} from "./model";
import { BalancesTransferEvent, DatalogNewRecordEvent } from "./types/events";
import { SimpleConsoleLogger } from "typeorm";
import { BlockList } from "net";

const processor = new SubstrateProcessor("robonomics_balances");

processor.setTypesBundle("robonomicsTypesBundle.json");
processor.setBatchSize(500);

processor.setDataSource({
  archive: lookupArchive("robonomics")[0].url,
  chain: "wss://kusama.rpc.robonomics.network",
});

processor.addEventHandler("datalog.NewRecord", getDatalogRecord)

processor.run();

function hex_to_ascii(datalogRecord: DatalogParams) {
  const hex = datalogRecord.value.toString()
  let record = ''
  for (let n = 0; n < hex.length; n += 2) {
    record = record.concat(String.fromCharCode(parseInt(hex.substr(n, 2), 16)))
  }
  return record
}

async function getDatalogRecord(ctx: EventHandlerContext) {
  const sender = String(ctx.event.params[0].value)
  if (acl.includes(sender)) {
    const account = await getOrCreate(ctx.store, Account, sender)
    console.log(account)
    const timestamp = ctx.event.params[1].value
    const record = hex_to_ascii(ctx.event.params[2])
    console.log(record)
    const datalog = new Datalog()
    // datalog.moment = timestamp


  }
}

interface DatalogParams {
  name: String;
  type: String;
  value: any;
}


async function getOrCreate<T extends { id: string }>(
  store: Store,
  EntityConstructor: EntityConstructor<T>,
  id: string
): Promise<T> {
  let entity = await store.get<T>(EntityConstructor, {
    where: { id },
  });

  if (entity == null) {
    entity = new EntityConstructor();
    entity.id = id;
  }

  return entity;
}

type EntityConstructor<T> = {
  new(...args: any[]): T;
};
