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
    .setBlockRange({from: 226600000})
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
            //programId: [raydium.programId], 
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

    // let exchanges: Exchange[] = []
    // let solTrades: SolTrade[] = []
    // let tokenTrades: TokenTrade[] = []
    // let jupSignatures: JupSignature[] = []

    for (let block of blocks) {
        for (let ins of block.instructions) {

            console.log("INS: ", ins.d8);
            
            const operations = [
                { name: 'swapBaseIn', d8: raydium.instructions.swapBaseIn.d8 },
                { name: 'swapBaseOut', d8: raydium.instructions.swapBaseOut.d8 },
                { name: 'deposit', d8: raydium.instructions.deposit.d8 },
                { name: 'withdraw', d8: raydium.instructions.withdraw.d8 }
            ];

            const matchedOperation = operations.find(op => op.d8 === ins.d8);

            if (matchedOperation) {
                console.log(`Matched operation: ${matchedOperation.name}`);
                
                switch (matchedOperation.name) {
                    case 'swapBaseIn':
                        console.log("SWAP BASE IN ------------------------------------------------------------------------");
                        let swapBaseIn = raydium.instructions.swapBaseIn.decode({accounts: ins.accounts, data: ins.data});
                        console.log(swapBaseIn);

                        console.log("SwapBaseIn Details:");
                        console.log("--------------------------------------------------");
                        console.log("| Parameter       | Value                         |");
                        console.log("|-----------------|-------------------------------|");
                        console.log(`| amountIn        | ${swapBaseIn.data.amountIn.toString().padEnd(29)} |`);
                        console.log(`| minAmountOut    | ${swapBaseIn.data.minimumAmountOut.toString().padEnd(29)} |`);
                        console.log("--------------------------------------------------");
                        break;
                    case 'swapBaseOut':
                        console.log("SWAP BASE OUT ------------------------------------------------------------------------");
                        let swapBaseOut = raydium.instructions.swapBaseOut.decode({accounts: ins.accounts, data: ins.data});
                        console.log(swapBaseOut);
                        break;
                    case 'deposit':
                        console.log("DEPOSIT ------------------------------------------------------------------------");
                        //console.log(ins);

                        try {   
                            let deposit = raydium.instructions.deposit.decode({accounts: ins.accounts, data: ins.data});
                            console.log(deposit);
                        } catch (error) {
                            console.error("Error decoding deposit:", error);
                        }

                        break;
                    case 'withdraw':
                        console.log("WITHDRAW ------------------------------------------------------------------------");

                        try {       
                            let withdraw = raydium.instructions.withdraw.decode({accounts: ins.accounts, data: ins.data});
                            console.log(withdraw);
                        } catch (error) {
                            console.error("Error decoding withdraw:", error);
                        }
                        break;
                }
            } else {
                console.log("No matching operation found");
            }

            // https://read.cryptodatabytes.com/p/starter-guide-to-solana-data-analysis
 
        }
    } 

    //await ctx.store.upsert(solTrades);

})
