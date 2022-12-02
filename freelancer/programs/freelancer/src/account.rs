use anchor_lang::prelude::*;
use std::clone::Clone;

use crate::constants::*;


#[account(zero_copy)]
pub struct TaskList {
    pub rep_address: Pubkey,
    pub freelancer_address: Pubkey,
    pub milestone_date: [i64; MAX_MILESTONE],
    pub milestone_amount: [u64; MAX_MILESTONE],
    pub escrow_time: i64,
    pub milestone: u64,
    pub complete_milestone: u64,
    pub active_milestone: u64,
    pub rep_confirm: bool,
    pub fl_confirm: bool,
}


impl Default for TaskList {
    #[inline]
    fn default() -> TaskList {
        TaskList {
            rep_address: Pubkey::default(),
            freelancer_address: Pubkey::default(),
            milestone_date: [0; MAX_MILESTONE],
            milestone_amount: [0; MAX_MILESTONE],
            escrow_time: 0,
            milestone: 0,
            complete_milestone: 0,
            active_milestone: 0,
            rep_confirm: false,
            fl_confirm: false,
        }
    }
}
pub const DISCRIMINATOR_LENGTH: usize = 8;
pub const PUBLIC_KEY_LENGTH: usize = 32;
pub const U64_LENGTH: usize = 8;
pub const I64_LENGTH: usize = 8;
pub const U8_LENGTH: usize = 1;

impl TaskList {
    pub const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH
        + PUBLIC_KEY_LENGTH
        + U64_LENGTH * MAX_MILESTONE
        + I64_LENGTH * MAX_MILESTONE
        + I64_LENGTH
        + U64_LENGTH
        + U64_LENGTH
        + U64_LENGTH
        + U64_LENGTH
        + U64_LENGTH;
}
