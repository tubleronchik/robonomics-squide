import {
  EventHandlerContext,
  Store,
  SubstrateProcessor,
} from "@subsquid/substrate-processor";
import { lookupArchive } from "@subsquid/archive-registry";
import { Account, Datalog, IPFSData } from "./model";
import { getAgents } from "./utils/utils";
import axios from 'axios';

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

async function getDataFromIPFS(hash: String) {
  try {
    const res = await axios.get(`https://cloudflare-ipfs.com/ipfs/${hash}`);
    return JSON.stringify(res.data)
  }
  catch(error) {
    if (axios.isAxiosError(error)) {
      console.log(`Error downloading file from IPFS: ${error.response?.status} ${error.response?.statusText}`)
    }
    return
  }
}

async function getDatalogRecord(ctx: EventHandlerContext) {
  const sender = String(ctx.event.params[0].value);
  if (whiteListAccounts.includes(sender)) {
    const account = await getOrCreate(ctx.store, Account, sender);
    const timestamp = BigInt(Number(ctx.event.params[1].value));
    const record = hexToUtf8(ctx.event.params[2]);
    console.log(`record ${record}`)
    const datalog = await getOrCreate(ctx.store, Datalog, ctx.event.id)
    datalog.record = record;
    datalog.account = account;
    datalog.blockHash = String(ctx.block.hash);
    datalog.blockMoment = timestamp;
    datalog.status = "not download"
    await ctx.store.save(account);
    await ctx.store.save(datalog);
    if (record.startsWith("Qm")) {
      const ipfsData = await getDataFromIPFS(record)
      if (ipfsData) {
        const ipfsDb = await getOrCreate(ctx.store, IPFSData, record)
        ipfsDb.data = ipfsData
        ipfsDb.datalog = datalog
        datalog.status = "download"
        await ctx.store.save(datalog)
        await ctx.store.save(ipfsDb)
        console.log(ipfsDb)
      }
      // else {
      //   account.status = "not download"
      // }
      console.log(account)
    }
    // await ctx.store.save(account);
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

