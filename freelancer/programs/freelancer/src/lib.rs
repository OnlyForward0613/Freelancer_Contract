use anchor_lang::{prelude::*, AccountSerialize, AnchorDeserialize};
use solana_program::pubkey::Pubkey;

pub mod account;
pub mod constants;
pub mod error;
pub mod utils;

use account::*;
use constants::*;
use error::*;
use utils::*;

declare_id!("5NHu4AZU4Un7pXsD8CbradhkmNTzCfYRWE7nxz2m4x6k");

#[program]
pub mod freelancer {
    use super::*;
   
    /**
     * This is the function to create the project
     * @param milestones: show how many milestones are there in this project
     * @param m_amount: milestone budgets for each milestone
     * @param m_date: milestone date as unixtimestamp
     * @param creator_check:
     */
    pub fn create_project(
        ctx: Context<CreateProject>,
        milestones: u64,
        m_amount: Vec<u64>,
        m_date: Vec<i64>,
    ) -> Result<()> {
        // Get the project's account data from the blockchain
        let mut task_list = ctx.accounts.task_list.load_init()?;

        // Initialize the rep and freelancer address of the project
        task_list.rep_address = ctx.accounts.creator.key();
        task_list.rep_confirm = true;

        // You can save milestone's estimate budget and date prediction in the blockchain
        for i in 0..milestones {
            task_list.milestone_date[i as usize] = m_date[i as usize];
            task_list.milestone_amount[i as usize] = m_amount[i as usize];
        }

        // Save the total milestones and initialize the complete_milestone as 0
        task_list.milestone = milestones;

        Ok(())
    }

    /**
     * This is the function to escrow the selected milestone
     * @param milestone: the milestone number to escrow
     *  ~ _creator, _create_time are used to get the address of this project account
     */
    pub fn escrow(
        ctx: Context<Escrow>,
        milestone: u64,
    ) -> Result<()> {
        // Get the project's account data from the blockchain
        let mut task_list = ctx.accounts.task_list.load_mut()?;

        // Get the block timestamp 
        let timestamp = Clock::get()?.unix_timestamp;

        // The caller should be this project's rep
        require!(task_list.rep_address == ctx.accounts.rep.key(), FreelancerError::NotProjectRep);

        // The project_rep and freelancer should confirm this project together
        require!(
            task_list.rep_confirm && task_list.fl_confirm,
            FreelancerError::NotConfirmedYet
        );

        // The amount to escrow for the selected milestone
        let total_amount = task_list.milestone_amount[(milestone - 1) as usize];

        // Escrow funds to the PDA
        sol_transfer_user(
            ctx.accounts.rep.to_account_info(),
            ctx.accounts.global_authority.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            total_amount,
        )?;

        // Send FEE to the treasury_wallet
        let fee_amount = total_amount * COMMISSION_FEE / 1000;
        sol_transfer_user(
            ctx.accounts.rep.to_account_info(),
            ctx.accounts.treasury_wallet.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            fee_amount,
        )?;

        // Set this milestone as active state
        task_list.active_milestone = milestone;

        // Set the escrow_time 
        task_list.escrow_time = timestamp;

        Ok(())
    }

    /**
     * This function is to edit the milestones
     * @param start_milestone: the start milestone to edit the milestones
     * @param new_milestones: the total new milestones
     * @param m_amount: estimate milestone budgets
     * @param m_date: the date prediction of each milestones
     * @param creator_check
     * @param 
     */
    pub fn edit(
        ctx: Context<EditProject>,
        start_milestone: u64,
        new_milestones: u64,
        m_amount: Vec<u64>,
        m_date: Vec<i64>,
        bump: u8,
    ) -> Result<()> {
        // Get the project's account data from the blockchain
        let mut task_list = ctx.accounts.task_list.load_mut()?;

        // The caller should be this project's rep
        require!(task_list.rep_address == ctx.accounts.rep.key(), FreelancerError::NotProjectRep);

        // Get active milestone from the blockchain
        let active_milestone = task_list.active_milestone;

        // Get milestone amount of saved milestones on blockchain and newly set milestones
        let ex_amount = task_list.milestone_amount[(active_milestone - 1) as usize];
        let new_amount = m_amount[(active_milestone - 1) as usize];

        // Save new milestone data in the blockchain
        for i in (start_milestone - 1)..new_milestones {
            task_list.milestone_amount[i as usize] = m_amount[i as usize];
            task_list.milestone_date[i as usize] = m_date[i as usize];
        }

        // If you want to change active_milestone, send the difference amount between New and Old data
        if start_milestone == active_milestone {
            if new_amount > ex_amount {
                sol_transfer_user(
                    ctx.accounts.rep.to_account_info(),
                    ctx.accounts.global_authority.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                    new_amount - ex_amount,
                )?;

                let fee_amount = (new_amount - ex_amount) * COMMISSION_FEE / 1000;
                sol_transfer_user(
                    ctx.accounts.rep.to_account_info(),
                    ctx.accounts.treasury_wallet.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                    fee_amount,
                )?;
            } else {
                sol_transfer_with_signer(
                    ctx.accounts.global_authority.to_account_info(),
                    ctx.accounts.rep.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                    &[&[GLOBAL_AUTHORITY_SEED.as_ref(), &[bump]]],
                    ex_amount - new_amount,
                )?;
                let fee_amount = (ex_amount - new_amount) * COMMISSION_FEE /1000;
                sol_transfer_user(
                    ctx.accounts.rep.to_account_info(),
                    ctx.accounts.treasury_wallet.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                    fee_amount,
                )?;
            }
        }

        // Set the milestone as new one
        task_list.milestone = new_milestones;
        // Set the freelancer confirm field as 1
        task_list.fl_confirm = false;
        
        Ok(())
    }

    /**
     * This function is to release funds to the freelancers
     * @param milestone: the milestone to release funds to the freelancers
     *  ~ _creator, _create_time are used to get the address of this project account
     */
    pub fn release(
        ctx: Context<Release>, 
        milestone: u64, 
        bump: u8,
    ) -> Result<()> {
        
        // Get the project's account data from the blockchain
        let mut task_list = ctx.accounts.task_list.load_mut()?;

        // The project_rep and freelancer should confirm this project together
        require!(
            task_list.rep_confirm && task_list.fl_confirm,
            FreelancerError::NotConfirmedYet
        );

        // Get the block timestamp 
        let timestamp = Clock::get()?.unix_timestamp;
        
        // This milestone should be complete_milestone
        require!(
            milestone == task_list.complete_milestone,
            FreelancerError::NotMatchMilestone
        );
        // This function'a caller should be rep, or freelancer, or website admin 
        let admin = ctx.accounts.admin.key();
        require!(
            admin == task_list.rep_address 
            || (admin == task_list.freelancer_address && timestamp > task_list.escrow_time + WEEK) 
            || admin == ADMIN_WALLET.parse::<Pubkey>().unwrap(),
            FreelancerError::CannotAccess
        );

        // Get the amount to release and transfer funds to the freelancer
        let release_amount = task_list.milestone_amount[(milestone - 1) as usize];

        sol_transfer_with_signer(
            ctx.accounts.global_authority.to_account_info(),
            ctx.accounts.freelancer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            &[&[GLOBAL_AUTHORITY_SEED.as_ref(), &[bump]]],
            release_amount,
        )?;
        
        // Initialize the complete_milestone as 0
        task_list.complete_milestone = 0;

        Ok(())
    }

    //==================  Freelancer Side  ===================//

    /**
     * This is the function to accept the project in the freelancer side
     *  ~ _creator, _create_time are used to get the address of this project account
     */
    pub fn accept(
        ctx: Context<AcceptProject>,
    ) -> Result<()> {
        // Get the project's account data from the blockchain
        let mut task_list = ctx.accounts.task_list.load_mut()?;

         // The caller should be this project's rep
        require!((task_list.freelancer_address == Pubkey::default() && task_list.active_milestone == 0)
            || (task_list.freelancer_address == ctx.accounts.lancer.key() && task_list.fl_confirm), FreelancerError::AlreadyAccepted);

        task_list.freelancer_address = ctx.accounts.lancer.key();

        // Set the freelancer confirm field as 1
        task_list.fl_confirm = true;

        Ok(())
    }

    /**
     * This is the function to mark as complete the milestone in the freelancer side
     * @param milestone: the milestone which is completed by freelancer
     *  ~ _creator, _create_time are used to get the address of this project account
     */
    pub fn mark_complete(
        ctx: Context<MarkComplete>,
        milestone: u64,
    ) -> Result<()> {
        // Get the project's account data from the blockchain
        let mut task_list = ctx.accounts.task_list.load_mut()?;

        // The project_rep and freelancer should confirm this project together
        require!(
            task_list.rep_confirm && task_list.fl_confirm,
            FreelancerError::NotConfirmedYet
        );

        // There should be not the complete milestone also
        require!(
            task_list.complete_milestone == 0,
            FreelancerError::PendingMilestone
        );

        // Set the complete milestone as newly finished milestone
        task_list.complete_milestone = milestone;

        Ok(())
    }
}


#[derive(Accounts)]
pub struct CreateProject<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(zero)]
    pub task_list: AccountLoader<'info, TaskList>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Escrow<'info> {
    #[account(mut)]
    pub rep: Signer<'info>,

    #[account(mut)]
    pub task_list: AccountLoader<'info, TaskList>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: AccountInfo<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        constraint = treasury_wallet.key() == TREASURY_WALLET.parse::<Pubkey>().unwrap()
    )]
    pub treasury_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EditProject<'info> {
    #[account(mut)]
    pub rep: Signer<'info>,

    #[account(mut)]
    pub task_list: AccountLoader<'info, TaskList>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        constraint = treasury_wallet.key() == TREASURY_WALLET.parse::<Pubkey>().unwrap()
    )]
    pub treasury_wallet: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(bump: u8)]
pub struct Release<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub task_list: AccountLoader<'info, TaskList>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump,
    )]
    pub global_authority: AccountInfo<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    pub freelancer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptProject<'info> {
    #[account(mut)]
    pub lancer: Signer<'info>,

    
    #[account(mut)]
    pub task_list: AccountLoader<'info, TaskList>,
}

#[derive(Accounts)]
pub struct MarkComplete<'info> {
    #[account(mut)]
    pub lancer: Signer<'info>,

   
    #[account(mut)]
    pub task_list: AccountLoader<'info, TaskList>,
}