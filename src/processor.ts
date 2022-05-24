import {
  EventHandlerContext,
  Store,
  SubstrateProcessor,
} from "@subsquid/substrate-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { Account, Datalog, IPFSData } from "./model";
import { getAgents } from "./utils/utils";
import axios from 'axios';
import { isString } from "util";
// import { IPFS, create } from 'ipfs-core'
// import type { CID } from 'ipfs-core'

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

// async function main() {
//   const node = await create({repo: "iok0.3150959732117198", config: {Bootstrap: [
//     "/dns4/1.pubsub.aira.life/tcp/443/wss/ipfs/QmdfQmbmXt6sqjZyowxPUsmvBsgSGQjm4VXrV7WGy62dv8",
//     "/dns4/2.pubsub.aira.life/tcp/443/wss/ipfs/QmPTFt7GJ2MfDuVYwJJTULr6EnsQtGVp8ahYn9NSyoxmd9",
//     "/dns4/3.pubsub.aira.life/tcp/443/wss/ipfs/QmWZSKTEQQ985mnNzMqhGCrwQ1aTA6sxVsorsycQz9cQrw   "       
//   ]}});
//   const peers = await node.swarm.peers()
//   console.log(`Peers: ${peers}`)
//   return node
// }
// const node = main();

function hexToUtf8(datalogString: DatalogParams) {
  const record = datalogString.value.toString();
  return decodeURIComponent(
    record.replace(/\s+/g, "").replace(/[0-9a-f]{2}/g, "%$&")
  ).slice(2);
}

// const readFile = async (ipfs: IPFS, cid: CID): Promise<string> => {
//   const decoder = new TextDecoder()
//   let content = ''
//   for await (const chunk of ipfs.cat(cid)) {
//     content += decoder.decode(chunk)
//     console.log(content)
//   }

//   return content
// }

// async function getDataFromIPFS(cid: any) {
//   const content = await readFile(await node, cid)
//   return content
// }

  async function getDataFromIPFS(hash: String) {
    try {
      const res = await axios.get(`https://ipfs.io//ipfs/${hash}`);
      console.log(JSON.stringify(res.data));
      return JSON.stringify(res.data)
    }
    catch(err) {
      console.log(err)
      return
    }
  }


async function getDatalogRecord(ctx: EventHandlerContext) {
  const sender = String(ctx.event.params[0].value);
  if (whiteListAccounts.includes(sender)) {
    const account = await getOrCreate(ctx.store, Account, sender);
    const timestamp = BigInt(Number(ctx.event.params[1].value));
    const record = hexToUtf8(ctx.event.params[2]);
    // console.log(ctx.event)
    console.log(`record: ${record}`)
    const datalog = await getOrCreate(ctx.store, Datalog, ctx.event.id)
    datalog.record = record;
    datalog.account = account;
    datalog.blockHash = String(ctx.block.hash);
    datalog.blockMoment = timestamp;
    await ctx.store.save(account);
    await ctx.store.save(datalog);
    if (record.startsWith("Qm")) {
      const data = await getOrCreate(ctx.store, IPFSData, record)
      const ipfsData = await getDataFromIPFS(record)
      if (typeof ipfsData == "string") {
        console.log(ipfsData)
        data.data = ipfsData
        data.datalog = datalog
        console.log(data)
        await ctx.store.save(data)
      }
    }
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
