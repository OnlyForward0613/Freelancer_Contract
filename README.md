# Web3Connect-SmartContract
This is the 💲 Payment 💰 System Smart Contract for Freelancer Website.

## Install Dependencies
- Install `node` and `yarn`
- Install `ts-node` as global command
- Confirm the solana wallet preparation: `/home/---/.config/solana/id.json` in test case

## Usage
- Main script source for all functionality is here: `/cli/script.ts`
- Program account types are declared here: `/cli/types.ts`
- Idl to make the JS binding easy is here: `/cli/freelancer.ts`

Able to test the script functions working in this way.
- Change commands properly in the main functions of the `script.ts` file to call the other functions
- Confirm the `ANCHOR_WALLET` environment variable of the `ts-node` script in `package.json`
- Run `yarn ts-node`

# Features

##  How to deploy this program?
First of all, you have to git clone in your PC.
In the folder `freelancer`, in the terminal 
1. `yarn`

2. `anchor build`
   In the last sentence you can see:  
```
 To deploy this program:
  $ solana program deploy /home/.../freelancer/target/deploy/freelancer.so
The program address will default to this keypair (override with --program-id):
  /home/.../freelancer/target/deploy/freelancer-keypair.json
```  
3. `solana-keygen pubkey /home/.../freelancer/target/deploy/freelancer-keypair.json`
4. You can get the pubkey of the `program ID : ex."5N...x6k"`
5. Please add this pubkey to the lib.rs
  `line 14: declare_id!("5N...x6k");`
6. Please add this pubkey to the Anchor.toml
  `line 4: freelancer = "5N...x6k"`
7. Please add this pubkey to the types.ts
  `line 6: export const PAYMENT_PROGRAM_ID = new PublicKey("5N...x6k");`
  
8. `anchor build` again
9. `solana program deploy /home/.../freelancer/target/deploy/freelancer.so`

<p align = "center">
Then, you can enjoy this program 🎭
</p>
</br>

## How to use?

### - As a Project Rep
#### + Create
The Project Rep can create the project with several milestones, the function `createProject`
```js
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
)
```
#### + Escrow
The Project Rep can escrow the funds for the specific milestone, the function `createEscrow`
```js
/**
 * @dev Escrow funds for `milestone`
 * @param milestone The milestone to escrow funds
 * @param createTime This project's create time which is stored in BE
 */
export const createEscrow = async (
    milestone: number,
    createTime: number
) 
```
#### + Edit
The Project Rep can edit the milestone schedule, the function `createEdit`
```js
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
) 
```
#### + Release
The Project Rep / Admin / Freelancer (2 weeks after finished the task) can release the funds to the freelancer, the function `createRelease`
```js

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
)
```

### - As a Freelancer
#### + Accept
The freelancer can accept the project which is created by a proejct Rep, the function `createAccept`

```js
/**
 * @dev Accept the project
 * @param creator The creator's address of this project which is stored in BE
 * @param createTime This project's create time which is stored in BE
 */
export const createAccept = async (
    creator: PublicKey,
    createTime: number,
)
```
#### + Mark as Complete
The freelancer mark as complete after he has done the project, call the function `createMark`
```js
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
)
```
## For Unit Test
Flow(create -> accept -> escrow -> mark as complete -> release)
1. Decommand the line 46: and `yarn ts-node`
2. Command the line 46, decommand the line 53: and `yarn free`
3. Command the line 53, decommand the line 47: and `yarn ts-node`
4. Command the line 47, decommand the line 54: and `yarn free`
5. Command the line 54, decommand the line 49: and `yarn ts-node`

Here `ts-node` is for Project Rep's wallet integration and perform the project Rep's functions, 
and `free` is for freelancer's wallet integration and perform the freelancer's functions.

```js
yarn ts-node:  "export ANCHOR_WALLET=/home/ubuntu.../keypair.json && ts-node ./cli/script.ts"
```

```js
yarn free:  "export ANCHOR_WALLET=/home/ubuntu.../keypair.json && ts-node ./cli/script.ts"
```


