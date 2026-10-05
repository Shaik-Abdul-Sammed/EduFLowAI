import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import bcrypt from 'bcryptjs'
import { seedDeanAccount } from '../../scripts/seed-dean-account.js'

describe('Unit: Dean Account Seeding & Verification', () => {
  it('The seed script generates a valid bcrypt hash that matches Demo@2026', async () => {
    const rawPassword = 'Demo@2026'
    const hash = await bcrypt.hash(rawPassword, 10)
    
    assert.ok(hash && typeof hash === 'string', 'Generated hash must be a string')
    assert.ok(hash.startsWith('$2'), 'Must be a valid bcrypt hash format starting with $2')
    
    const isMatch = await bcrypt.compare(rawPassword, hash)
    assert.equal(isMatch, true, 'Bcrypt compare must succeed for Demo@2026')

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash)
    assert.equal(isWrongMatch, false, 'Bcrypt compare must fail for incorrect password')
  })

  it('The email and phone are stored correctly in mock database client', async () => {
    let insertedData = null

    const mockClient = {
      query: async (queryText, values) => {
        const sql = String(queryText).toLowerCase()
        if (sql.includes('select institution_id from users')) {
          return { rows: [{ institution_id: 42 }] }
        }
        if (sql.includes('information_schema.columns')) {
          return {
            rows: [
              { column_name: 'institution_id' },
              { column_name: 'role' },
              { column_name: 'email' },
              { column_name: 'password_hash' },
              { column_name: 'username' },
              { column_name: 'first_name' },
              { column_name: 'last_name' },
              { column_name: 'phone' },
              { column_name: 'metadata' },
            ]
          }
        }
        if (sql.includes('insert into users')) {
          insertedData = { queryText, values }
          return {
            rows: [
              {
                id: 101,
                email: 's9010150809@gmail.com',
                role: 'admin',
              }
            ]
          }
        }
        return { rows: [] }
      }
    }

    const seededUser = await seedDeanAccount(mockClient)
    assert.equal(seededUser.id, 101)
    assert.equal(seededUser.email, 's9010150809@gmail.com')
    assert.equal(seededUser.role, 'admin')

    assert.ok(insertedData, 'Insert query must have been called')
    assert.ok(insertedData.values.includes('s9010150809@gmail.com'), 'Email must be in insert values')
    assert.ok(insertedData.values.includes('9010150809'), 'Phone must be in insert values')
    assert.ok(insertedData.values.includes('dean'), 'Username must be in insert values')
    assert.ok(insertedData.values.includes(42), 'Admin institution ID must be used')

    // Verify the password hash stored matches Demo@2026
    const passwordHashIndex = 3
    const storedHash = insertedData.values[passwordHashIndex]
    const validPassword = await bcrypt.compare('Demo@2026', storedHash)
    assert.equal(validPassword, true, 'Stored hash must match Demo@2026')
  })
})
