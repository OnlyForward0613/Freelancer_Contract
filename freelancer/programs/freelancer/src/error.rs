use anchor_lang::prelude::*;

#[error_code]
pub enum FreelancerError {
    #[msg("Rep or Freelancer Not Confirmed Yet")]
    NotConfirmedYet,
    #[msg("Your Milestone is not the Complete Milestone")]
    NotMatchMilestone,
    #[msg("There is more than One Pending Milestone")]
    PendingMilestone,
    #[msg("This Account Cannot Access This Function")]
    CannotAccess,
    #[msg("This Account isn't Project Rep")]
    NotProjectRep,
    #[msg("This Project is Already Accepted by Someone")]
    AlreadyAccepted
    
}
