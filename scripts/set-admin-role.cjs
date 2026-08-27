const fs = require('fs')
const path = require('path')
const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node scripts/set-admin-role.cjs user@example.com')
    process.exit(1)
  }

  const servicePath = process.env.SERVICE_ACCOUNT_PATH || path.resolve(process.cwd(), 'serviceAccountKey.json')
  if (!fs.existsSync(servicePath)) {
    console.error('Service account JSON not found at', servicePath)
    process.exit(1)
  }

  const serviceAccount = require(servicePath)

  try {
    const credential = cert(serviceAccount)
    initializeApp({ credential })

    const auth = getAuth()
    const firestore = getFirestore()

    console.log('Looking up user by email:', email)
    const user = await auth.getUserByEmail(email)
    console.log('Found user:', user.uid)

    const rolesRef = firestore.collection('roles').doc(user.uid)
    await rolesRef.set({ role: 'admin', isAdmin: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

    console.log('Role document written for uid:', user.uid)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err && err.message ? err.message : err)
    process.exit(2)
  }
}

main()
