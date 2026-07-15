// =============================================================
//  LoanPortal — Teams Feature Migration Script
//  Run via: mongosh "mongodb+srv://..." --file migration_teams.js
//           OR paste into MongoDB Compass > mongosh shell
//
//  Idempotent — safe to run multiple times.
// =============================================================

// ── CHANGE THIS to match your database name ──────────────────
const DB_NAME = "loanportal_dev";          // <-- update if different
// ─────────────────────────────────────────────────────────────

const db = db.getSiblingDB(DB_NAME);

print("=======================================================");
print(" LoanPortal Teams Migration");
print(" Database: " + DB_NAME);
print("=======================================================\n");


// ─────────────────────────────────────────────────────────────
// STEP 1 — Patch Users collection
//   Add teamId: null to every user that doesn't already have it
// ─────────────────────────────────────────────────────────────
print("STEP 1: Adding 'teamId' field to Users collection ...");

const usersResult = db.Users.updateMany(
    { teamId: { $exists: false } },       // only patch documents missing the field
    { $set: { teamId: null } }
);

print(`  Matched : ${usersResult.matchedCount}`);
print(`  Modified: ${usersResult.modifiedCount}`);
print("  Done.\n");


// ─────────────────────────────────────────────────────────────
// STEP 2 — Create Teams collection (if it doesn't exist)
//   Includes JSON Schema validation matching the C# TeamEntity
// ─────────────────────────────────────────────────────────────
print("STEP 2: Setting up Teams collection ...");

const existingCollections = db.getCollectionNames();

if (!existingCollections.includes("Teams")) {
    db.createCollection("Teams", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["_id", "name", "companyId", "isActive", "createdAt", "createdBy"],
                properties: {
                    _id: {
                        bsonType: "binData",
                        description: "UUID (Guid) — required"
                    },
                    name: {
                        bsonType: "string",
                        minLength: 1,
                        description: "Team name — required, non-empty"
                    },
                    description: {
                        bsonType: ["string", "null"],
                        description: "Optional description"
                    },
                    companyId: {
                        bsonType: "binData",
                        description: "Owning company UUID — required"
                    },
                    isActive: {
                        bsonType: "bool",
                        description: "Soft-active flag — required"
                    },
                    createdAt: {
                        bsonType: "date",
                        description: "Creation timestamp UTC — required"
                    },
                    updatedAt: {
                        bsonType: ["date", "null"],
                        description: "Last update timestamp UTC — optional"
                    },
                    createdBy: {
                        bsonType: "binData",
                        description: "UserId (Guid) of creator — required"
                    }
                }
            }
        },
        validationLevel: "moderate",     // warn on invalid, don't block reads
        validationAction: "warn"         // log violations without rejecting writes
    });
    print("  Teams collection created with schema validation.\n");
} else {
    print("  Teams collection already exists — skipped creation.\n");
}


// ─────────────────────────────────────────────────────────────
// STEP 3 — Create indexes on Teams collection
// ─────────────────────────────────────────────────────────────
print("STEP 3: Creating indexes on Teams collection ...");

// Index 1: Look up all teams for a company (most common query)
db.Teams.createIndex(
    { companyId: 1, isActive: 1 },
    { name: "idx_teams_companyId_isActive", background: true }
);
print("  [OK] idx_teams_companyId_isActive");

// Index 2: Enforce unique team name per company
db.Teams.createIndex(
    { companyId: 1, name: 1 },
    { name: "idx_teams_companyId_name_unique", unique: true, background: true }
);
print("  [OK] idx_teams_companyId_name_unique (unique)");

// Index 3: Sort / filter by creation date
db.Teams.createIndex(
    { createdAt: -1 },
    { name: "idx_teams_createdAt", background: true }
);
print("  [OK] idx_teams_createdAt\n");


// ─────────────────────────────────────────────────────────────
// STEP 4 — Create index on Users.teamId
//   Speeds up GetTeamMembers / GetActiveUserCountByTeamId
// ─────────────────────────────────────────────────────────────
print("STEP 4: Creating index on Users.teamId ...");

db.Users.createIndex(
    { teamId: 1 },
    { name: "idx_users_teamId", sparse: true, background: true }
    // sparse: true — skips null values; only indexes users who are in a team
);
print("  [OK] idx_users_teamId (sparse)\n");


// ─────────────────────────────────────────────────────────────
// STEP 5 — Verification summary
// ─────────────────────────────────────────────────────────────
print("STEP 5: Verification summary");

const usersWithTeamId = db.Users.countDocuments({ teamId: { $exists: true } });
const usersWithoutTeamId = db.Users.countDocuments({ teamId: { $exists: false } });
const teamCount = db.Teams.countDocuments({});
const teamsIndexes = db.Teams.getIndexes().map(i => i.name);
const usersTeamIndexes = db.Users.getIndexes().filter(i => i.name.includes("teamId")).map(i => i.name);

print(`  Users with    teamId field : ${usersWithTeamId}`);
print(`  Users without teamId field : ${usersWithoutTeamId}  <-- should be 0`);
print(`  Teams documents            : ${teamCount}`);
print(`  Teams indexes              : ${JSON.stringify(teamsIndexes)}`);
print(`  Users teamId indexes       : ${JSON.stringify(usersTeamIndexes)}`);

if (usersWithoutTeamId === 0) {
    print("\n  Migration completed successfully.");
} else {
    print("\n  WARNING: Some users are still missing teamId — re-run the script.");
}

print("\n=======================================================\n");
