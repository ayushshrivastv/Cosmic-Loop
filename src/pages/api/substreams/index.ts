/**
 * API endpoint for executing the Rust-based Substreams package
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import util from 'util';

// Convert exec to Promise-based
const execPromise = util.promisify(exec);

// Path to the Substreams package directory
const SUBSTREAMS_PACKAGE_DIR = path.join(process.cwd(), 'substreams');

/**
 * Handler for the Substreams API endpoint
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { module, params } = req.body;

    if (!module) {
      return res.status(400).json({ error: 'Module parameter is required' });
    }

    // Validate module name to prevent command injection
    if (!/^[a-zA-Z0-9_]+$/.test(module)) {
      return res.status(400).json({ error: 'Invalid module name' });
    }

    // Serialize params to JSON for command line
    const paramsJson = JSON.stringify(params || {});

    // Execute the Substreams package with the specified module and parameters
    const { stdout, stderr } = await execPromise(
      `cd ${SUBSTREAMS_PACKAGE_DIR} && ./substreams run ${module} --params='${paramsJson}'`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large outputs
    );

    if (stderr) {
      console.warn('Substreams package stderr:', stderr);
    }

    // Parse the output as JSON
    const result = JSON.parse(stdout);

    // Return the result
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error executing Substreams package:', error);

    // Check if the Substreams package directory exists
    if (!fs.existsSync(SUBSTREAMS_PACKAGE_DIR)) {
      return res.status(500).json({
        error: 'Substreams package directory not found',
        details: 'The Substreams package directory does not exist. Please make sure the package is properly installed.'
      });
    }

    // Return a more helpful error message
    return res.status(500).json({
      error: 'Error executing Substreams package',
      message: error.message,
      details: error.stderr || error.stdout || 'No additional details available'
    });
  }
}
