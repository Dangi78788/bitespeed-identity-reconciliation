# Bitespeed Identity Reconciliation

A web service that identifies and links customer contact information across multiple purchases. Built to track customers who use different email addresses and phone numbers for each order.

## 🚀 Live Demo

**API Endpoint:** `https://bitespeed-identity-reconciliation-5pj1.onrender.com/identify`

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Setup and Deployment](#setup-and-deployment)

## 🎯 Problem Statement

FluxKart.com customers use different contact information for each purchase to maintain privacy. The challenge is to identify and link these separate orders to the same customer for personalized experience and loyalty rewards.

## ✅ Solution

The service maintains a Contact table where:
- **Primary Contact**: First contact entry for a customer
- **Secondary Contacts**: Subsequent entries linked to primary via common email or phone
- **Contact Linking**: Automatically links contacts sharing email or phone number
- **Primary Conversion**: Can convert primary contacts to secondary when merging customer profiles

## ✨ Key Features

- **Smart Contact Linking**: Links contacts with common email or phone number
- **Primary/Secondary Hierarchy**: Oldest contact remains primary, newer ones become secondary
- **Contact Merging**: Converts primary contacts to secondary when linking separate profiles
- **RESTful API**: JSON-based POST endpoint
- **PostgreSQL Storage**: Optimized with indexes for performance

## 🛠 Tech Stack

- **Backend**: Node.js
- **Database**: PostgreSQL
- **Deployment**: Render
- **Version Control**: GitHub

## 📡 API Documentation

### Endpoint
```
POST /identify
```

### Request Format
```json
{
    "email": "customer@example.com",
    "phoneNumber": "1234567890"
}
```

**Note**: At least one of `email` or `phoneNumber` must be provided.

### Response Format
```json
{
    "contact": {
        "primaryContatctId": 1,
        "emails": [
            "primary@example.com",
            "secondary@example.com"
        ],
        "phoneNumbers": [
            "1234567890",
            "0987654321"
        ],
        "secondaryContactIds": [2, 3]
    }
}
```

**Response Rules:**
- `primaryContatctId`: ID of the oldest (primary) contact
- `emails`: Primary contact's email first, then secondary contacts' emails
- `phoneNumbers`: Primary contact's phone first, then secondary contacts' phones
- `secondaryContactIds`: Array of all secondary contact IDs linked to primary

### Error Response
```json
{
    "error": "At least one contact method required"
}
```

## 🗃 Database Schema

```sql
-- Contact Table Schema
DROP TABLE IF EXISTS Contact;

CREATE TABLE Contact (
    id SERIAL PRIMARY KEY,
    "phoneNumber" VARCHAR(15),
    email VARCHAR(255),
    "linkedId" INTEGER REFERENCES Contact(id),
    "linkPrecedence" VARCHAR(10) NOT NULL CHECK ("linkPrecedence" IN ('primary', 'secondary')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_email ON Contact(email) WHERE email IS NOT NULL;
CREATE INDEX idx_phone ON Contact("phoneNumber") WHERE "phoneNumber" IS NOT NULL;
CREATE INDEX idx_linkedId ON Contact("linkedId") WHERE "linkedId" IS NOT NULL;
```

## 🧪 Testing

### Test Setup
- **Endpoint**: `POST /identify`
- **Headers**: `Content-Type: application/json`
- **Initial State**: Empty database

### Comprehensive Test Cases

#### Test Case 1: New Primary Contact (Email Only)
**Request:**
```json
{
    "email": "george@hillvalley.edu"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 1,
        "emails": ["george@hillvalley.edu"],
        "phoneNumbers": [],
        "secondaryContactIds": []
    }
}
```

#### Test Case 2: New Primary Contact (Phone Only)
**Request:**
```json
{
    "phoneNumber": "123456"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": [],
        "phoneNumbers": ["123456"],
        "secondaryContactIds": []
    }
}
```

#### Test Case 3: Link to Existing Phone (Create Secondary)
**Request:**
```json
{
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "123456"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": ["mcfly@hillvalley.edu"],
        "phoneNumbers": ["123456"],
        "secondaryContactIds": [3]
    }
}
```

#### Test Case 4: Link to Existing Email (Create Secondary)
**Request:**
```json
{
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "919191"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": ["mcfly@hillvalley.edu"],
        "phoneNumbers": ["123456", "919191"],
        "secondaryContactIds": [3, 4]
    }
}
```

#### Test Case 5: Merge Two Primary Contacts
**Setup Request:**
```json
{
    "email": "biff@hillvalley.edu",
    "phoneNumber": "717171"
}
```
**Test Request:**
```json
{
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "717171"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": ["mcfly@hillvalley.edu", "biff@hillvalley.edu"],
        "phoneNumbers": ["123456", "919191", "717171"],
        "secondaryContactIds": [3, 4, 5]
    }
}
```

#### Test Case 6: Existing Contact (No New Info)
**Request:**
```json
{
    "email": "mcfly@hillvalley.edu",
    "phoneNumber": "123456"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": ["mcfly@hillvalley.edu", "biff@hillvalley.edu"],
        "phoneNumbers": ["123456", "919191", "717171"],
        "secondaryContactIds": [3, 4, 5]
    }
}
```

#### Test Case 7: Partial Match (Email Only)
**Request:**
```json
{
    "email": "mcfly@hillvalley.edu"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": ["mcfly@hillvalley.edu", "biff@hillvalley.edu"],
        "phoneNumbers": ["123456", "919191", "717171"],
        "secondaryContactIds": [3, 4, 5]
    }
}
```

#### Test Case 8: Partial Match (Phone Only)
**Request:**
```json
{
    "phoneNumber": "717171"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": ["biff@hillvalley.edu", "mcfly@hillvalley.edu"],
        "phoneNumbers": ["717171", "123456", "919191"],
        "secondaryContactIds": [3, 4, 5]
    }
}
```

#### Test Case 9: New Contact (Both New)
**Request:**
```json
{
    "email": "doc@delorean.com",
    "phoneNumber": "888888"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 6,
        "emails": ["doc@delorean.com"],
        "phoneNumbers": ["888888"],
        "secondaryContactIds": []
    }
}
```

#### Test Case 10: Link Through Secondary Contact
**Request:**
```json
{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 2,
        "emails": ["mcfly@hillvalley.edu", "biff@hillvalley.edu", "lorraine@hillvalley.edu"],
        "phoneNumbers": ["123456", "919191", "717171"],
        "secondaryContactIds": [3, 4, 5, 7]
    }
}
```

#### Test Case 11: Merge Three Contact Groups
**Setup Request:**
```json
{
    "email": "jennifer@hillvalley.edu",
    "phoneNumber": "999999"
}
```
**Test Request:**
```json
{
    "email": "jennifer@hillvalley.edu",
    "phoneNumber": "888888"
}
```
**Expected Response:**
```json
{
    "contact": {
        "primaryContatctId": 6,
        "emails": ["doc@delorean.com", "jennifer@hillvalley.edu"],
        "phoneNumbers": ["888888", "999999"],
        "secondaryContactIds": [8]
    }
}
```

#### Test Case 12: Empty Request
**Request:**
```json
{}
```
**Expected Response:**
```json
{
    "error": "At least one contact method required"
}
```

## 🚀 Setup and Deployment

### Prerequisites
- Node.js
- PostgreSQL
- GitHub account
- Render account

### Local Development
1. Clone the repository
2. Set up PostgreSQL database
3. Run the SQL schema to create tables
4. Install dependencies
5. Configure environment variables
6. Start the development server

### Production Deployment
The application is deployed on Render and connected to a PostgreSQL database. The live endpoint is ready for testing and integration.

## 🧰 Testing with Postman

**⚠️ Important: This is a POST request endpoint - make sure to test it properly in Postman**

### Postman Setup Instructions:

1. **Method**: Select `POST` (not GET)
2. **URL**: `https://bitespeed-identity-reconciliation-5pj1.onrender.com/identify`
3. **Headers**: 
   - Key: `Content-Type`
   - Value: `application/json`
4. **Body**: 
   - Select `raw` 
   - Choose `JSON` format
   - Use the JSON format shown in the test cases above

### Sample Postman Request:
```json
{
    "email": "jennifer@hillvalley.edu",
    "phoneNumber": "888880"
}
```

### Expected Response:
```json
{
    "contact": {
        "primaryContatctId": 1,
        "emails": [
            "jennifer@hillvalley.edu"
        ],
        "phoneNumbers": [
            "888880"
        ],
        "secondaryContactIds": []
    }
}
```

**Note**: Since this is a POST endpoint with JSON body input, make sure to configure Postman correctly as shown above. The endpoint will not work with GET requests.

## 📝 Notes

- The database starts empty and builds customer relationships as requests are processed
- The service maintains referential integrity through foreign key constraints
- Indexes are optimized for email and phone number lookups
- The API handles edge cases gracefully with appropriate error messages

---

**Repository**: [https://github.com/Dangi78788/bitespeed-identity-reconciliation]  
**Live Demo**: https://bitespeed-identity-reconciliation-5pj1.onrender.com/identify
