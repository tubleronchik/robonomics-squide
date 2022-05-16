import {
  EventHandlerContext,
  Store,
  SubstrateProcessor,
} from "@subsquid/substrate-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { Account, Datalog } from "./model";
import { getAgents } from "./utils/utils";
import { IPFS, create } from 'ipfs-core'
import type { CID } from 'ipfs-core'

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

async function main() {
  const node = await create({repo: 'ok' + Math.random(), config: {Bootstrap: [
    "/dns4/1.pubsub.aira.life/tcp/443/wss/ipfs/QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8",
    "/dns4/2.pubsub.aira.life/tcp/443/wss/ipfs/QmPTFt7GJ2MfDuVYwJJTULr6EnsQtGVp8ahYn9NSyoxmd9",
    "/dns4/3.pubsub.aira.life/tcp/443/wss/ipfs/QmWZSKTEQQ985mnNzMqhGCrwQ1aTA6sxVsorsycQz9cQrw   "       
  ]}});
  const peers = await node.swarm.peers();
  console.log(`peers ${peers}`)
  
  peers.forEach(peer => console.log(peer.addr.toString()))

  return node
}
const node = main();

function hexToUtf8(datalogString: DatalogParams) {
  const record = datalogString.value.toString();
  return decodeURIComponent(
    record.replace(/\s+/g, "").replace(/[0-9a-f]{2}/g, "%$&")
  ).slice(2);
}

const readFile = async (ipfs: IPFS, cid: CID): Promise<string> => {
  console.log("read")
  const decoder = new TextDecoder()
  let content = ''
  for await (const chunk of ipfs.cat(cid)) {
    console.log("in for")
    content += decoder.decode(chunk)
    console.log(content)
  }

  return content
}

async function getDataFromIPFS(cid: any) {
  const content = await readFile(await node, cid)
  console.log('Added file contents:', content)
}

async function getDatalogRecord(ctx: EventHandlerContext) {
  const sender = String(ctx.event.params[0].value);
  console.log(await getDataFromIPFS("QmdXxZKYq5QuE1dn56AQFsNEBjHhSEi7yrhmC45Z2WBj4T"))
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
