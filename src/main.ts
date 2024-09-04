import {run} from '@subsquid/batch-processor'
import {augmentBlock} from '@subsquid/solana-objects'
import {DataSourceBuilder, SolanaRpcClient} from '@subsquid/solana-stream'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import * as tokenProgram from './abi/tokenProgram'
import * as raydium from './abi/raydium'
//import { Exchange, SolTrade, TokenTrade, JupSignature } from './model'
import { DecodedInstruction } from './abi/abi.support'
import * as dotenv from 'dotenv';


dotenv.config();

const SOL_MINT = 'So11111111111111111111111111111111111111112';

const dataSource = new DataSourceBuilder()
    .setGateway('https://v2.archive.subsquid.io/network/solana-mainnet')
    // Subsquid Network is always about 1000 blocks behind the head.
    // We must use regular RPC endpoint to get through the last mile
    // and stay on top of the chain.
    // This is a limitation, and we promise to lift it in the future!
    .setRpc(process.env.SOLANA_NODE == null ? undefined : {
        client: new SolanaRpcClient({
            url: process.env.SOLANA_NODE,
            rateLimit: 50,
            // rateLimit: 100 // requests per sec
        }),
        strideConcurrency: 1000
    })
    .setBlockRange({from: 225000000})
    .setFields({
        block: { // block header fields
            timestamp: true
        },
        transaction: { // transaction fields
            signatures: true,
            fee: true,
        },
        instruction: { // instruction fields
            programId: true,
            accounts: true,
            data: true,
            isCommitted: true,
            //logs: true,
        },
        tokenBalance: { // token balance record fields
            preAmount: true,
            postAmount: true,
            preOwner: true,
            postOwner: true
        },
        log: {
            message: true,
            kind: true,
            programId: true,
        }
    })
    .addInstruction({
        // select instructions, that:
        where: {
            programId: [raydium.programId], 
            d8: [
                raydium.instructions.swapBaseIn.d8,
                raydium.instructions.swapBaseOut.d8,
                raydium.instructions.deposit.d8,
                raydium.instructions.withdraw.d8,
            ], // have first 8 bytes of .data equal to descriptor,
            isCommitted: true, // where successfully committed
        },
        // for each instruction selected above
        // make sure to also include:
        include: {
            innerInstructions: true, // inner instructions
            transaction: true, // transaction, that executed the given instruction
            transactionTokenBalances: true, // all token balance records of executed transaction
            //logs: true, // logs of the instruction
        }
    })
    .build()

const database = new TypeormDatabase();

interface Trade {
    type: string;
    signature: string;
    timestamp: Date;
    trader: string;
    mint_spent: string;
    amount_spent: number;
    mint_got: string;
    amount_got: number;
    fee: number;
}

// Now we are ready to start data processing
run(dataSource, database, async ctx => {

    //await connectToDatabase();
    // Block items that we get from `ctx.blocks` are flat JS objects.
    //
    // We can use `augmentBlock()` function from `@subsquid/solana-objects`
    // to enrich block items with references to related objects and
    // with convenient getters for derived data (e.g. `Instruction.d8`).
    let blocks = ctx.blocks.map(augmentBlock)

    let exchanges: Exchange[] = []
    let solTrades: SolTrade[] = []
    let tokenTrades: TokenTrade[] = []
    let jupSignatures: JupSignature[] = []

    for (let block of blocks) {
        for (let ins of block.instructions) {
            // https://read.cryptodatabytes.com/p/starter-guide-to-solana-data-analysis
            if (ins.programId === raydium.programId && ins.inner.length > 1) {

                console.log("PROCESSING NEW TX#  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

                if(ins.d8 === raydium.instructions.swapBaseIn.d8) {

                    console.log("SWAP BASE IN ------------------------------------------------------------------------");

                    let swap = raydium.instructions.swapBaseIn.decode({accounts: ins.accounts, data: ins.data});

                    console.log(swap);
                }

                if (ins.d8 === raydium.instructions.swapBaseOut.d8) {

                    console.log("SWAP BASE OUT ------------------------------------------------------------------------");

                    let swap = raydium.instructions.swapBaseOut.decode({accounts: ins.accounts, data: ins.data});

                    console.log(swap);
                }

                if (ins.d8 === raydium.instructions.deposit.d8) {
                    console.log("DEPOSIT ------------------------------------------------------------------------");

                    let deposit = raydium.instructions.deposit.decode({accounts: ins.accounts, data: ins.data });

                    console.log(deposit);
                }

                if (ins.d8 === raydium.instructions.withdraw.d8) {
                    console.log("WITHDRAW ------------------------------------------------------------------------");

                    let withdraw = raydium.instructions.withdraw.decode({accounts: ins.accounts, data: ins.data });

                    console.log(withdraw);
                }
            }
        }
    } 

    await ctx.store.upsert(solTrades);

})
