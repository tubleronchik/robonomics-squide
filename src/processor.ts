import {
  EventHandlerContext,
  Store,
  SubstrateProcessor,
} from "@subsquid/substrate-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { Account, Datalog } from "./model";
import { getAgents } from "./utils/utils";

const whiteListAccounts = getAgents();
const processor = new SubstrateProcessor("robonomics_datalogs");
processor.setTypesBundle("robonomicsTypesBundle.json");
processor.setBatchSize(200);
processor.setDataSource({
  archive: lookupArchive("robonomics")[0].url,
  chain: "wss://kusama.rpc.robonomics.network",
});
processor.addEventHandler("datalog.NewRecord", getDatalogRecord);
processor.run();

function hexToUtf8(datalogString: DatalogParams) {
  const record = datalogString.value.toString();
  return decodeURIComponent(
    record.replace(/\s+/g, "").replace(/[0-9a-f]{2}/g, "%$&")
  ).slice(2);
}

async function getDatalogRecord(ctx: EventHandlerContext) {
  const sender = String(ctx.event.params[0].value);
  if (whiteListAccounts.includes(sender)) {
    const account = await getOrCreate(ctx.store, Account, sender);
    const timestamp = BigInt(Number(ctx.event.params[1].value));
    const record = hexToUtf8(ctx.event.params[2]);
    const datalog = await getOrCreate(ctx.store, Datalog, ctx.event.id)
    datalog.record = record;
    datalog.account = account;
    datalog.blockHash = String(ctx.block.hash);
    datalog.blockMoment = timestamp;
    await ctx.store.save(account);
    await ctx.store.save(datalog);
  }
}

interface DatalogParams {
  name: string;
  type: string;
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
  new (...args: any[]): T;
};
