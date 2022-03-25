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
  archive: 'https://robonomics.indexer.gc.subsquid.io/v4/graphql',
  chain: "wss://kusama.rpc.robonomics.network",
});


processor.addEventHandler("balances.Transfer", async (ctx) => {
  const transfer = getTransferEvent(ctx);
  // const tip = ctx.extrinsic?.tip || 0n;
  // const from = ss58.codec(32).encode(transfer.from);
  // const to = ss58.codec(32).encode(transfer.to);

  // const fromAcc = await getOrCreate(ctx.store, Account, from);
  // fromAcc.balance = fromAcc.balance || 0n;
  // fromAcc.balance -= transfer.amount;
  // fromAcc.balance -= tip;
  // await ctx.store.save(fromAcc);

  // const toAcc = await getOrCreate(ctx.store, Account, to);
  // toAcc.balance = toAcc.balance || 0n;
  // toAcc.balance += transfer.amount;
  // await ctx.store.save(toAcc);

  // await ctx.store.save(
  //   new HistoricalBalance({
  //     id: `${ctx.event.id}-to`,
  //     account: fromAcc,
  //     balance: fromAcc.balance,
  //     date: new Date(ctx.block.timestamp),
  //   })
  // );

  // await ctx.store.save(
  //   new HistoricalBalance({
  //     id: `${ctx.event.id}-from`,
  //     account: toAcc,
  //     balance: toAcc.balance,
  //     date: new Date(ctx.block.timestamp),
  //   })
  // );
});

processor.addEventHandler("datalog.NewRecord", async (ctx) => {
  const tr = getDatalogRecord(ctx)
  // console.log(ctx.event.params[2])
  console.log(hex_to_ascii(ctx.event.params[2]))
  // console.log(bin2string(ctx.event.params[2]))
  // console.log(typeof(ctx.event.params[2]))

})

processor.run();

// function bin2string(array: DatalogParams){
// 	var result = "";
// 	for(var i = 0; i < array.value.length; ++i){
//     // console.log(array.value[i])
// 		// result+= (String.fromCharCode(array.value[i]));
// 	}
// 	return result;
// }

function hex_to_ascii(datalog_record: DatalogParams)
 {
	const hex  = datalog_record.value.toString()
	let record = ''
	for (let n = 0; n < hex.length; n += 2) {
		record = record.concat(String.fromCharCode(parseInt(hex.substr(n, 2), 16)))
	}
	return record
 }

function getDatalogRecord(ctx: EventHandlerContext) {
  const record = new DatalogNewRecordEvent(ctx)
  // const [block, store] = record
  // console.log(String(record.asLatest))
}

interface DatalogParams {
  name: String;
  type: String;
  value: any;
}

interface TransferEvent {
  from: Uint8Array;
  to: Uint8Array;
  amount: bigint;
}

function getTransferEvent(ctx: EventHandlerContext) {
  const event = new BalancesTransferEvent(ctx);
  // console.log(event)
  // if (event.isV1020) {
  //   const [from, to, amount] = event.asV1020;
  //   return { from, to, amount };
  // }
  // if (event.isV1050) {
  //   const [from, to, amount] = event.asV1050;
  //   return { from, to, amount };
  // }
  // return event.asLatest;
  // return event
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
  new (...args: any[]): T;
};
