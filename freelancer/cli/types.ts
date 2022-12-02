import * as anchor from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export const GLOBAL_AUTHORITY_SEED = "global-authority";

export const PAYMENT_PROGRAM_ID = new PublicKey("5NHu4AZU4Un7pXsD8CbradhkmNTzCfYRWE7nxz2m4x6k");
export const TREASURY_WALLET = new PublicKey("32NL69SFk8GLPFZfKQwsuexcXHd7rqAQn1mrasF1ksVj");
export const TASK_SIZE = 440;

export const DECIMALS = 1000000000;

export interface GlobalPool {
    // 8 + 32
    superAdmin: PublicKey,          // 32
}

export interface TaskList {
    repAddress: PublicKey,
    freelancerAddress: PublicKey,
    milestoneDate: anchor.BN[],
    milestoneAmount: anchor.BN[],
    escrowTime: anchor.BN,
    milestone: anchor.BN,
    completeMilestone: anchor.BN,
    activeMilestone: anchor.BN,
    repConfirm: Boolean,
    flConfirm: Boolean
}
