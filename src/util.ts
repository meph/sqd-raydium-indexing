import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

export async function fetchBlockHeight(blockNumber: number): Promise<number | null> {
    const url = process.env.SOLANA_NODE || "https://api.mainnet-beta.solana.com";
    const headers = {
        "Content-Type": "application/json"
    };
    const body = JSON.stringify({
        "id": 0,
        "jsonrpc": "2.0",
        "method": "getBlock",
        "params": [
            blockNumber,
            {
                "rewards": false,
                "transactionDetails": "none"
            }
        ]
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any = await response.json();

        //console.log(data);
        
        if (data.result && data.result.blockHeight) {
            return data.result.blockHeight;
        } else {
            console.error("Block height not found in response");
            return null;
        }
    } catch (error) {
        console.error(`Failed to fetch block data: ${error}`);
        return null;
    }
}

console.log(process.argv[2]);

fetchBlockHeight(parseInt(process.argv[2])).then(blockHeight => {
    if (blockHeight !== null) {
        console.log(`Block Height: ${blockHeight}`);
    }
});