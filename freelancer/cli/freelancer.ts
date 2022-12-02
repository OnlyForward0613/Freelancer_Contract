export type Freelancer = {
  "version": "0.1.0",
  "name": "freelancer",
  "instructions": [
    {
      "name": "createProject",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestones",
          "type": "u64"
        },
        {
          "name": "mAmount",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "mDate",
          "type": {
            "vec": "i64"
          }
        }
      ]
    },
    {
      "name": "escrow",
      "accounts": [
        {
          "name": "rep",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestone",
          "type": "u64"
        }
      ]
    },
    {
      "name": "edit",
      "accounts": [
        {
          "name": "rep",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "startMilestone",
          "type": "u64"
        },
        {
          "name": "newMilestones",
          "type": "u64"
        },
        {
          "name": "mAmount",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "mDate",
          "type": {
            "vec": "i64"
          }
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "release",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "freelancer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestone",
          "type": "u64"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "accept",
      "accounts": [
        {
          "name": "lancer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "markComplete",
      "accounts": [
        {
          "name": "lancer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestone",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "taskList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "repAddress",
            "type": "publicKey"
          },
          {
            "name": "freelancerAddress",
            "type": "publicKey"
          },
          {
            "name": "milestoneDate",
            "type": {
              "array": [
                "i64",
                20
              ]
            }
          },
          {
            "name": "milestoneAmount",
            "type": {
              "array": [
                "u64",
                20
              ]
            }
          },
          {
            "name": "escrowTime",
            "type": "i64"
          },
          {
            "name": "milestone",
            "type": "u64"
          },
          {
            "name": "completeMilestone",
            "type": "u64"
          },
          {
            "name": "activeMilestone",
            "type": "u64"
          },
          {
            "name": "repConfirm",
            "type": "u64"
          },
          {
            "name": "flConfirm",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotConfirmedYet",
      "msg": "Rep or Freelancer Not Confirmed Yet"
    },
    {
      "code": 6001,
      "name": "NotMatchMilestone",
      "msg": "Your Milestone is not the Complete Milestone"
    },
    {
      "code": 6002,
      "name": "PendingMilestone",
      "msg": "There is more than One Pending Milestone"
    },
    {
      "code": 6003,
      "name": "CannotAccess",
      "msg": "This Account Cannot Access This Function"
    },
    {
      "code": 6004,
      "name": "NotProjectRep",
      "msg": "This Account isn't Project Rep"
    },
    {
      "code": 6005,
      "name": "AlreadyAccepted",
      "msg": "This Project is Already Accepted by Someone"
    }
  ]
};

export const IDL: Freelancer = {
  "version": "0.1.0",
  "name": "freelancer",
  "instructions": [
    {
      "name": "createProject",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestones",
          "type": "u64"
        },
        {
          "name": "mAmount",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "mDate",
          "type": {
            "vec": "i64"
          }
        }
      ]
    },
    {
      "name": "escrow",
      "accounts": [
        {
          "name": "rep",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestone",
          "type": "u64"
        }
      ]
    },
    {
      "name": "edit",
      "accounts": [
        {
          "name": "rep",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "startMilestone",
          "type": "u64"
        },
        {
          "name": "newMilestones",
          "type": "u64"
        },
        {
          "name": "mAmount",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "mDate",
          "type": {
            "vec": "i64"
          }
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "release",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "freelancer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestone",
          "type": "u64"
        },
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "accept",
      "accounts": [
        {
          "name": "lancer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "markComplete",
      "accounts": [
        {
          "name": "lancer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "taskList",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "milestone",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "taskList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "repAddress",
            "type": "publicKey"
          },
          {
            "name": "freelancerAddress",
            "type": "publicKey"
          },
          {
            "name": "milestoneDate",
            "type": {
              "array": [
                "i64",
                20
              ]
            }
          },
          {
            "name": "milestoneAmount",
            "type": {
              "array": [
                "u64",
                20
              ]
            }
          },
          {
            "name": "escrowTime",
            "type": "i64"
          },
          {
            "name": "milestone",
            "type": "u64"
          },
          {
            "name": "completeMilestone",
            "type": "u64"
          },
          {
            "name": "activeMilestone",
            "type": "u64"
          },
          {
            "name": "repConfirm",
            "type": "u64"
          },
          {
            "name": "flConfirm",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotConfirmedYet",
      "msg": "Rep or Freelancer Not Confirmed Yet"
    },
    {
      "code": 6001,
      "name": "NotMatchMilestone",
      "msg": "Your Milestone is not the Complete Milestone"
    },
    {
      "code": 6002,
      "name": "PendingMilestone",
      "msg": "There is more than One Pending Milestone"
    },
    {
      "code": 6003,
      "name": "CannotAccess",
      "msg": "This Account Cannot Access This Function"
    },
    {
      "code": 6004,
      "name": "NotProjectRep",
      "msg": "This Account isn't Project Rep"
    },
    {
      "code": 6005,
      "name": "AlreadyAccepted",
      "msg": "This Project is Already Accepted by Someone"
    }
  ]
};
