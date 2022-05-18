# Robonomics Squide

Sample [squid](https://subsquid.io) project to accumulate [Robonomics](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fkusama.rpc.robonomics.network%2F#/explorer) datalog and serves them via graphql API.

## Prerequisites

* node 16.x
* docker

It's necessary to create a file named `agents.json`, which contains list of addresses which datalogs will be stored, and place it to the root.

## Installing & Running

```
# Install dependencies
npm ci

# Compile typescript files
npm run build

# Start target Postgres database
docker-compose up -d

# Apply database migrations from db/migrations
npx sqd db create
npx sqd db migrate

# Start the processor
node -r dotenv/config lib/processor.js

#The above command will block the terminal
#    being busy with fetching the chain data, 
#    transforming and storing it in the target database.
#
#    To start the graphql server open the separate terminal
#    and run
npx squid-graphql-server
```
---
## Dev
## Runtime upgrade

To upgrade blockchain metadata run:

```
npx squid-substrate-metadata-explorer \                                                                                                               
                --chain wss://kusama.rpc.robonomics.network \
                --out robonomicsVersions.json

```
Then, to generate type-safe TypeScript wrappers around the metadata

```
npx squid-substrate-typegen typegen.json
```

## Db schema description

```
type Account @entity {
  "Account address"
  id: ID! # event id
  address: String! # account address
  moment: BigInt! # extrinsic timestamp
  datalog: Datalog!
}

type Datalog {
  blockHash: String! # hash of the block
  record: String! # datalog record
}
```
Generating TypeScript Entity classes for our schema definition:

``npx sqd codegen``

## Apply changes to Db

Remove migrations:
``rm -rf db/migrations/*.js``
With postgres container running do:
```
npx sqd db drop
npx sqd db create
npx sqd db create-migration Init
npx sqd db migrate
```


