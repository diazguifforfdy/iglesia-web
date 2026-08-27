/**
 * Script: set-admin-role.js
 * Usage:
 * 1. Place your Firebase service account JSON at the project root as `serviceAccountKey.json`,
 *    or set env SERVICE_ACCOUNT_PATH to its path.
 * 2. Run: `node scripts/set-admin-role.js admin@iclvd.com`
 *
 * This script locates the user by email using the Admin SDK and writes
 * a document in `roles` collection with the user's uid as the doc id,
 * setting `{ role: 'admin', isAdmin: true }`.
 */

const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/set-admin-role.js user@example.com')
    process.exit(1)
  }

  const servicePath = process.env.SERVICE_ACCOUNT_PATH || path.resolve(process.cwd(), 'serviceAccountKey.json')
  if (!fs.existsSync(servicePath)) {
    console.error('Service account JSON not found at', servicePath)
    console.error('Set SERVICE_ACCOUNT_PATH env var or place serviceAccountKey.json at project root.')
    process.exit(1)
  }

  const serviceAccount = require(servicePath)

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    })

    const auth = admin.auth()
    const firestore = admin.firestore()

    console.log('Looking up user by email:', email)
    const user = await auth.getUserByEmail(email)
    console.log('Found user:', user.uid)

    const rolesRef = firestore.collection('roles').doc(user.uid)
    await rolesRef.set({ role: 'admin', isAdmin: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true })

    console.log('Role document written for uid:', user.uid)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message || err)
    process.exit(2)
  }
}

main()
