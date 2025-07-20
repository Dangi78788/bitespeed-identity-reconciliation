// const pool = require("../config/db");

// // const identifyContact = async (req, res) => {
// //   const { email, phoneNumber } = req.body;

// //   if (!email && !phoneNumber) {
// //     return res.status(400).json({ error: 'At least one contact method required' });
// //   }

// //   const client = await pool.connect();

// //   try {
// //     await client.query('BEGIN');

// //     // 1. Find matching contacts
// //     const matches = await findMatchingContacts(email, phoneNumber);

// //     // 2. Handle new contact
// //     if (matches.length === 0) {
// //       const newContact = await createContact(email, phoneNumber, null, 'primary');
// //       const response = buildResponse(newContact, [newContact]);
// //       await client.query('COMMIT');
// //       return res.status(200).json(response);
// //     }

// //     // 3. Get all linked contacts
// //     const contactIds = matches.map(c => c.id);
// //     let allContacts = await getAllLinkedContacts(contactIds);

// //     // 4. Determine primary contact
// //     let primaryContact = determinePrimaryContact(allContacts);

// //     // 5. Handle merging of contacts (FIXED)
// //     const otherPrimaries = allContacts.filter(c =>
// //       c.linkPrecedence === 'primary' && c.id !== primaryContact.id
// //     );

// //     // Merge other primary contacts
// //     if (otherPrimaries.length > 0) {
// //       const mergeIds = otherPrimaries.map(p => p.id);
// //       await mergeContacts(primaryContact.id, mergeIds);

// //       // Refetch contacts after merge
// //       allContacts = await getAllLinkedContacts([primaryContact.id]);
// //       primaryContact = determinePrimaryContact(allContacts);
// //     }

// //     // 6. Check for new information
// //     const existingEmails = new Set(allContacts.map(c => c.email).filter(Boolean));
// //     const existingPhones = new Set(allContacts.map(c => c.phoneNumber).filter(Boolean));

// //     const hasNewInfo = (email && !existingEmails.has(email)) ||
// //                       (phoneNumber && !existingPhones.has(phoneNumber));

// //     // Create new secondary contact if needed
// //     if (hasNewInfo) {
// //       await createContact(email, phoneNumber, primaryContact.id, 'secondary');
// //       // Refetch contacts after creation
// //       allContacts = await getAllLinkedContacts([primaryContact.id]);
// //       primaryContact = determinePrimaryContact(allContacts);
// //     }

// //     // 7. Build response
// //     const response = buildResponse(primaryContact, allContacts);
// //     await client.query('COMMIT');
// //     res.status(200).json(response);
// //   } catch (error) {
// //     await client.query('ROLLBACK');
// //     console.error('Error:', error);
// //     res.status(500).json({ error: 'Internal server error' });
// //   } finally {
// //     client.release();
// //   }
// // };

// /// testing :

// // Updated identifyContact function
// const identifyContact = async (req, res) => {
//   const { email, phoneNumber } = req.body;

//   if (!email && !phoneNumber) {
//     return res
//       .status(400)
//       .json({ error: "At least one contact method required" });
//   }

//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     // 1. Find matching contacts
//     const matches = await findMatchingContacts(email, phoneNumber);
//     if (!Array.isArray(matches)) {
//       throw new Error("Invalid matches returned from database");
//     }

//     // 2. Handle new contact
//     if (matches.length === 0) {
//       const newContact = await createContact(
//         email,
//         phoneNumber,
//         null,
//         "primary"
//       );

//       // Ensure we have the created contact
//       if (!newContact) {
//         throw new Error("Failed to create new contact");
//       }

//       const response = {
//         contact: {
//           primaryContatctId: newContact.id,
//           emails: newContact.email ? [newContact.email] : [],
//           phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
//           secondaryContactIds: [],
//         },
//       };

//       await client.query("COMMIT");
//       return res.status(200).json(response);
//     }

//     // 3. Get all linked contacts
//     const contactIds = matches.map((c) => c.id);
//     let allContacts = await getAllLinkedContacts(contactIds);

//     // 4. Determine primary contact
//     let primaryContact = determinePrimaryContact(allContacts);

//     // 5. Handle merging of contacts - FIXED
//     const otherPrimaries = allContacts.filter(
//       (c) => c.linkPrecedence === "primary" && c.id !== primaryContact.id
//     );

//     if (otherPrimaries.length > 0) {
//       const mergeIds = otherPrimaries.map((p) => p.id);
//       const mergedContacts = await mergeContacts(primaryContact.id, mergeIds);

//       // Refetch all contacts after merge
//       allContacts = await getAllLinkedContacts([primaryContact.id]);
//       primaryContact = determinePrimaryContact(allContacts);
//     }

//     // 6. Check for new information
//     const existingEmails = new Set(
//       allContacts.map((c) => c.email).filter(Boolean)
//     );
//     const existingPhones = new Set(
//       allContacts.map((c) => c.phoneNumber).filter(Boolean)
//     );

//     const hasNewInfo =
//       (email && !existingEmails.has(email)) ||
//       (phoneNumber && !existingPhones.has(phoneNumber));

//     if (hasNewInfo) {
//       const newSecondary = await createContact(
//         email,
//         phoneNumber,
//         primaryContact.id,
//         "secondary"
//       );
//       allContacts.push(newSecondary);
//     }

//     // 7. Build response
//     const response = buildResponse(primaryContact, allContacts);
//     await client.query("COMMIT");
//     res.status(200).json(response);
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   } finally {
//     client.release();
//   }
// };

// //  Find existing contacts
// // const findMatchingContacts = async (email, phoneNumber) => {
// //   const query = `
// //     SELECT * FROM Contact
// //     WHERE (email = $1 OR "phoneNumber" = $2)
// //     AND "deletedAt" IS NULL
// //   `;
// //   return pool.query(query, [email, phoneNumber]);
// // };

// const findMatchingContacts = async (email, phoneNumber) => {
//   try {
//     const query = `
//       SELECT * FROM Contact
//       WHERE (email = $1 OR "phoneNumber" = $2)
//       AND "deletedAt" IS NULL
//     `;
//     const result = await pool.query(query, [email, phoneNumber]);
//     return result.rows;
//   } catch (err) {
//     console.error("Error in findMatchingContacts:", err);
//     return []; // Return empty array on error
//   }
// };

// // Get all linked contacts
// // const getLinkedContacts = async (contactIds) => {
// //   const query = `
// //     WITH RECURSIVE contact_tree AS (
// //       SELECT * FROM Contact WHERE id = ANY($1)
// //       UNION
// //       SELECT c.* FROM Contact c
// //       JOIN contact_tree ct ON c.id = ct."linkedId" OR c."linkedId" = ct.id
// //     )
// //     SELECT * FROM contact_tree
// //   `;
// //   return pool.query(query, [contactIds]);
// // };

// const getAllLinkedContacts = async (contactIds) => {
//   if (!contactIds.length) return [];

//   try {
//     const query = `
//       WITH RECURSIVE contact_tree AS (
//         SELECT * FROM Contact WHERE id = ANY($1)
//         UNION
//         SELECT c.* FROM Contact c
//         JOIN contact_tree ct ON c.id = ct."linkedId" OR c."linkedId" = ct.id
//       )
//       SELECT * FROM contact_tree
//     `;
//     const result = await pool.query(query, [contactIds]);
//     return result.rows;
//   } catch (err) {
//     console.error("Error in getAllLinkedContacts:", err);
//     return [];
//   }
// };

// // Determine primary contact
// const determinePrimaryContact = (contacts) => {
//   const primaries = contacts.filter((c) => c.linkPrecedence === "primary");
//   return primaries.reduce((oldest, current) =>
//     oldest.createdAt < current.createdAt ? oldest : current
//   );
// };

// // Handle merging of contacts
// // const mergeContacts = async (primaryId, contactsToMerge) => {
// //   const updateQuery = `
// //     UPDATE Contact
// //     SET "linkedId" = $1,
// //         "linkPrecedence" = 'secondary',
// //         "updatedAt" = NOW()
// //     WHERE id = ANY($2)
// //     RETURNING *
// //   `;
// //   return pool.query(updateQuery, [primaryId, contactsToMerge]);
// // };

// const mergeContacts = async (primaryId, contactsToMerge) => {
//   const updateQuery = `
//     UPDATE Contact
//     SET "linkedId" = $1,
//         "linkPrecedence" = 'secondary',
//         "updatedAt" = NOW()
//     WHERE id = ANY($2)
//     RETURNING *
//   `;
//   const result = await pool.query(updateQuery, [primaryId, contactsToMerge]);
//   return result.rows; // Return just the rows
// };

// // Create new contact
// // const createContact = async (email, phoneNumber, linkedId, precedence) => {
// //   const query = `
// //     INSERT INTO Contact (email, "phoneNumber", "linkedId", "linkPrecedence")
// //     VALUES ($1, $2, $3, $4)
// //     RETURNING *
// //   `;
// //   return pool.query(query, [email, phoneNumber, linkedId, precedence]);
// // };

// // Fixed createContact function
// const createContact = async (email, phoneNumber, linkedId, precedence) => {
//   const query = `
//     INSERT INTO Contact (email, "phoneNumber", "linkedId", "linkPrecedence")
//     VALUES ($1, $2, $3, $4)
//     RETURNING *
//   `;
//   const result = await pool.query(query, [
//     email,
//     phoneNumber,
//     linkedId,
//     precedence,
//   ]);
//   return result.rows[0]; // Return the created contact object
// };

// // Build response
// // const buildResponse = (primaryContact, allContacts) => {
// //   const secondaryContacts = allContacts.filter(
// //     (c) => c.linkPrecedence === "secondary" || c.id !== primaryContact.id
// //   );

// //   const emails = [
// //     primaryContact.email,
// //     ...new Set(secondaryContacts.map((c) => c.email).filter(Boolean)),
// //   ].filter(Boolean);

// //   const phoneNumbers = [
// //     primaryContact.phoneNumber,
// //     ...new Set(secondaryContacts.map((c) => c.phoneNumber).filter(Boolean)),
// //   ].filter(Boolean);

// //   return {
// //     contact: {
// //       primaryContatctId: primaryContact.id,
// //       emails: [...new Set(emails)],
// //       phoneNumbers: [...new Set(phoneNumbers)],
// //       secondaryContactIds: secondaryContacts
// //         .map((c) => c.id)
// //         .sort((a, b) => a - b),
// //     },
// //   };
// // };

// ///   testing for duplicate values

// // Updated buildResponse to prevent duplicates
// const buildResponse = (primaryContact, allContacts) => {
//   const emailSet = new Set();
//   const phoneSet = new Set();
//   const secondaryIds = new Set();

//   allContacts.forEach((contact) => {
//     if (contact.email) emailSet.add(contact.email);
//     if (contact.phoneNumber) phoneSet.add(contact.phoneNumber);
//     if (contact.id !== primaryContact.id) {
//       secondaryIds.add(contact.id);
//     }
//   });

//   return {
//     contact: {
//       primaryContatctId: primaryContact.id,
//       emails: Array.from(emailSet),
//       phoneNumbers: Array.from(phoneSet),
//       secondaryContactIds: Array.from(secondaryIds).sort((a, b) => a - b),
//     },
//   };
// };

// module.exports = { identifyContact };

/////   updated code:
const pool = require("../config/db");

/**
 * Main controller for identity reconciliation
 * Handles contact creation, linking, and merging
 */
const identifyContact = async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res
      .status(400)
      .json({ error: "At least one contact method required" });
  }

  const client = await pool.connect();
  console.log("db connection established");

  try {
    await client.query("BEGIN");

    // 1. Find existing contacts that match either email or phone
    const matches = await findMatchingContacts(email, phoneNumber);

    // 2. If no matches, create new primary contact
    if (matches.length === 0) {
      const newContact = await createContact(
        email,
        phoneNumber,
        null,
        "primary"
      );
      const response = buildResponse(newContact, [newContact]);
      await client.query("COMMIT");
      return res.status(200).json(response);
    }

    // 3. Get all linked contacts
    const contactIds = matches.map((c) => c.id);
    let allContacts = await getAllLinkedContacts(contactIds);

    // 4. Determine primary contact
    let primaryContact = determinePrimaryContact(allContacts);

    // 5. Handle merging of other primary contacts
    const otherPrimaries = allContacts.filter(
      (c) => c.linkPrecedence === "primary" && c.id !== primaryContact.id
    );

    if (otherPrimaries.length > 0) {
      const mergeIds = otherPrimaries.map((p) => p.id);
      await mergeContacts(primaryContact.id, mergeIds);
      // Refresh contacts after merge
      allContacts = await getAllLinkedContacts([primaryContact.id]);
      primaryContact = determinePrimaryContact(allContacts);
    }

    // 6. Check if we need to create new contact
    if (needsNewContact(email, phoneNumber, allContacts)) {
      // Only create if we have new information not already linked
      const newSecondary = await createContact(
        email,
        phoneNumber,
        primaryContact.id,
        "secondary"
      );
      allContacts.push(newSecondary);
    }

    // 7. Build and return response
    const response = buildResponse(primaryContact, allContacts);
    await client.query("COMMIT");
    res.status(200).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

/* ========== HELPER FUNCTIONS ========== */

/**
 * Finds contacts matching either email or phoneNumber
 * Returns empty array if no matches
 */
const findMatchingContacts = async (email, phoneNumber) => {
  try {
    const query = `
      SELECT * FROM Contact 
      WHERE (email = $1 OR "phoneNumber" = $2)
      AND "deletedAt" IS NULL
    `;
    const result = await pool.query(query, [email, phoneNumber]);
    return result.rows;
  } catch (err) {
    console.error("Error in findMatchingContacts:", err);
    return [];
  }
};

/**
 * Recursively finds all linked contacts (both directions)
 * Handles complex contact chains
 */
const getAllLinkedContacts = async (contactIds) => {
  if (!contactIds.length) return [];

  try {
    const query = `
      WITH RECURSIVE contact_tree AS (
        SELECT * FROM Contact WHERE id = ANY($1)
        UNION
        SELECT c.* FROM Contact c
        JOIN contact_tree ct ON c.id = ct."linkedId" OR c."linkedId" = ct.id
      )
      SELECT * FROM contact_tree
    `;
    const result = await pool.query(query, [contactIds]);
    return result.rows;
  } catch (err) {
    console.error("Error in getAllLinkedContacts:", err);
    return [];
  }
};

/**
 * Determines the primary contact from a list
 * Always returns the oldest primary contact
 */
const determinePrimaryContact = (contacts) => {
  const primaries = contacts.filter((c) => c.linkPrecedence === "primary");
  return primaries.reduce((oldest, current) =>
    oldest.createdAt < current.createdAt ? oldest : current
  );
};

/**
 * Merges secondary contacts into a primary contact
 * Updates linkPrecedence and linkedId
 */
const mergeContacts = async (primaryId, contactsToMerge) => {
  const updateQuery = `
    UPDATE Contact 
    SET "linkedId" = $1, 
        "linkPrecedence" = 'secondary',
        "updatedAt" = NOW()
    WHERE id = ANY($2)
    RETURNING *
  `;
  const result = await pool.query(updateQuery, [primaryId, contactsToMerge]);
  return result.rows;
};

/**
 * Creates a new contact record
 * Handles both primary and secondary contacts
 */
const createContact = async (email, phoneNumber, linkedId, precedence) => {
  const query = `
    INSERT INTO Contact (email, "phoneNumber", "linkedId", "linkPrecedence")
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const result = await pool.query(query, [
    email,
    phoneNumber,
    linkedId,
    precedence,
  ]);
  return result.rows[0];
};

// New helper function
const needsNewContact = (email, phoneNumber, allContacts) => {
  // Check if we have any completely new information
  const hasNewEmail = email && !allContacts.some((c) => c.email === email);
  const hasNewPhone =
    phoneNumber && !allContacts.some((c) => c.phoneNumber === phoneNumber);

  // If we have both email and phone, check if this exact combination exists
  if (email && phoneNumber) {
    const exactMatchExists = allContacts.some(
      (c) => c.email === email && c.phoneNumber === phoneNumber
    );
    return !exactMatchExists && (hasNewEmail || hasNewPhone);
  }

  return hasNewEmail || hasNewPhone;
};

/**
 * Builds the final response object
 * Deduplicates emails and phone numbers
 * Sorts secondary contact IDs
 */
const buildResponse = (primaryContact, allContacts) => {
  const emailSet = new Set();
  const phoneSet = new Set();
  const secondaryIds = new Set();

  allContacts.forEach((contact) => {
    if (contact.email) emailSet.add(contact.email);
    if (contact.phoneNumber) phoneSet.add(contact.phoneNumber);
    if (contact.id !== primaryContact.id) {
      secondaryIds.add(contact.id);
    }
  });

  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails: Array.from(emailSet),
      phoneNumbers: Array.from(phoneSet),
      secondaryContactIds: Array.from(secondaryIds).sort((a, b) => a - b),
    },
  };
};

module.exports = { identifyContact };
