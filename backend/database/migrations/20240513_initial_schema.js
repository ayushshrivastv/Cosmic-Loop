/**
 * @file 20240513_initial_schema.js
 * @description Initial database schema for the omnichain NFT platform
 */

/**
 * @param {import('knex')} knex
 * @returns {Promise}
 */
exports.up = function (knex) {
  return knex.schema
    // Users table
    .createTable('users', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').notNullable().unique();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.jsonb('wallet_addresses').defaultTo('{}');
      table.boolean('email_verified').defaultTo(false);
      table.string('avatar_url');
      table.timestamps(true, true);
    })

    // NFT Collections table
    .createTable('nft_collections', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.string('symbol').notNullable();
      table.string('creator_address').notNullable();
      table.uuid('creator_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('base_uri');
      table.integer('max_supply');
      table.jsonb('metadata').defaultTo('{}');
      table.timestamps(true, true);
    })

    // NFTs table
    .createTable('nfts', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('collection_id').references('id').inTable('nft_collections').onDelete('CASCADE');
      table.integer('token_id').notNullable();
      table.string('owner_address').notNullable();
      table.uuid('owner_id').references('id').inTable('users').onDelete('SET NULL');
      table.string('uri').notNullable();
      table.jsonb('metadata').defaultTo('{}');
      table.string('chain').notNullable();
      table.string('contract_address').notNullable();
      table.boolean('is_compressed').defaultTo(false);
      table.timestamps(true, true);

      // Composite unique constraint
      table.unique(['collection_id', 'token_id', 'chain']);
    })

    // Bridging operations table
    .createTable('bridge_operations', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('nft_id').references('id').inTable('nfts').onDelete('CASCADE');
      table.string('source_chain').notNullable();
      table.string('source_address').notNullable();
      table.string('destination_chain').notNullable();
      table.string('destination_address').notNullable();
      table.string('source_transaction_hash');
      table.string('destination_transaction_hash');
      table.string('layerzero_message_hash');
      table.enum('status', ['pending', 'in_progress', 'completed', 'failed']).defaultTo('pending');
      table.text('error_message');
      table.timestamp('completed_at');
      table.integer('gas_fee');
      table.string('fee_token');
      table.timestamps(true, true);
    })

    // Chain verification proofs table
    .createTable('verification_proofs', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('nft_id').references('id').inTable('nfts').onDelete('CASCADE');
      table.uuid('bridge_operation_id').references('id').inTable('bridge_operations').onDelete('CASCADE');
      table.string('proof_type').notNullable();
      table.text('proof_data').notNullable();
      table.boolean('is_verified').defaultTo(false);
      table.jsonb('verification_details').defaultTo('{}');
      table.timestamps(true, true);
    })

    // Events table for tracking NFT distribution events
    .createTable('events', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.text('description');
      table.uuid('creator_id').references('id').inTable('users').onDelete('SET NULL');
      table.jsonb('target_chains').defaultTo('[]');
      table.uuid('nft_collection_id').references('id').inTable('nft_collections').onDelete('SET NULL');
      table.integer('max_participants');
      table.timestamp('start_date').notNullable();
      table.timestamp('end_date').notNullable();
      table.jsonb('distribution_rules').defaultTo('{}');
      table.enum('status', ['draft', 'active', 'completed', 'cancelled']).defaultTo('draft');
      table.timestamps(true, true);
    })

    // Event participants table
    .createTable('event_participants', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('event_id').references('id').inTable('events').onDelete('CASCADE');
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('wallet_address').notNullable();
      table.boolean('has_claimed').defaultTo(false);
      table.uuid('claimed_nft_id').references('id').inTable('nfts').onDelete('SET NULL');
      table.timestamp('claimed_at');
      table.string('claim_transaction_hash');
      table.timestamps(true, true);

      // Ensure each user can only participate once per event
      table.unique(['event_id', 'user_id']);
    })

    // Chain listeners table to track which chains are being monitored
    .createTable('chain_listeners', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('chain').notNullable();
      table.string('contract_address').notNullable();
      table.string('event_name').notNullable();
      table.bigInteger('last_block_processed').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table.jsonb('filter_criteria').defaultTo('{}');
      table.integer('confirmation_blocks').defaultTo(1);
      table.timestamps(true, true);

      // Unique constraint to prevent duplicate listeners
      table.unique(['chain', 'contract_address', 'event_name']);
    })

    // Transaction queue for handling async operations
    .createTable('transaction_queue', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('transaction_type').notNullable();
      table.jsonb('payload').notNullable();
      table.enum('status', ['pending', 'processing', 'completed', 'failed']).defaultTo('pending');
      table.integer('retry_count').defaultTo(0);
      table.integer('max_retries').defaultTo(3);
      table.text('error_message');
      table.timestamp('next_retry_at');
      table.timestamp('processed_at');
      table.timestamps(true, true);

      // Index for status to quickly find pending transactions
      table.index('status');
    });
};

/**
 * @param {import('knex')} knex
 * @returns {Promise}
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('transaction_queue')
    .dropTableIfExists('chain_listeners')
    .dropTableIfExists('event_participants')
    .dropTableIfExists('events')
    .dropTableIfExists('verification_proofs')
    .dropTableIfExists('bridge_operations')
    .dropTableIfExists('nfts')
    .dropTableIfExists('nft_collections')
    .dropTableIfExists('users');
};
