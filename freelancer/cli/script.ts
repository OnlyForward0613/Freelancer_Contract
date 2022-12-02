import { Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import fs from 'fs';
import path from 'path';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

import { IDL as FreelancerIDL } from "../target/types/freelancer";
import {
    Keypair,
    PublicKey,
    Connection,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
} from '@solana/web3.js';
import {
    GLOBAL_AUTHORITY_SEED,
    GlobalPool,
    PAYMENT_PROGRAM_ID,
    TREASURY_WALLET,
    TaskList,
    DECIMALS,
    TASK_SIZE,
} from './types';

let program: Program = null;

// Address of the deployed program.
let programId = new anchor.web3.PublicKey(PAYMENT_PROGRAM_ID);

anchor.setProvider(anchor.AnchorProvider.local(web3.clusterApiUrl("devnet")));
const solConnection = anchor.getProvider().connection;
const payer = anchor.AnchorProvider.local().wallet;

// Generate the program client from IDL.
program = new anchor.Program(FreelancerIDL as anchor.Idl, programId);
console.log('ProgramId: ', program.programId.toBase58());

const main = async () => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        program.programId
    );
    console.log('GlobalAuthority: ', globalAuthority.toBase58());

    await createProject(3, [1,1,1], [1655451000, 1655458000, 1655459000], 1655447251);
    // await createEscrow(1, 1655447249);
    // await createEdit(1, 4, 1655447249, [2,1,1,1], [1655458000, 1655468000, 1655478000, 1655488000]);
    // await createRelease(1, new PublicKey("Am9xhPPVCfDZFDabcGgmQ8GTMdsbqEt1qVXbyhTxybAp"), 1655447249);


    //========================= Freelancer ========================//
    // await createAccept(new PublicKey("Am9xhPPVCfDZFDabcGgmQ8GTMdsbqEt1qVXbyhTxybAp"), 1655447249)
    // await createMark(1, new PublicKey("Am9xhPPVCfDZFDabcGgmQ8GTMdsbqEt1qVXbyhTxybAp"), 1655447249 );

    let state: TaskList =  await getTaskState(payer.publicKey, 1655447250, program );
    console.log(state);

};


/**
 * @dev Create the project by rep
 * @param milestones Show how many milestones in the project
 * @param milestoneAmount Milestone amounts as array
 * @param milestoneDate Milestone date as array
 * @param createTime The project's create time which is stored in BE
 */
export const createProject = async (
    milestones: number,
    milestoneAmount: number[],
    milestoneDate: number[],
    createTime: number
) => {
    const tx = await createProjectTx(payer.publicKey, createTime, milestones, milestoneAmount, milestoneDate, program);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

/**
 * @dev Escrow funds for `milestone`
 * @param milestone The milestone to escrow funds
 * @param createTime This project's create time which is stored in BE
 */
export const createEscrow = async (
    milestone: number,
    createTime: number
) => {
    const tx = await createEscrowTx(payer.publicKey, milestone, createTime, program);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

/**
 * @dev Edit the milestones of the project
 * @param startMilestone The start milestone to edit
 * @param newMilestones The whole milestones to newly set
 * @param createTime This project's create time which is stored in BE
 * @param milestoneAmount New milestone amounts to be changed
 * @param milestoneDate New milestone date to be changed
 */
export const createEdit = async (
    startMilestone: number,
    newMilestones: number,
    createTime: number,
    milestoneAmount: number[],
    milestoneDate: number[],
) => {
    const tx = await createEditTx(payer.publicKey, startMilestone, newMilestones, createTime, milestoneAmount, milestoneDate, program);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}


/**
 * @dev Release funds to the completed milestone
 * @param milestone The completed milestone to be released
 * @param creator The creator's address of this project which is stored in BE
 * @param createTime This project's create time which is stored in BE
 */
export const createRelease = async (
    milestone: number,
    creator: PublicKey,
    createTime: number,
) => {
    const tx = await createReleaseTx(payer.publicKey, milestone, creator, createTime, program);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}


/**
 * @dev Accept the project
 * @param creator The creator's address of this project which is stored in BE
 * @param createTime This project's create time which is stored in BE
 */
export const createAccept = async (
    creator: PublicKey,
    createTime: number,
) => {
    const tx = await createAcceptTx(payer.publicKey, creator, createTime, program);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}

/**
 * Mark as complete
 * @param milestone The milestone to mark as complete
 * @param creator The creator's address of this project which is stored in BE
 * @param createTime This project's create time which is stored in BE
 */
export const createMark = async (
    milestone: number,
    creator: PublicKey,
    createTime: number,
) => {
    const tx = await createMarkTx(payer.publicKey, milestone, creator, createTime, program);
    const { blockhash } = await solConnection.getRecentBlockhash('finalized');
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    payer.signTransaction(tx);
    let txId = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txId, "finalized");
    console.log("Your transaction signature", txId);
}


/**
 * Create Project Transaction
 * @param userAddress The User Address
 * @param createTime The project's create time which is stored in BE
 * @param milestones Show how many milestones in the project
 * @param milestoneAmount Milestone amounts as array
 * @param milestoneDate Milestone date as array
 * @param program This program
 * @returns 
 */
export const createProjectTx = async (
    userAddress: PublicKey,
    createTime: number,
    milestones: number,
    milestoneAmount: number[],
    milestoneDate: number[],
    program: anchor.Program,
) => {
    // Get taskList publickey with seed
    let taskList = await PublicKey.createWithSeed(
        userAddress,
        createTime.toString(),
        program.programId,
    );

    let ix = SystemProgram.createAccountWithSeed({
        fromPubkey: userAddress,
        basePubkey: userAddress,
        seed: createTime.toString(),
        newAccountPubkey: taskList,
        lamports: await solConnection.getMinimumBalanceForRentExemption(TASK_SIZE),
        space: TASK_SIZE,
        programId: program.programId,
    });

    let tx = new Transaction();
    let mAmount: anchor.BN[] = [];
    let mDate: anchor.BN[]= [];
    for(let i = 0; i < milestones; i++) { 
        mAmount[i] = new anchor.BN(milestoneAmount[i]*DECIMALS);
        mDate[i] = new anchor.BN(milestoneDate[i]);
    }
    console.log('==>Creating project');
    console.log(taskList.toBase58());

    tx.add(ix);
    tx.add(program.instruction.createProject(
        new anchor.BN(milestones), mAmount, mDate,  {
        accounts: {
            creator: userAddress,
            taskList,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
        },
        instructions: [],
        signers: [],
    }));

    return tx;

}

/**
 * Create Escrow Transaction
 * @param userAddress The User Address
 * @param milestone The milestone to escrow funds
 * @param createTime This project's create time which is stored in BE
 * @param program The program
 * @returns 
 */
export const createEscrowTx = async (
    userAddress: PublicKey,
    milestone: number,
    createTime: number,
    program: anchor.Program,
) => {
    // Get taskList publickey with seed
    let taskList = await PublicKey.createWithSeed(
        userAddress,
        createTime.toString(),
        program.programId,
    );

    // Get globalAuthority publick and bump
    const [globalAuthority, globalBump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PAYMENT_PROGRAM_ID,
    );

    let tx = new Transaction();

    console.log('==>Escrow funds');

    tx.add(program.instruction.escrow(
        new anchor.BN(milestone), {
        accounts: {
            rep: userAddress,
            taskList,
            globalAuthority,
            treasuryWallet: TREASURY_WALLET,
            systemProgram: SystemProgram.programId
        },
    }));

    return tx;
}

/**
 * Create Edit Project Transaction
 * @param userAddress The User Address
 * @param startMilestone The start milestone to edit
 * @param newMilestones The whole milestones to newly set
 * @param createTime This project's create time which is stored in BE
 * @param milestoneAmount New milestone amounts to be changed
 * @param milestoneDate New milestone date to be changed
 * @param program This program
 * @returns 
 */
export const createEditTx = async (
    userAddress: PublicKey,
    startMilestone: number,
    newMilestones: number,
    createTime: number,
    milestoneAmount: number[],
    milestoneDate: number[],
    program: anchor.Program,
) => {
    // Get taskList publickey with seed
    let taskList = await PublicKey.createWithSeed(
        userAddress,
        createTime.toString(),
        program.programId,
    );
    console.log(startMilestone, newMilestones, milestoneDate);

    // Get globalAuthority and bump
    const [globalAuthority, globalBump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PAYMENT_PROGRAM_ID,
    );

    let tx = new Transaction();
    let mAmount: anchor.BN[] = [];
    let mDate: anchor.BN[] = [];
    for(let i = 0;i<newMilestones;i++) { 
        console.log(milestoneAmount[i]);
        mAmount[i] = new anchor.BN(milestoneAmount[i]*DECIMALS);
        mDate[i] = new anchor.BN(milestoneDate[i]);
     } 

    console.log('==>Edit Project');

    tx.add(program.instruction.edit(
        new anchor.BN(startMilestone), new anchor.BN(newMilestones), mAmount, mDate, globalBump, {
        accounts: {
            rep: userAddress,
            taskList,
            globalAuthority,
            treasuryWallet: TREASURY_WALLET,
            systemProgram: SystemProgram.programId
        },
    }));

    return tx;
}

/**
 * Create Release Transaction
 * @param userAddress The User Address
 * @param milestone The completed milestone to be released
 * @param creator The creator's address of this project which is stored in BE
 * @param createTime This project's create time which is stored in BE
 * @param program This program
 * @returns 
 */
export const createReleaseTx = async (
    userAddress: PublicKey,
    milestone: number,
    creator: PublicKey,
    createTime: number,
    program: anchor.Program,
) => {
    // Get taskList publickey with seed
    let taskList = await PublicKey.createWithSeed(
        creator,
        createTime.toString(),
        program.programId,
    );

    // Get globalAuthority and bump
    const [globalAuthority, globalBump] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PAYMENT_PROGRAM_ID,
    );

    let taskState: TaskList =  await getTaskState(creator, createTime, program);
    let freelancer = taskState.freelancerAddress;

    let tx = new Transaction();

    console.log('==>Release funds');

    tx.add(program.instruction.release(
        new anchor.BN(milestone), globalBump, {
        accounts: {
            admin: userAddress,
            taskList,
            globalAuthority,
            freelancer,
            systemProgram: SystemProgram.programId
        },
        instructions: [],
        signers: [],
    }));

    return tx;
}

/**
 * Create Accept Transaction
 * @param userAddress The User Address
 * @param creator The creator's address of this project which is stored in BE
 * @param createTime This project's create time which is stored in BE
 * @param program The program
 * @returns 
 */
export const createAcceptTx = async (
    userAddress: PublicKey,
    creator: PublicKey,
    createTime: number,
    program: anchor.Program,
) => {
    /// Get taskList publickey with seed
    let taskList = await PublicKey.createWithSeed(
        creator,
        createTime.toString(),
        program.programId,
    );
  
    let tx = new Transaction();

    console.log('==>Accept Project');

    tx.add(program.instruction.accept(
        {
        accounts: {
            lancer: userAddress,
            taskList,
        },
    }));

    return tx;
}

/**
 * Create Mark as Complete Transaction
 * @param userAddress The User Address
 * @param milestone The milestone to mark as complete
 * @param creator The creator's address of this project which is stored in BE
 * @param createTime This project's create time which is stored in BE
 * @param program The program
 * @returns 
 */
export const createMarkTx = async (
    userAddress: PublicKey,
    milestone: number,
    creator: PublicKey,
    createTime: number,
    program: anchor.Program,
) => {
    // Get taskList publickey with seed
    let taskList = await PublicKey.createWithSeed(
        creator,
        createTime.toString(),
        program.programId,
    );
  
    let tx = new Transaction();

    console.log('==>Mark as Complete');

    tx.add(program.instruction.markComplete(
        new anchor.BN(milestone), {
        accounts: {
            lancer: userAddress,
            taskList,
        },
    }));

    return tx;
}

/**
 * Get Global State
 */
export const getGlobalState = async (
    program: anchor.Program,
): Promise<GlobalPool | null> => {
    const [globalAuthority, _] = await PublicKey.findProgramAddress(
        [Buffer.from(GLOBAL_AUTHORITY_SEED)],
        PAYMENT_PROGRAM_ID
    );
    try {
        let globalState = await program.account.globalPool.fetch(globalAuthority);
        return globalState as unknown as GlobalPool;
    } catch {
        return null;
    }
}

/**
 * Get the TaskList state 
 * @param creator The project's creator publickey
 * @param createTime The project's create time
 * @param program The program
 * @returns 
 */
export const getTaskState = async (
    creator: PublicKey,
    createTime: number,
    program: anchor.Program
): Promise<TaskList | null> => {
    let taskList = await PublicKey.createWithSeed(
        creator,
        createTime.toString(),
        program.programId,
    );
    try {
        let userPoolState = await program.account.taskList.fetch(taskList);
        return userPoolState as unknown as TaskList;
    } catch {
        return null;
    }
}


main();